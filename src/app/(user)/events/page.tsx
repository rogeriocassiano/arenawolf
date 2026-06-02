import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EventsClient } from "./EventsClient";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [eventsRes, tournamentsRes, myRegistrationsRes] = await Promise.all([
    supabase.from("events").select("*").eq("active", true).order("start_at"),
    supabase.from("tournaments").select("*").neq("status", "cancelled").order("start_at"),
    supabase.from("tournament_participants").select("tournament_id").eq("user_id", user.id),
  ]);

  const myTournamentIds = (myRegistrationsRes.data ?? []).map(r => r.tournament_id);

  return (
    <EventsClient
      events={eventsRes.data ?? []}
      tournaments={tournamentsRes.data ?? []}
      myTournamentIds={myTournamentIds}
    />
  );
}
