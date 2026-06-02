"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Monitor, Clock, User, Play, Square, Plus, X, AlertTriangle,
  Zap, CheckCircle2, Wifi, WifiOff, RefreshCw, Timer
} from "lucide-react";
import { formatMinutes } from "@/lib/utils";

type Machine = { id: string; name: string; type: string; status: string };
type Session = {
  id: string; machine_id: string; user_id: string; started_at: string; ends_at: string;
  status: string;
  profile?: { id: string; nickname: string; credits_minutes: number };
  machine?: { id: string; name: string };
};
type UserProfile = { id: string; nickname: string; credits_minutes: number };

interface OperatorClientProps {
  initialMachines: Machine[];
  initialSessions: Session[];
  users: UserProfile[];
}

function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    function calc() {
      const diff = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);
  return remaining;
}

function CountdownBadge({ endsAt, onExpired }: { endsAt: string; onExpired?: () => void }) {
  const remaining = useCountdown(endsAt);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isWarning = remaining < 600 && remaining > 0;
  const isExpired = remaining === 0;

  useEffect(() => {
    if (isExpired && onExpired) onExpired();
  }, [isExpired, onExpired]);

  return (
    <span className={cn(
      "font-[family-name:var(--font-orbitron)] font-bold tabular-nums text-sm",
      isExpired ? "text-wolf-red animate-pulse" :
      isWarning ? "text-wolf-amber animate-pulse" :
      "text-emerald-400"
    )}>
      {isExpired ? "EXPIRADO" : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
    </span>
  );
}

function MachineCard({
  machine, session, onStart, onEnd, onAddTime
}: {
  machine: Machine;
  session?: Session;
  onStart: (machineId: string) => void;
  onEnd: (sessionId: string) => void;
  onAddTime: (sessionId: string) => void;
}) {
  const isBusy = session && session.status === "active";
  const isMaintenance = machine.status === "maintenance";

  return (
    <div className={cn(
      "relative flex flex-col gap-3 p-4 rounded-2xl border transition-all",
      isMaintenance ? "bg-wolf-surface/40 border-wolf-muted/20 opacity-60" :
      isBusy ? "bg-wolf-surface border-wolf-red/30 shadow-sm shadow-wolf-red/10" :
      "bg-wolf-surface border-emerald-500/25 shadow-sm shadow-emerald-500/5 hover:border-emerald-500/40"
    )}>
      {/* Status dot */}
      <div className={cn(
        "absolute top-3 right-3 size-2.5 rounded-full",
        isMaintenance ? "bg-wolf-muted" :
        isBusy ? "bg-wolf-red animate-pulse" :
        "bg-emerald-400 animate-pulse"
      )} />

      {/* Machine name */}
      <div className="flex items-center gap-2 pr-4">
        <Monitor className={cn("size-4 shrink-0",
          isBusy ? "text-wolf-red" : isMaintenance ? "text-wolf-muted" : "text-emerald-400"
        )} />
        <span className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">{machine.name}</span>
        <span className="text-xs text-wolf-muted uppercase">{machine.type}</span>
      </div>

      {/* Session info */}
      {isBusy && session ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <User className="size-3.5 text-wolf-muted shrink-0" />
            <span className="text-sm font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white truncate">
              {session.profile?.nickname ?? "Usuário"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="size-3.5 text-wolf-muted shrink-0" />
            <CountdownBadge endsAt={session.ends_at} />
          </div>
          <div className="flex gap-1.5 mt-1">
            <Button size="sm" variant="outline"
              className="flex-1 text-xs gap-1 border-wolf-amber/30 text-wolf-amber hover:bg-wolf-amber/20"
              onClick={() => onAddTime(session.id)}>
              <Plus className="size-3" /> Tempo
            </Button>
            <Button size="sm" variant="outline"
              className="flex-1 text-xs gap-1 border-wolf-red/30 text-wolf-red hover:bg-wolf-red/20"
              onClick={() => onEnd(session.id)}>
              <Square className="size-3" /> Encerrar
            </Button>
          </div>
        </div>
      ) : !isMaintenance ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-emerald-400 font-[family-name:var(--font-rajdhani)] font-bold">DISPONÍVEL</span>
          <Button size="sm" className="gap-1.5 w-full text-xs" onClick={() => onStart(machine.id)}>
            <Play className="size-3" /> Iniciar Sessão
          </Button>
        </div>
      ) : (
        <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] font-bold">MANUTENÇÃO</span>
      )}
    </div>
  );
}

export function OperatorClient({ initialMachines, initialSessions, users }: OperatorClientProps) {
  const [machines, setMachines] = useState(initialMachines);
  const [sessions, setSessions] = useState(initialSessions);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal estado
  const [startModal, setStartModal] = useState<{ machineId: string; machineName: string } | null>(null);
  const [addTimeModal, setAddTimeModal] = useState<{ sessionId: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMinutes, setSelectedMinutes] = useState("60");
  const [addMinutes, setAddMinutes] = useState("30");

  const supabase = createClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("operator-sessions")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => {
        refreshSessions();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "machines" }, () => {
        refreshMachines();
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function refreshSessions() {
    const { data } = await supabase
      .from("sessions")
      .select("*, profile:profiles(id, nickname, credits_minutes), machine:machines(id, name)")
      .eq("status", "active")
      .order("started_at");
    if (data) setSessions(data);
  }

  async function refreshMachines() {
    const { data } = await supabase.from("machines").select("*").order("name");
    if (data) setMachines(data);
  }

  async function handleStartSession() {
    if (!startModal || !selectedUser || !selectedMinutes) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machine_id: startModal.machineId,
          user_id: selectedUser,
          minutes: Number(selectedMinutes),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStartModal(null);
      setSelectedUser("");
      setSelectedMinutes("60");
      await refreshSessions();
      await refreshMachines();
    } finally {
      setLoading(false);
    }
  }

  async function handleEndSession(sessionId: string) {
    if (!confirm("Encerrar esta sessão?")) return;
    setLoading(true);
    try {
      await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, ended_by: "admin" }),
      });
      await refreshSessions();
      await refreshMachines();
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTime() {
    if (!addTimeModal) return;
    setLoading(true);
    try {
      await fetch("/api/session/add-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: addTimeModal.sessionId, minutes: Number(addMinutes) }),
      });
      setAddTimeModal(null);
      await refreshSessions();
    } finally {
      setLoading(false);
    }
  }

  const busyCount = machines.filter(m => m.status === "busy").length;
  const freeCount = machines.filter(m => m.status === "free").length;
  const warningCount = sessions.filter(s => {
    const remaining = Math.floor((new Date(s.ends_at).getTime() - Date.now()) / 1000);
    return remaining < 600 && remaining > 0;
  }).length;

  const sessionsByMachine = Object.fromEntries(sessions.map(s => [s.machine_id, s]));
  const selectedUserProfile = users.find(u => u.id === selectedUser);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide flex items-center gap-3">
            Painel Operador
            <span className={cn("size-2.5 rounded-full inline-block", connected ? "bg-emerald-400 animate-pulse" : "bg-wolf-muted")}>
            </span>
          </h1>
          <p className="text-wolf-muted text-sm mt-1 flex items-center gap-2">
            {connected ? <><Wifi className="size-3.5 text-emerald-400" /> Tempo real ativo</> : <><WifiOff className="size-3.5" /> Reconectando...</>}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { refreshSessions(); refreshMachines(); }}>
          <RefreshCw className="size-3.5" /> Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Em uso", value: busyCount, color: "text-wolf-red border-wolf-red/20", icon: Monitor },
          { label: "Disponíveis", value: freeCount, color: "text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
          { label: "Sessões ativas", value: sessions.length, color: "text-wolf-blue-light border-wolf-blue/20", icon: Zap },
          { label: "⚠ Tempo baixo", value: warningCount, color: "text-wolf-amber border-wolf-amber/20", icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={cn("p-4 rounded-xl bg-wolf-surface border flex flex-col gap-2", color.split(" ")[1])}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] uppercase tracking-wider">{label}</span>
              <Icon className={cn("size-4", color.split(" ")[0])} />
            </div>
            <p className={cn("font-[family-name:var(--font-orbitron)] text-2xl font-black", color.split(" ")[0])}>{value}</p>
          </div>
        ))}
      </div>

      {/* Grid de máquinas */}
      <div>
        <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide mb-3 flex items-center gap-2">
          <Monitor className="size-4 text-wolf-blue-light" /> Máquinas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {machines.map(machine => (
            <MachineCard
              key={machine.id}
              machine={machine}
              session={sessionsByMachine[machine.id]}
              onStart={(id) => setStartModal({ machineId: id, machineName: machine.name })}
              onEnd={handleEndSession}
              onAddTime={(id) => setAddTimeModal({ sessionId: id })}
            />
          ))}
        </div>
      </div>

      {/* Lista de sessões ativas */}
      {sessions.length > 0 && (
        <div>
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide mb-3 flex items-center gap-2">
            <Zap className="size-4 text-wolf-blue-light" /> Sessões Ativas ({sessions.length})
          </h2>
          <div className="flex flex-col gap-2">
            {sessions.map(session => {
              const remaining = Math.floor((new Date(session.ends_at).getTime() - Date.now()) / 1000);
              const isWarning = remaining < 600;
              return (
                <div key={session.id} className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  isWarning ? "bg-wolf-amber/5 border-wolf-amber/25" : "bg-wolf-surface border-wolf-blue/15"
                )}>
                  {isWarning && <AlertTriangle className="size-4 text-wolf-amber shrink-0" />}
                  <Monitor className="size-4 text-wolf-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">
                      {session.machine?.name}
                    </p>
                    <p className="text-xs text-wolf-muted">{session.profile?.nickname}</p>
                  </div>
                  <CountdownBadge endsAt={session.ends_at} onExpired={() => { refreshSessions(); refreshMachines(); }} />
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setAddTimeModal({ sessionId: session.id })}
                      className="p-1.5 rounded-lg hover:bg-wolf-amber/20 text-wolf-muted hover:text-wolf-amber transition-colors">
                      <Plus className="size-4" />
                    </button>
                    <button onClick={() => handleEndSession(session.id)}
                      className="p-1.5 rounded-lg hover:bg-wolf-red/20 text-wolf-muted hover:text-wolf-red transition-colors">
                      <Square className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Iniciar Sessão */}
      {startModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-wolf-surface border border-wolf-blue/25 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white flex items-center gap-2">
                <Play className="size-4 text-emerald-400" /> Iniciar Sessão
              </h2>
              <button onClick={() => setStartModal(null)} className="text-wolf-muted hover:text-wolf-white">
                <X className="size-4" />
              </button>
            </div>
            <p className="text-sm text-wolf-muted">Máquina: <span className="text-wolf-white font-semibold">{startModal.machineName}</span></p>

            {error && (
              <div className="p-3 rounded-lg bg-wolf-red/10 border border-wolf-red/25 text-wolf-red text-sm">{error}</div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-wolf-muted">Usuário</label>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50">
                <option value="">Selecionar usuário...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nickname} ({formatMinutes(u.credits_minutes)} disponíveis)</option>
                ))}
              </select>
            </div>

            {selectedUserProfile && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-wolf-blue/10 border border-wolf-blue/20">
                <Clock className="size-4 text-wolf-blue-light" />
                <span className="text-sm text-wolf-blue-light font-semibold">
                  {formatMinutes(selectedUserProfile.credits_minutes)} disponíveis
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-wolf-muted">Duração</label>
              <div className="grid grid-cols-4 gap-2">
                {["30", "60", "120", "180"].map(m => (
                  <button key={m} onClick={() => setSelectedMinutes(m)}
                    className={cn("py-2 rounded-lg border text-sm font-[family-name:var(--font-rajdhani)] font-bold transition-all",
                      selectedMinutes === m
                        ? "bg-wolf-blue border-wolf-blue text-white"
                        : "bg-wolf-surface-2 border-wolf-blue/20 text-wolf-muted hover:text-wolf-white"
                    )}>
                    {m}min
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input type="number" value={selectedMinutes} onChange={e => setSelectedMinutes(e.target.value)}
                  min={1} max={selectedUserProfile?.credits_minutes ?? 9999}
                  className="flex-1 px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                <span className="text-xs text-wolf-muted shrink-0">minutos</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setStartModal(null); setError(null); }}>Cancelar</Button>
              <Button className="flex-1 gap-2" loading={loading} onClick={handleStartSession}
                disabled={!selectedUser || !selectedMinutes}>
                <Play className="size-4" /> Iniciar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Tempo */}
      {addTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-wolf-surface border border-wolf-amber/25 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white flex items-center gap-2">
                <Plus className="size-4 text-wolf-amber" /> Adicionar Tempo
              </h2>
              <button onClick={() => setAddTimeModal(null)} className="text-wolf-muted hover:text-wolf-white">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["15", "30", "60"].map(m => (
                <button key={m} onClick={() => setAddMinutes(m)}
                  className={cn("py-2.5 rounded-lg border text-sm font-[family-name:var(--font-rajdhani)] font-bold transition-all",
                    addMinutes === m
                      ? "bg-wolf-amber/20 border-wolf-amber text-wolf-amber"
                      : "bg-wolf-surface-2 border-wolf-blue/20 text-wolf-muted hover:text-wolf-white"
                  )}>
                  +{m}min
                </button>
              ))}
            </div>
            <input type="number" value={addMinutes} onChange={e => setAddMinutes(e.target.value)} min={1}
              className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-amber/50" />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAddTimeModal(null)}>Cancelar</Button>
              <Button className="flex-1 gap-2 bg-wolf-amber hover:bg-wolf-amber/80 border-wolf-amber/50" loading={loading} onClick={handleAddTime}>
                <Plus className="size-4" /> Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
