"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

export async function createTournament(formData: FormData) {
  const { supabase } = await getUser();
  const { data: profile } = await supabase.from("profiles").select("role, id").eq("id", (await supabase.auth.getUser()).data.user!.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) return { error: "Sem permissão" };

  const { data, error } = await supabase.from("tournaments").insert({
    title: formData.get("title") as string,
    game: formData.get("game") as string,
    format: formData.get("format") as string,
    type: formData.get("type") as string,
    max_slots: Number(formData.get("max_slots")),
    entry_fee: Number(formData.get("entry_fee") ?? 0),
    prize_pool: formData.get("prize_pool") as string,
    start_at: formData.get("start_at") as string,
    rules: formData.get("rules") as string,
    created_by: profile.id,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath("/admin/tournaments");
  return { success: true, id: data.id };
}

export async function registerForTournament(tournamentId: string) {
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("tournament_participants").insert({ tournament_id: tournamentId, user_id: user.id });
  if (error) return { error: error.message };
  await supabase.rpc("increment_slots_taken", { tournament_id: tournamentId });
  revalidatePath(`/events/tournament/${tournamentId}`);
  return { success: true };
}

export async function updateMatch(matchId: string, scoreA: number, scoreB: number, winnerId: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("tournament_matches").update({
    score_a: scoreA,
    score_b: scoreB,
    winner: winnerId,
    status: "finished",
    finished_at: new Date().toISOString(),
  }).eq("id", matchId);
  if (error) return { error: error.message };
  revalidatePath("/admin/tournaments");
  return { success: true };
}

export async function createTeam(formData: FormData) {
  const { supabase, user } = await getUser();
  const { data, error } = await supabase.from("teams").insert({
    name: formData.get("name") as string,
    tag: formData.get("tag") as string,
    game: formData.get("game") as string,
    captain_id: user.id,
  }).select().single();
  if (error) return { error: error.message };
  await supabase.from("team_members").insert({ team_id: data.id, user_id: user.id, role: "captain" });
  revalidatePath("/ranking");
  return { success: true, teamId: data.id };
}
