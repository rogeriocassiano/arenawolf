"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const CREDIT_PACKAGES = [
  { id: "1h",      minutes: 60,  total_minutes: 60,  price_cents: 1000 },
  { id: "2h",      minutes: 120, total_minutes: 120, price_cents: 2000 },
  { id: "3h",      minutes: 180, total_minutes: 240, price_cents: 3000 },
  { id: "5h",      minutes: 300, total_minutes: 300, price_cents: 5000 },
  { id: "corujao", minutes: 480, total_minutes: 480, price_cents: 7000 },
  { id: "10h",     minutes: 600, total_minutes: 720, price_cents: 9000 },
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

  // Registra a solicitação — créditos são liberados pelo operador no balcão
  const { error: txError } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: "credit_request",
    amount: pkg.total_minutes,
    description: `Solicitação de pacote "${pkg.id}" — ${pkg.total_minutes}min (aguardando pagamento no balcão)`,
  });
  if (txError) return { error: txError.message };

  revalidatePath("/store");
  return { success: true, added: pkg.total_minutes, total: profile.credits_minutes };
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

  const { error: stockError } = await supabase
    .from("products")
    .update({ stock: product.stock - 1 })
    .eq("id", productId);
  if (stockError) return { error: stockError.message };

  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "product",
    amount: -Math.round(product.price * 100),
    description: `Compra: ${product.name}`,
  });

  revalidatePath("/store");
  return { success: true, product: product.name };
}
