import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdminTournamentDetailClient } from "./AdminTournamentDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminTournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [tournamentRes, matchesRes, participantsRes] = await Promise.all([
    supabase.from("tournaments").select("*").eq("id", id).single(),
    supabase.from("tournament_matches").select("*, pa:participant_a(id, user_id, profile:profiles(nickname)), pb:participant_b(id, user_id, profile:profiles(nickname)), pw:winner(id, user_id, profile:profiles(nickname))").eq("tournament_id", id).order("round").order("match_number"),
    supabase.from("tournament_participants").select("*, profile:profiles(nickname, avatar_url)").eq("tournament_id", id).order("seed"),
  ]);

  if (!tournamentRes.data) notFound();

  return (
    <AdminTournamentDetailClient
      tournament={tournamentRes.data}
      matches={matchesRes.data ?? []}
      participants={participantsRes.data ?? []}
    />
  );
}
