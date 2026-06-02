import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OperatorClient } from "./OperatorClient";

export const dynamic = "force-dynamic";

export default async function OperatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/admin");
  }

  const [machinesRes, sessionsRes, usersRes] = await Promise.all([
    supabase.from("machines").select("*").order("name"),
    supabase.from("sessions")
      .select("*, profile:profiles(id, nickname, credits_minutes), machine:machines(id, name)")
      .eq("status", "active")
      .order("started_at"),
    supabase.from("profiles")
      .select("id, nickname, credits_minutes")
      .eq("role", "user")
      .eq("banned", false)
      .order("nickname")
      .limit(100),
  ]);

  return (
    <OperatorClient
      initialMachines={machinesRes.data ?? []}
      initialSessions={sessionsRes.data ?? []}
      users={usersRes.data ?? []}
    />
  );
}
