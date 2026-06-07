"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Obter multiplicador de preço atual
export async function getCurrentPricingMultiplier(): Promise<number> {
  const supabase = await createClient();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const timeStr = now.toTimeString().slice(0, 5); // HH:MM

  // Busca regras ativas
  const { data: rules } = await supabase
    .from("dynamic_pricing_rules")
    .select("*")
    .eq("active", true)
    .order("priority", { ascending: false });

  if (!rules || rules.length === 0) return 1.0;

  // Aplica primeira regra que corresponde
  for (const rule of rules) {
    let matches = true;

    // Verifica dia da semana
    if (rule.day_of_week !== null && rule.day_of_week !== dayOfWeek) {
      matches = false;
    }

    // Verifica horário
    if (rule.start_time && rule.end_time) {
      if (timeStr < rule.start_time || timeStr >= rule.end_time) {
        matches = false;
      }
    }

    if (matches) {
      return parseFloat(rule.multiplier);
    }
  }

  return 1.0; // Preço normal se nenhuma regra aplicar
}

// Calcular preço com desconto
export async function calculatePrice(basePriceCents: number): Promise<{
  originalPrice: number;
  discountedPrice: number;
  multiplier: number;
  discountPercentage: number;
  label: string | null;
}> {
  const multiplier = await getCurrentPricingMultiplier();
  const discountedPrice = Math.round(basePriceCents * multiplier);
  const discountPercentage = Math.round((1 - multiplier) * 100);

  // Busca label da regra ativa
  const now = new Date();
  const dayOfWeek = now.getDay();
  const timeStr = now.toTimeString().slice(0, 5);

  const supabase = await createClient();
  const { data: rule } = await supabase
    .from("dynamic_pricing_rules")
    .select("name")
    .eq("active", true)
    .or(`day_of_week.is.null,day_of_week.eq.${dayOfWeek}`)
    .lte("start_time", timeStr)
    .gt("end_time", timeStr)
    .order("priority", { ascending: false })
    .limit(1)
    .single();

  return {
    originalPrice: basePriceCents,
    discountedPrice,
    multiplier,
    discountPercentage,
    label: discountPercentage > 0 ? rule?.name || `${discountPercentage}% OFF` : null,
  };
}

// Admin: listar regras de preço
export async function listPricingRules() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Sem permissão" };
  }

  const { data, error } = await admin
    .from("dynamic_pricing_rules")
    .select("*")
    .order("priority", { ascending: false });

  if (error) return { error: error.message };
  return { rules: data };
}

// Admin: criar/editar regra
export async function savePricingRule(data: {
  id?: string;
  name: string;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  multiplier: number;
  priority: number;
  active: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = data.id
    ? await admin.from("dynamic_pricing_rules").update(data).eq("id", data.id)
    : await admin.from("dynamic_pricing_rules").insert(data);

  if (error) return { error: error.message };

  revalidatePath("/admin/pricing");
  return { success: true };
}

// Admin: toggle regra
export async function togglePricingRule(ruleId: string, active: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Sem permissão" };
  }

  const { error } = await admin
    .from("dynamic_pricing_rules")
    .update({ active })
    .eq("id", ruleId);

  if (error) return { error: error.message };

  revalidatePath("/admin/pricing");
  return { success: true };
}
