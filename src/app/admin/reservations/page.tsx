import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatMinutes } from "@/lib/utils";
import { CalendarClock, Monitor, Gamepad2 } from "lucide-react";
import { StatusBadge } from "@/components/machines/StatusBadge";
import { Reservation } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusMap: Record<string, "free" | "busy" | "reserved" | "maintenance"> = {
  pending: "reserved",
  active: "busy",
  finished: "free",
  cancelled: "maintenance",
};

export default async function AdminReservationsPage() {
  const supabase = await createClient();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*, machine:machines(*), profile:profiles(nickname)")
    .order("start_at", { ascending: false })
    .limit(100);

  const list: Reservation[] = (reservations as Reservation[]) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Reservas
        </h1>
        <p className="text-wolf-muted text-sm mt-1">{list.length} registros</p>
      </div>

      <div className="rounded-xl overflow-hidden border border-wolf-blue/15">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-wolf-blue/15 bg-wolf-surface-2">
                {["Usuário", "Máquina", "Início", "Duração", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const Icon = r.machine?.type === "pc" ? Monitor : Gamepad2;
                return (
                  <tr key={r.id} className={cn("border-b border-wolf-blue/10 last:border-0 bg-wolf-surface transition-colors hover:bg-wolf-surface-2", i % 2 === 1 && "bg-wolf-surface/60")}>
                    <td className="px-4 py-3">
                      <span className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white">
                        {r.profile?.nickname ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className="size-3.5 text-wolf-muted shrink-0" />
                        <span className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-wolf-white">
                          {r.machine?.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-wolf-muted text-xs">{formatDateTime(r.start_at)}</td>
                    <td className="px-4 py-3">
                      <span className="text-wolf-blue-light font-[family-name:var(--font-rajdhani)] font-semibold text-xs">
                        {formatMinutes(r.duration_min)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={statusMap[r.status] ?? "free"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {list.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <CalendarClock className="size-12 text-wolf-muted/30" />
          <p className="text-wolf-muted text-sm">Nenhuma reserva registrada</p>
        </div>
      )}
    </div>
  );
}
