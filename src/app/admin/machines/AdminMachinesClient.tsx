"use client";

import { useState } from "react";
import { Machine, MachineStatus } from "@/lib/types";
import { StatusBadge } from "@/components/machines/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Monitor, Gamepad2, Edit2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: MachineStatus[] = ["free", "busy", "reserved", "maintenance"];
const STATUS_LABELS: Record<MachineStatus, string> = {
  free: "Livre",
  busy: "Ocupado",
  reserved: "Reservado",
  maintenance: "Manutenção",
};

interface AdminMachinesClientProps {
  machines: Machine[];
}

export function AdminMachinesClient({ machines: initial }: AdminMachinesClientProps) {
  const [machines, setMachines] = useState<Machine[]>(initial);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  const updateStatus = async (id: string, status: MachineStatus) => {
    setUpdating(id);
    const { error } = await supabase.from("machines").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status.");
    } else {
      setMachines((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
      toast.success("Status atualizado.");
    }
    setUpdating(null);
  };

  const pcs = machines.filter((m) => m.type === "pc");
  const ps5s = machines.filter((m) => m.type === "ps5");

  const renderTable = (list: Machine[], title: string, Icon: typeof Monitor) => (
    <div className="flex flex-col gap-3">
      <h2 className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted text-xs tracking-widest uppercase flex items-center gap-2">
        <Icon className="size-3.5" /> {title}
      </h2>
      <div className="rounded-xl overflow-hidden border border-wolf-blue/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wolf-blue/15 bg-wolf-surface-2">
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Máquina</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Preço/h</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Alterar Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m, i) => (
              <tr
                key={m.id}
                className={cn(
                  "border-b border-wolf-blue/10 last:border-0 bg-wolf-surface transition-colors",
                  i % 2 === 1 && "bg-wolf-surface/50"
                )}
              >
                <td className="px-4 py-3">
                  <span className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">{m.name}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-blue-light">
                    {formatCurrency(m.price_per_hour * 100)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={m.status}
                    disabled={updating === m.id}
                    onChange={(e) => updateStatus(m.id, e.target.value as MachineStatus)}
                    className="bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-wolf-blue disabled:opacity-50 font-[family-name:var(--font-rajdhani)] font-semibold"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {renderTable(pcs, "PCs Gamer", Monitor)}
      {renderTable(ps5s, "PlayStation 5", Gamepad2)}
    </div>
  );
}
