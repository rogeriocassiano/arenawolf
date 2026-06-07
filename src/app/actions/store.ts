"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { creditReferralReward } from "./referral";

const CREDIT_PACKAGES = [
  { id: "1h",      minutes: 60,  price_cents: 1000 },
  { id: "2h",      minutes: 120, price_cents: 2000 },
  { id: "3h",      minutes: 180, price_cents: 3000 },
  { id: "5h",      minutes: 300, price_cents: 5000 },
  { id: "corujao", minutes: 480, price_cents: 7000 },
  { id: "10h",     minutes: 600, price_cents: 9000 },
];

export async function purchaseCreditPackage(packageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return { error: "Pacote inválido" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_minutes, nickname")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "Perfil não encontrado" };

  // Registra a solicitação — créditos são liberados pelo operador no balcão após pagamento
  const { error: txError } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: "credit_request",
    amount: pkg.minutes,
    description: `Solicitação de pacote "${pkg.id}" — ${pkg.minutes}min (aguardando pagamento no balcão)`,
  });
  if (txError) return { error: txError.message };

  revalidatePath("/store");
  return { success: true, requested: pkg.minutes };
}

export async function purchaseProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("active", true)
    .single();
  if (!product) return { error: "Produto não encontrado" };
  if (product.stock <= 0) return { error: "Produto esgotado" };

  const { data: updated, error: stockError } = await supabase
    .from("products")
    .update({ stock: product.stock - 1 })
    .eq("id", productId)
    .gt("stock", 0)   // garante atomicidade: só decrementa se ainda há estoque
    .select("id");
  if (stockError) return { error: stockError.message };
  if (!updated || updated.length === 0) return { error: "Produto esgotado" };

  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "product",
    amount: -Math.round(product.price * 100),
    description: `Compra: ${product.name}`,
  });

  // CASHBACK: 10% do valor em créditos
  const cashbackMinutes = Math.floor(product.price * 0.10 * 6); // 10% em minutos (R$ 1 = 6min)
  if (cashbackMinutes > 0) {
    const admin = await createAdminClient();
    await admin.from("credit_balances").insert({
      user_id: user.id,
      amount: cashbackMinutes,
      type: "cashback",
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), // expira em 30 dias
      source: `Cashback: ${product.name}`,
    });
    await admin.from("transactions").insert({
      user_id: user.id,
      type: "credit_add",
      amount: cashbackMinutes,
      description: `Cashback: ${product.name}`,
      related_type: "cashback",
    });
  }

  // Verifica se é primeira compra do usuário (para recompensar quem indicou)
  const { count: previousPurchases } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", "product");

  if (previousPurchases === 1) {
    // Primeira compra! Recompensar quem indicou
    await creditReferralReward(user.id);
  }

  revalidatePath("/store");
  revalidatePath("/dashboard");
  return { success: true, product: product.name, cashback: cashbackMinutes };
}
