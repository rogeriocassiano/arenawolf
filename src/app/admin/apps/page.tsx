import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppsClient } from "./AppsClient";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) redirect("/admin");

  const [appsRes, machinesRes] = await Promise.all([
    supabase.from("apps").select("*").order("sort_order"),
    supabase.from("machines").select("id, name, type").order("name"),
  ]);

  // Para cada máquina, buscar quais apps estão habilitados
  const { data: machineApps } = await supabase
    .from("machine_apps")
    .select("machine_id, app_id, enabled");

  return (
    <AppsClient
      initialApps={appsRes.data ?? []}
      machines={machinesRes.data ?? []}
      machineApps={machineApps ?? []}
    />
  );
}
