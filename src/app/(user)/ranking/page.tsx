import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RankingClient } from "./RankingClient";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [rankingsRes, teamsRes, profileRes] = await Promise.all([
    supabase.from("rankings").select("*, profile:profiles(nickname, avatar_url)").order("points", { ascending: false }).limit(100),
    supabase.from("teams").select("*, members:team_members(user_id, role, profile:profiles(nickname))").order("name"),
    supabase.from("profiles").select("nickname").eq("id", user.id).single(),
  ]);

  return (
    <RankingClient
      rankings={rankingsRes.data ?? []}
      teams={teamsRes.data ?? []}
      currentUserId={profileRes.data?.nickname ?? user.id}
    />
  );
}
