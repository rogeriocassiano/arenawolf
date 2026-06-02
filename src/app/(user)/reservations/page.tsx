import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Reservation } from "@/lib/types";
import { ReservationList } from "./ReservationList";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*, machine:machines(*)")
    .eq("user_id", user.id)
    .order("start_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Minhas Reservas
        </h1>
        <p className="text-wolf-muted text-sm mt-1">Histórico e reservas ativas</p>
      </div>
      <ReservationList reservations={(reservations as Reservation[]) ?? []} />
    </div>
  );
}
