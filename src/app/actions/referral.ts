"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Gera código de indicação para usuário
export async function getOrCreateReferralCode() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const admin = await createAdminClient();

  // Verifica se já tem código
  const { data: profile } = await admin
    .from("profiles")
    .select("referral_code, total_referrals")
    .eq("id", user.id)
    .single();

  if (profile?.referral_code) {
    return {
      code: profile.referral_code,
      totalReferrals: profile.total_referrals || 0,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${profile.referral_code}`,
    };
  }

  // Gera novo código
  const code = generateReferralCode();

  const { error } = await admin
    .from("profiles")
    .update({ referral_code: code })
    .eq("id", user.id);

  if (error) return { error: error.message };

  return {
    code,
    totalReferrals: 0,
    referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${code}`,
  };
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Processa indicação quando novo usuário se registra
export async function processReferral(referredUserId: string, referrerCode: string) {
  const admin = await createAdminClient();

  // Busca quem indicou
  const { data: referrer } = await admin
    .from("profiles")
    .select("id, referral_code, total_referrals")
    .eq("referral_code", referrerCode.toUpperCase())
    .single();

  if (!referrer) return { error: "Código de indicação inválido" };

  // Não pode se indicar
  if (referrer.id === referredUserId) {
    return { error: "Não pode usar seu próprio código" };
  }

  // Verifica se já foi indicado por alguém
  const { data: existing } = await admin
    .from("referral_rewards")
    .select("id")
    .eq("referred_id", referredUserId)
    .single();

  if (existing) return { error: "Usuário já foi indicado anteriormente" };

  // Cria reward pendente
  const { data: reward } = await admin
    .from("referral_rewards")
    .insert({
      referrer_id: referrer.id,
      referred_id: referredUserId,
      reward_minutes: 60, // 1h para quem indicou
      status: "pending",
    })
    .select()
    .single();

  if (reward) {
    // Atualiza referred_by no perfil
    await admin
      .from("profiles")
      .update({ referred_by: referrer.id })
      .eq("id", referredUserId);

    // Adiciona créditos bônus para quem foi indicado (30 min)
    await admin.from("credit_balances").insert({
      user_id: referredUserId,
      amount: 30,
      type: "bonus",
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      source: "Bônus de indicação",
    });

    await admin.from("transactions").insert({
      user_id: referredUserId,
      type: "credit_add",
      amount: 30,
      description: "Bônus de boas-vindas (indicação)",
      related_type: "referral",
    });
  }

  return { success: true };
}

// Credita reward quando indicado faz primeira compra
export async function creditReferralReward(referredUserId: string) {
  const admin = await createAdminClient();

  const { data: reward } = await admin
    .from("referral_rewards")
    .select("*")
    .eq("referred_id", referredUserId)
    .eq("status", "pending")
    .single();

  if (!reward) return { error: "Nenhuma recompensa pendente" };

  // Adiciona créditos para quem indicou
  await admin.from("credit_balances").insert({
    user_id: reward.referrer_id,
    amount: reward.reward_minutes,
    type: "referral",
    source: `Indicação: ${referredUserId.slice(0, 8)}`,
  });

  await admin.from("transactions").insert({
    user_id: reward.referrer_id,
    type: "credit_add",
    amount: reward.reward_minutes,
    description: "Recompensa de indicação",
    related_type: "referral",
  });

  // Atualiza status
  await admin
    .from("referral_rewards")
    .update({ status: "credited", credited_at: new Date().toISOString() })
    .eq("id", reward.id);

  // Incrementa contador
  await admin.rpc("increment", {
    table_name: "profiles",
    column_name: "total_referrals",
    row_id: reward.referrer_id,
    increment_by: 1,
  });

  return { success: true, creditedMinutes: reward.reward_minutes };
}

// Lista indicações do usuário
export async function getUserReferrals() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data, error } = await supabase
    .from("referral_rewards")
    .select("*, referred:referred_id(nickname)")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { referrals: data };
}
