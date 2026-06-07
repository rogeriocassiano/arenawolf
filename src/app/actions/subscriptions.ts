"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function getSubscriptionPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("active", true)
    .order("monthly_price", { ascending: true });

  if (error) return { error: error.message };
  return { plans: data };
}

export async function getUserSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { subscription: null };

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plan:plan_id(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error || !data) return { subscription: null };
  return { subscription: data };
}

// Esta action seria chamada pelo webhook do Stripe
export async function handleStripeSubscription(
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  planId: string,
  status: string
) {
  const admin = await createAdminClient();

  const { data: plan } = await admin
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) return { error: "Plano não encontrado" };

  // Busca ou cria usuário pelo stripe_customer_id
  const { data: existingSub } = await admin
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (existingSub) {
    // Atualiza status
    await admin
      .from("subscriptions")
      .update({ status })
      .eq("id", existingSub.id);
  }

  return { success: true };
}

// Adicionar créditos da assinatura (chamado por cron job ou webhook)
export async function addSubscriptionCredits(subscriptionId: string) {
  const admin = await createAdminClient();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("*, plan:plan_id(*)")
    .eq("id", subscriptionId)
    .eq("status", "active")
    .single();

  if (!sub) return { error: "Assinatura não encontrada" };

  const now = new Date().toISOString();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Adiciona créditos
  await admin.from("credit_balances").insert({
    user_id: sub.user_id,
    amount: sub.credits_per_cycle,
    type: "subscription",
    source: `Assinatura ${sub.plan.name} - ${new Date().toLocaleDateString("pt-BR", { month: "long" })}`,
  });

  // Atualiza datas
  await admin
    .from("subscriptions")
    .update({
      last_credit_at: now,
      next_credit_at: nextMonth.toISOString(),
    })
    .eq("id", subscriptionId);

  // Transação
  await admin.from("transactions").insert({
    user_id: sub.user_id,
    type: "credit_add",
    amount: sub.credits_per_cycle,
    description: `Créditos mensais - ${sub.plan.name}`,
  });

  return { success: true, creditsAdded: sub.credits_per_cycle };
}

// Cancelar assinatura
export async function cancelSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const admin = await createAdminClient();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!sub) return { error: "Nenhuma assinatura ativa" };

  // Aqui integraria com Stripe para cancelar
  // await stripe.subscriptions.cancel(sub.stripe_subscription_id);

  await admin
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("status", "active");

  revalidatePath("/dashboard");
  return { success: true };
}
