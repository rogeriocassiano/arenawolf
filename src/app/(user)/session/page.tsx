import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SessionClient } from "./SessionClient";

export const dynamic = "force-dynamic";

export default async function SessionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, machinesRes, activeSessionRes] = await Promise.all([
    supabase.from("profiles").select("id, nickname, credits_minutes").eq("id", user.id).single(),
    supabase.from("machines")
      .select("id, name, type, status")
      .not("status", "eq", "maintenance")
      .order("name"),
    supabase.from("sessions")
      .select("*, machine:machines(id, name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <SessionClient
      profile={profileRes.data}
      machines={machinesRes.data ?? []}
      activeSession={activeSessionRes.data}
    />
  );
}
