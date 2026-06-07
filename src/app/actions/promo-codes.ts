"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9_]+$/i, "Código deve conter apenas letras, números e underscores"),
  description: z.string().optional(),
  type: z.enum(["fixed", "percentage", "bonus_hours"]),
  value: z.number().int().positive(),
  maxUses: z.number().int().positive().nullable(),
  validDays: z.number().int().positive().optional(),
});

export async function createPromoCode(data: z.infer<typeof createPromoCodeSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Sem permissão" };
  }

  const parsed = createPromoCodeSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { code, description, type, value, maxUses, validDays } = parsed.data;

  const validUntil = validDays ? new Date(Date.now() + validDays * 86400000).toISOString() : null;

  const { data: promoCode, error } = await admin.from("promo_codes").insert({
    code: code.toUpperCase(),
    description,
    type,
    value,
    max_uses: maxUses,
    valid_until: validUntil,
    created_by: user.id,
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath("/admin/promocodes");
  return { success: true, promoCode };
}

export async function listPromoCodes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Sem permissão" };
  }

  const { data, error } = await admin
    .from("promo_codes")
    .select("*, promo_code_uses(count)")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { promoCodes: data };
}

export async function togglePromoCode(codeId: string, active: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await admin.from("promo_codes").update({ active }).eq("id", codeId);
  if (error) return { error: error.message };

  revalidatePath("/admin/promocodes");
  return { success: true };
}

// Usuário resgata código
export async function redeemPromoCode(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const admin = await createAdminClient();

  // Verifica se código existe
  const { data: promoCode } = await admin
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (!promoCode) return { error: "Código inválido" };

  // Validações em JS
  const now = new Date();
  if (!promoCode.active) return { error: "Código inativo" };
  if (new Date(promoCode.valid_from) > now) return { error: "Código ainda não está válido" };
  if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
    return { error: "Código expirado" };
  }
  if (promoCode.max_uses && promoCode.uses_count >= promoCode.max_uses) {
    return { error: "Código esgotado" };
  }

  // Verifica se usuário já usou
  const { data: existingUse } = await admin
    .from("promo_code_uses")
    .select("id")
    .eq("code_id", promoCode.id)
    .eq("user_id", user.id)
    .single();

  if (existingUse) return { error: "Você já resgatou este código" };

  // Calcula créditos
  let creditsToAdd = promoCode.value;
  if (promoCode.type === "percentage") {
    // Percentual requer calcular sobre algum base — não aplicável direto
    return { error: "Tipo de código não suportado" };
  }

  // Adiciona créditos na nova tabela tipada
  const { error: creditError } = await admin.from("credit_balances").insert({
    user_id: user.id,
    amount: creditsToAdd,
    type: "promo",
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), // expira em 30 dias
    source: `Código promocional: ${promoCode.code}`,
  });

  if (creditError) return { error: creditError.message };

  // Registra uso
  await admin.from("promo_code_uses").insert({
    code_id: promoCode.id,
    user_id: user.id,
    credits_added: creditsToAdd,
  });

  // Incrementa contador
  await admin.from("promo_codes").update({ uses_count: promoCode.uses_count + 1 }).eq("id", promoCode.id);

  // Transação
  await admin.from("transactions").insert({
    user_id: user.id,
    type: "credit_add",
    amount: creditsToAdd,
    description: `Gift Card: ${promoCode.code}`,
    related_type: "promo_code",
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true, creditsAdded: creditsToAdd };
}
