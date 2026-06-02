"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado", supabase: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { error: "Acesso negado", supabase: null };
  }
  return { error: null, supabase };
}

export async function createApp(fd: FormData) {
  const { error, supabase } = await checkAdmin();
  if (error || !supabase) return { error };

  const { data: app, error: dbError } = await supabase
    .from("apps")
    .insert({
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      exe_path: fd.get("exe_path") as string,
      exe_args: fd.get("exe_args") as string,
      icon_url: fd.get("icon_url") as string,
      banner_url: fd.get("banner_url") as string,
      sort_order: Number(fd.get("sort_order") ?? 0),
      active: fd.get("active") === "true",
    })
    .select()
    .single();

  if (dbError) return { error: dbError.message };
  revalidatePath("/admin/apps");
  return { app };
}

export async function updateApp(id: string, fd: FormData) {
  const { error, supabase } = await checkAdmin();
  if (error || !supabase) return { error };

  const { error: dbError } = await supabase
    .from("apps")
    .update({
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      exe_path: fd.get("exe_path") as string,
      exe_args: fd.get("exe_args") as string,
      icon_url: fd.get("icon_url") as string,
      banner_url: fd.get("banner_url") as string,
      sort_order: Number(fd.get("sort_order") ?? 0),
      active: fd.get("active") === "true",
    })
    .eq("id", id);

  if (dbError) return { error: dbError.message };
  revalidatePath("/admin/apps");
  return { success: true };
}

export async function deleteApp(id: string) {
  const { error, supabase } = await checkAdmin();
  if (error || !supabase) return { error };

  const { error: dbError } = await supabase.from("apps").delete().eq("id", id);
  if (dbError) return { error: dbError.message };
  revalidatePath("/admin/apps");
  return { success: true };
}

export async function toggleMachineApp(machineId: string, appId: string, enabled: boolean) {
  const { error, supabase } = await checkAdmin();
  if (error || !supabase) return { error };

  const { error: dbError } = await supabase
    .from("machine_apps")
    .upsert({ machine_id: machineId, app_id: appId, enabled }, { onConflict: "machine_id,app_id" });

  if (dbError) return { error: dbError.message };
  revalidatePath("/admin/apps");
  revalidatePath("/admin/operator");
  return { success: true };
}
