"use client";

import { Reservation } from "@/lib/types";
import { formatDateTime, formatMinutes, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/machines/StatusBadge";
import { Button } from "@/components/ui/button";
import { Monitor, Gamepad2, XCircle } from "lucide-react";
import { cancelReservation } from "@/app/actions/reservations";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ReservationListProps {
  reservations: Reservation[];
}

const statusMap: Record<string, "free" | "busy" | "reserved" | "maintenance"> = {
  pending: "reserved",
  active: "busy",
  finished: "free",
  cancelled: "maintenance",
};

export function ReservationList({ reservations }: ReservationListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    setLoading(id);
    const result = await cancelReservation(id);
    if (result.success) toast.success(result.success);
    if (result.error) toast.error(result.error);
    setLoading(null);
  };

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <Monitor className="size-12 text-wolf-muted/40" />
        <p className="text-wolf-muted">Nenhuma reserva ainda</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reservations.map((r) => {
        const Icon = r.machine?.type === "pc" ? Monitor : Gamepad2;
        const canCancel = r.status === "pending";
        return (
          <div
            key={r.id}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15",
              r.status === "active" && "border-wolf-blue/40 shadow-lg shadow-wolf-blue/10"
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                r.status === "active" ? "bg-wolf-blue/20 text-wolf-blue-light" : "bg-wolf-surface-2 text-wolf-muted"
              )}>
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">
                  {r.machine?.name ?? "Máquina"}
                </p>
                <p className="text-xs text-wolf-muted">{formatDateTime(r.start_at)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-wolf-blue-light font-[family-name:var(--font-rajdhani)] font-semibold">
                    {formatMinutes(r.duration_min)}
                  </span>
                  <span className="text-wolf-muted/40 text-xs">·</span>
                  <span className="text-xs text-wolf-muted">{formatCurrency(r.total_price * 100)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              <StatusBadge status={statusMap[r.status] ?? "free"} />
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={loading === r.id}
                  onClick={() => handleCancel(r.id)}
                  className="text-wolf-red hover:text-wolf-red hover:bg-wolf-red/10 gap-1"
                >
                  <XCircle className="size-3.5" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
