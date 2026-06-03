"use client";

import { useState } from "react";
import { Machine, MachineStatus } from "@/lib/types";
import { StatusBadge } from "@/components/machines/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Monitor, Gamepad2, Copy, Check, Power, PowerOff, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type MachineWithMac = Machine & { mac_address?: string | null };

const STATUS_OPTIONS: MachineStatus[] = ["free", "busy", "reserved", "maintenance"];
const STATUS_LABELS: Record<MachineStatus, string> = {
  free: "Livre",
  busy: "Ocupado",
  reserved: "Reservado",
  maintenance: "Manutenção",
};

interface AdminMachinesClientProps {
  machines: MachineWithMac[];
}

export function AdminMachinesClient({ machines: initial }: AdminMachinesClientProps) {
  const [machines, setMachines] = useState<MachineWithMac[]>(initial);
  const [updating, setUpdating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingMac, setEditingMac] = useState<string | null>(null);
  const [macDraft, setMacDraft] = useState("");
  const supabase = createClient();

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

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

  const saveMac = async (id: string) => {
    const mac = macDraft.trim();
    const macRegex = /^([0-9A-Fa-f]{2}[:\-]){5}([0-9A-Fa-f]{2})$/;
    if (mac && !macRegex.test(mac)) {
      toast.error("MAC inválido. Use formato: AA:BB:CC:DD:EE:FF");
      return;
    }
    const { error } = await supabase.from("machines").update({ mac_address: mac || null }).eq("id", id);
    if (error) { toast.error("Erro ao salvar MAC."); return; }
    setMachines((prev) => prev.map((m) => m.id === id ? { ...m, mac_address: mac || null } : m));
    setEditingMac(null);
    toast.success("MAC salvo.");
  };

  const sendShutdown = async (id: string, name: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/machines/${id}/shutdown`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao enviar comando"); return; }
      toast.success(`⚡ Comando de desligamento enviado para ${name} (10s)`);
    } finally {
      setUpdating(null);
    }
  };

  const sendWakeup = async (id: string, name: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/machines/${id}/wakeup`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao enviar WoL"); return; }
      toast.success(`🟢 Magic packet enviado para ${name}`);
    } finally {
      setUpdating(null);
    }
  };

  const pcs = machines.filter((m) => m.type === "pc");
  const ps5s = machines.filter((m) => m.type === "ps5");

  const renderTable = (list: MachineWithMac[], title: string, Icon: typeof Monitor) => (
    <div className="flex flex-col gap-3">
      <h2 className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted text-xs tracking-widest uppercase flex items-center gap-2">
        <Icon className="size-3.5" /> {title}
      </h2>
      <div className="rounded-xl overflow-hidden border border-wolf-blue/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wolf-blue/15 bg-wolf-surface-2">
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Máquina</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">ID (UUID)</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">MAC Address</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Preço/h</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Alterar Status</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Energia</th>
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
                  <button onClick={() => copyId(m.id)} className="flex items-center gap-1.5 group" title="Clique para copiar o ID">
                    <span className="font-mono text-xs text-wolf-muted group-hover:text-wolf-white transition-colors truncate max-w-[120px]">{m.id}</span>
                    {copied === m.id
                      ? <Check className="size-3 text-emerald-400 shrink-0" />
                      : <Copy className="size-3 text-wolf-muted group-hover:text-wolf-blue-light shrink-0" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {editingMac === m.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={macDraft}
                        onChange={e => setMacDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") saveMac(m.id); if (e.key === "Escape") setEditingMac(null); }}
                        placeholder="AA:BB:CC:DD:EE:FF"
                        className="bg-wolf-surface-2 border border-wolf-blue/30 text-wolf-white text-xs rounded px-2 py-1 font-mono w-36 focus:outline-none focus:border-wolf-blue"
                        autoFocus
                      />
                      <button onClick={() => saveMac(m.id)} className="text-emerald-400 hover:text-emerald-300"><Check className="size-3.5" /></button>
                      <button onClick={() => setEditingMac(null)} className="text-wolf-muted hover:text-wolf-white"><X className="size-3.5" /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingMac(m.id); setMacDraft(m.mac_address ?? ""); }}
                      className="flex items-center gap-1.5 group"
                      title="Clique para editar MAC"
                    >
                      <span className={cn("font-mono text-xs", m.mac_address ? "text-wolf-white" : "text-wolf-muted italic")}>
                        {m.mac_address ?? "Não cadastrado"}
                      </span>
                      <Pencil className="size-3 text-wolf-muted group-hover:text-wolf-blue-light opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => sendWakeup(m.id, m.name)}
                      disabled={updating === m.id}
                      title={m.mac_address ? `Ligar ${m.name}` : "Cadastre o MAC para ligar remotamente"}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-[family-name:var(--font-rajdhani)] font-bold transition-all",
                        m.mac_address
                          ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15 disabled:opacity-40"
                          : "border-wolf-muted/20 text-wolf-muted cursor-not-allowed opacity-40"
                      )}
                    >
                      <Power className="size-3" /> Ligar
                    </button>
                    <button
                      onClick={() => sendShutdown(m.id, m.name)}
                      disabled={updating === m.id}
                      title={`Desligar ${m.name} remotamente`}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg border border-wolf-red/30 text-wolf-red hover:bg-wolf-red/15 text-xs font-[family-name:var(--font-rajdhani)] font-bold transition-all disabled:opacity-40"
                    >
                      <PowerOff className="size-3" /> Desligar
                    </button>
                  </div>
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
      <div className="p-3 rounded-xl bg-wolf-blue/5 border border-wolf-blue/15 text-xs text-wolf-muted">
        <span className="text-wolf-blue-light font-semibold">Wake-on-LAN:</span> Para ligar PCs remotamente, cadastre o MAC address de cada PC e configure o servidor WoL local. O MAC é encontrado no Windows com <code className="bg-wolf-surface-2 px-1 rounded">ipconfig /all</code>.
      </div>
      {renderTable(pcs, "PCs Gamer", Monitor)}
      {renderTable(ps5s, "PlayStation 5", Gamepad2)}
    </div>
  );
}
