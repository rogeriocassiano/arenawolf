"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Obter saldo detalhado de créditos por tipo
export async function getCreditsBalance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  // Saldos por tipo
  const { data: balances } = await supabase
    .from("credit_balances")
    .select("type, amount, expires_at")
    .eq("user_id", user.id)
    .gt("amount", 0);

  const now = new Date().toISOString();

  // Agrupa por tipo
  const summary = {
    paid: 0, // nunca expira
    bonus: 0, // expira
    promo: 0,
    cashback: 0,
    referral: 0,
    subscription: 0,
    expiringSoon: 0, // expira em 7 dias
    expired: 0,
    total: 0,
  };

  const expiringItems: Array<{
    amount: number;
    expiresAt: string;
    daysLeft: number;
  }> = [];

  for (const item of balances || []) {
    const isExpired = item.expires_at && item.expires_at < now;
    const isExpiringSoon =
      item.expires_at &&
      item.expires_at > now &&
      item.expires_at < new Date(Date.now() + 7 * 86400000).toISOString();

    if (isExpired) {
      summary.expired += item.amount;
    } else {
      summary[item.type as keyof typeof summary] += item.amount;
      summary.total += item.amount;

      if (isExpiringSoon) {
        summary.expiringSoon += item.amount;
        const daysLeft = Math.ceil(
          (new Date(item.expires_at).getTime() - Date.now()) / 86400000
        );
        expiringItems.push({
          amount: item.amount,
          expiresAt: item.expires_at,
          daysLeft,
        });
      }
    }
  }

  // Adiciona saldo antigo da tabela profiles (para compatibilidade)
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_minutes")
    .eq("id", user.id)
    .single();

  if (profile && profile.credits_minutes > summary.total) {
    summary.paid += profile.credits_minutes - summary.total;
    summary.total = profile.credits_minutes;
  }

  return {
    summary,
    expiringItems: expiringItems.sort((a, b) => a.daysLeft - b.daysLeft),
  };
}

// Histórico de transações
export async function getCreditsHistory(limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return { transactions: data };
}

// Transferir créditos para outro usuário
export async function transferCredits(toUserId: string, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  if (!amount || amount <= 0) return { error: "Quantidade inválida" };
  if (user.id === toUserId) return { error: "Não pode transferir para si mesmo" };

  const admin = await createAdminClient();

  // Verifica saldo
  const { data: profile } = await admin
    .from("profiles")
    .select("credits_minutes, nickname")
    .eq("id", user.id)
    .single();

  if (!profile || profile.credits_minutes < amount) {
    return { error: "Créditos insuficientes" };
  }

  // Verifica destinatário
  const { data: toProfile } = await admin
    .from("profiles")
    .select("nickname")
    .eq("id", toUserId)
    .single();

  if (!toProfile) return { error: "Usuário destinatário não encontrado" };

  // Taxa de transferência: 5%
  const fee = Math.ceil(amount * 0.05);
  const netAmount = amount - fee;

  // Debita remetente
  await admin
    .from("profiles")
    .update({ credits_minutes: profile.credits_minutes - amount })
    .eq("id", user.id);

  // Credita destinatário
  await admin
    .from("profiles")
    .update({ credits_minutes: (toProfile as { credits_minutes?: number }).credits_minutes || 0 + netAmount })
    .eq("id", toUserId);

  // Transações
  await admin.from("transactions").insert([
    {
      user_id: user.id,
      type: "credit_transfer_sent",
      amount: -amount,
      description: `Transferência para ${toProfile.nickname} (taxa: ${fee}min)`,
    },
    {
      user_id: toUserId,
      type: "credit_transfer_received",
      amount: netAmount,
      description: `Transferência de ${profile.nickname}`,
    },
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true, transferred: netAmount, fee };
}

// Buscar usuário por nickname (para transferência)
export async function findUserByNickname(nickname: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url")
    .ilike("nickname", `%${nickname}%`)
    .limit(10);

  if (error) return { error: error.message };
  return { users: data?.filter((u) => u.id !== user.id) || [] };
}

// Consumir créditos (para sessões)
export async function consumeCredits(amount: number, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const admin = await createAdminClient();

  // Estratégia: consumir primeiro os que expiram mais cedo
  const { data: balances } = await admin
    .from("credit_balances")
    .select("id, amount, expires_at, type")
    .eq("user_id", user.id)
    .gt("amount", 0)
    .order("expires_at", { ascending: true, nullsFirst: false });

  let remainingToConsume = amount;
  const consumedFrom: Array<{ type: string; amount: number }> = [];

  for (const balance of balances || []) {
    if (remainingToConsume <= 0) break;

    const consumeFromThis = Math.min(balance.amount, remainingToConsume);
    remainingToConsume -= consumeFromThis;

    // Atualiza ou deleta
    if (balance.amount === consumeFromThis) {
      await admin.from("credit_balances").delete().eq("id", balance.id);
    } else {
      await admin
        .from("credit_balances")
        .update({ amount: balance.amount - consumeFromThis })
        .eq("id", balance.id);
    }

    consumedFrom.push({ type: balance.type, amount: consumeFromThis });
  }

  // Se ainda faltou, tenta do saldo antigo
  if (remainingToConsume > 0) {
    const { data: profile } = await admin
      .from("profiles")
      .select("credits_minutes")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits_minutes < remainingToConsume) {
      return { error: "Créditos insuficientes" };
    }

    await admin
      .from("profiles")
      .update({ credits_minutes: profile.credits_minutes - remainingToConsume })
      .eq("id", user.id);

    consumedFrom.push({ type: "legacy", amount: remainingToConsume });
  }

  // Transação
  await admin.from("transactions").insert({
    user_id: user.id,
    type: "credit_use",
    amount: -amount,
    description: reason,
  });

  return { success: true, consumedFrom };
}
