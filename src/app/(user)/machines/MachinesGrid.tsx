"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Machine } from "@/lib/types";
import { MachineCard } from "@/components/machines/MachineCard";
import { ReserveModal } from "./ReserveModal";
import { Monitor, Gamepad2, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface MachinesGridProps {
  initialMachines: Machine[];
}

export function MachinesGrid({ initialMachines }: MachinesGridProps) {
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [filter, setFilter] = useState<"all" | "pc" | "ps5">("all");
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("machines-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "machines" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setMachines((prev) =>
              prev.map((m) =>
                m.id === payload.new.id ? { ...m, ...(payload.new as Machine) } : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const filtered = machines.filter((m) => filter === "all" || m.type === filter);
  const pcs = filtered.filter((m) => m.type === "pc");
  const ps5s = filtered.filter((m) => m.type === "ps5");

  const freeCount = machines.filter((m) => m.status === "free").length;

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Status bar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-wolf-surface border border-emerald-500/20 w-fit">
          <Wifi className="size-3.5 text-emerald-400" />
          <span className="text-xs font-[family-name:var(--font-rajdhani)] font-semibold text-emerald-400 tracking-wide">
            AO VIVO
          </span>
          <span className="text-xs text-wolf-muted">·</span>
          <span className="text-xs text-wolf-muted">{freeCount} disponíveis agora</span>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {(["all", "pc", "ps5"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide transition-all",
                filter === f
                  ? "bg-wolf-blue/20 text-wolf-blue-light border border-wolf-blue/30"
                  : "text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2 border border-transparent"
              )}
            >
              {f === "all" && "Todos"}
              {f === "pc" && <><Monitor className="size-3.5" /> PCs</>}
              {f === "ps5" && <><Gamepad2 className="size-3.5" /> PS5</>}
            </button>
          ))}
        </div>

        {/* PCs */}
        {(filter === "all" || filter === "pc") && pcs.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted text-xs tracking-widest uppercase flex items-center gap-2">
              <Monitor className="size-3.5" /> PCs Gamer
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {pcs.map((machine) => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  onReserve={setSelectedMachine}
                />
              ))}
            </div>
          </div>
        )}

        {/* PS5 */}
        {(filter === "all" || filter === "ps5") && ps5s.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted text-xs tracking-widest uppercase flex items-center gap-2">
              <Gamepad2 className="size-3.5" /> PlayStation 5
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ps5s.map((machine) => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  onReserve={setSelectedMachine}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedMachine && (
        <ReserveModal
          machine={selectedMachine}
          onClose={() => setSelectedMachine(null)}
        />
      )}
    </>
  );
}
