import { createClient } from "@/lib/supabase/server";
import { AdminTournamentsClient } from "./AdminTournamentsClient";

export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, participants:tournament_participants(count)")
    .order("start_at", { ascending: false });

  return <AdminTournamentsClient tournaments={tournaments ?? []} />;
}
