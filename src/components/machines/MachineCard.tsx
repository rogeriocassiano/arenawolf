"use client";

import { Machine } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Monitor, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MachineCardProps {
  machine: Machine;
  onReserve?: (machine: Machine) => void;
  compact?: boolean;
}

const glowByStatus = {
  free: "shadow-emerald-500/20 hover:shadow-emerald-500/40 border-emerald-500/30",
  busy: "shadow-wolf-red/10 border-wolf-red/30",
  reserved: "shadow-amber-500/10 border-amber-500/30",
  maintenance: "shadow-wolf-muted/10 border-wolf-muted/20",
};

export function MachineCard({ machine, onReserve, compact = false }: MachineCardProps) {
  const Icon = machine.type === "pc" ? Monitor : Gamepad2;
  const isFree = machine.status === "free";

  return (
    <div
      className={cn(
        "rounded-xl bg-wolf-surface border transition-all duration-300 p-4 flex flex-col gap-3",
        "shadow-lg hover:shadow-xl",
        glowByStatus[machine.status],
        isFree && "glow-blue cursor-pointer",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isFree ? "bg-wolf-blue/20 text-wolf-blue-light" : "bg-wolf-surface-2 text-wolf-muted"
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide">
              {machine.name}
            </p>
            <p className="text-xs text-wolf-muted">
              {machine.type === "pc" ? "PC Gamer" : "PlayStation 5"}
            </p>
          </div>
        </div>
        <StatusBadge status={machine.status} />
      </div>

      {!compact && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-wolf-muted">Valor/hora</span>
            <span className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-blue-light">
              {formatCurrency(machine.price_per_hour * 100)}
            </span>
          </div>

          {isFree && onReserve && (
            <Button
              size="sm"
              onClick={() => onReserve(machine)}
              className="w-full mt-1"
            >
              Reservar
            </Button>
          )}

          {!isFree && (
            <div className="h-8 flex items-center justify-center rounded-md bg-wolf-surface-2 border border-wolf-blue/10">
              <span className="text-xs text-wolf-muted">
                {machine.status === "reserved" ? "Já reservado" : machine.status === "maintenance" ? "Em manutenção" : "Ocupado agora"}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
