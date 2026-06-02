"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) throw new Error("Sem permissão");
  return { supabase, user };
}

export async function banUser(userId: string, reason: string) {
  await requireAdmin();
  const admin = await createAdminClient();
  const { error } = await admin.from("profiles").update({ banned: true, banned_reason: reason }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function unbanUser(userId: string) {
  await requireAdmin();
  const admin = await createAdminClient();
  const { error } = await admin.from("profiles").update({ banned: false, banned_reason: null }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const admin = await createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();
  const admin = await createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function addCredits(userId: string, minutes: number) {
  const { user } = await requireAdmin();
  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("credits_minutes").eq("id", userId).single();
  const current = profile?.credits_minutes ?? 0;
  const { error } = await admin.from("profiles").update({ credits_minutes: current + minutes }).eq("id", userId);
  if (error) return { error: error.message };
  await admin.from("transactions").insert({
    user_id: userId,
    type: "credit_add",
    amount: minutes,
    description: `Créditos adicionados manualmente pelo operador (${user.id})`,
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin/financial");
  return { success: true };
}

export async function resetPassword(userId: string, newPassword: string) {
  await requireAdmin();
  const admin = await createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}
