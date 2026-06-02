"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatMinutes } from "@/lib/utils";
import {
  Monitor, Clock, Gamepad2, CheckCircle2, AlertTriangle,
  RefreshCw, Square, Wifi, WifiOff, Key
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Machine = { id: string; name: string; type: string; status: string };
type Session = {
  id: string; machine_id: string; started_at: string; ends_at: string; status: string;
  machine?: { id: string; name: string };
};
type Profile = { id: string; nickname: string; credits_minutes: number };

interface SessionClientProps {
  profile: Profile | null;
  machines: Machine[];
  activeSession: Session | null;
}

function Countdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    function calc() { setRemaining(Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))); }
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [endsAt]);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const isWarning = remaining < 600 && remaining > 0;
  const isExpired = remaining === 0;
  return (
    <span className={cn(
      "font-[family-name:var(--font-orbitron)] font-black text-4xl tabular-nums tracking-wider",
      isExpired ? "text-wolf-red animate-pulse" :
      isWarning ? "text-wolf-amber animate-pulse" : "text-emerald-400"
    )}>
      {h > 0 && `${String(h).padStart(2, "0")}:`}{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export function SessionClient({ profile, machines, activeSession }: SessionClientProps) {
  const [session, setSession] = useState(activeSession);
  const [machines_, setMachines] = useState(machines);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [pinExpiry, setPinExpiry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const supabase = createClient();

  // Realtime — escutar mudanças na própria sessão
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel(`session-user-${profile.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "sessions",
        filter: `user_id=eq.${profile.id}`,
      }, () => refreshSession())
      .on("postgres_changes", { event: "*", schema: "public", table: "machines" }, () => refreshMachines())
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  async function refreshSession() {
    if (!profile) return;
    const { data } = await supabase
      .from("sessions")
      .select("*, machine:machines(id, name)")
      .eq("user_id", profile.id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession(data);
  }

  async function refreshMachines() {
    const { data } = await supabase
      .from("machines").select("id, name, type, status").not("status", "eq", "maintenance").order("name");
    if (data) setMachines(data);
  }

  async function generatePin() {
    if (!selectedMachine) return;
    setLoading(true);
    setError(null);
    setPin(null);
    try {
      const res = await fetch("/api/session/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machine_id: selectedMachine.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setPin(data.pin);
      setPinExpiry(data.expires_at);
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    if (!session) return;
    setLoading(true);
    try {
      await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id, ended_by: "user" }),
      });
      setSession(null);
      setPin(null);
      setConfirmEnd(false);
      await refreshMachines();
    } finally {
      setLoading(false);
    }
  }

  const freeMachines = machines_.filter(m => m.status === "free");
  const pinSecondsLeft = pinExpiry
    ? Math.max(0, Math.floor((new Date(pinExpiry).getTime() - Date.now()) / 1000))
    : 0;

  // Sessão ativa — mostrar painel de sessão
  if (session) {
    return (
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Minha Sessão</h1>
          <p className="text-wolf-muted text-sm mt-1 flex items-center gap-2">
            {connected ? <><Wifi className="size-3.5 text-emerald-400" /> Ao vivo</> : <WifiOff className="size-3.5" />}
          </p>
        </div>

        {/* Card de sessão ativa */}
        <div className="flex flex-col gap-6 p-6 rounded-2xl bg-wolf-surface border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
              <Monitor className="size-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-wolf-muted uppercase tracking-wider font-[family-name:var(--font-rajdhani)] font-bold">Sessão Ativa</p>
              <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{session.machine?.name ?? "PC"}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-[family-name:var(--font-rajdhani)] font-bold">ATIVA</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-xs text-wolf-muted uppercase tracking-wider">Tempo restante</p>
            <Countdown endsAt={session.ends_at} />
          </div>

          {confirmEnd ? (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-wolf-red/10 border border-wolf-red/30">
              <p className="text-sm text-wolf-red font-semibold text-center">Tem certeza? O tempo não utilizado não será reembolsado.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmEnd(false)} disabled={loading}>Cancelar</Button>
                <Button className="flex-1 gap-2 bg-wolf-red hover:bg-wolf-red/80 border-wolf-red/50" loading={loading} onClick={endSession}>
                  <Square className="size-3.5" /> Confirmar Encerramento
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="gap-2 border-wolf-red/30 text-wolf-red hover:bg-wolf-red/20"
              onClick={() => setConfirmEnd(true)}>
              <Square className="size-4" /> Encerrar Sessão
            </Button>
          )}
        </div>

        <p className="text-xs text-wolf-muted text-center">
          Créditos são descontados ao encerrar. O PC é bloqueado automaticamente quando o tempo acaba.
        </p>
      </div>
    );
  }

  // Sem sessão — mostrar seleção de PC e geração de PIN
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide flex items-center gap-3">
          <Gamepad2 className="size-6 text-wolf-blue-light" /> Usar um PC
        </h1>
        <p className="text-wolf-muted text-sm mt-1">
          Selecione uma máquina, gere seu PIN e insira no PC para começar.
        </p>
      </div>

      {/* Saldo */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl border",
        (profile?.credits_minutes ?? 0) === 0
          ? "bg-wolf-red/10 border-wolf-red/30"
          : "bg-wolf-blue/10 border-wolf-blue/30"
      )}>
        <Clock className={cn("size-5", (profile?.credits_minutes ?? 0) === 0 ? "text-wolf-red" : "text-wolf-blue-light")} />
        <div>
          <p className="text-xs text-wolf-muted">Seu saldo</p>
          <p className={cn("font-[family-name:var(--font-orbitron)] font-bold", (profile?.credits_minutes ?? 0) === 0 ? "text-wolf-red" : "text-wolf-blue-light")}>
            {formatMinutes(profile?.credits_minutes ?? 0)}
          </p>
        </div>
        {(profile?.credits_minutes ?? 0) === 0 && (
          <a href="/store" className="ml-auto px-3 py-1.5 rounded-lg bg-wolf-blue text-white text-xs font-[family-name:var(--font-rajdhani)] font-bold hover:brightness-110 transition-all">
            Comprar créditos
          </a>
        )}
      </div>

      {/* Aviso sem créditos */}
      {(profile?.credits_minutes ?? 0) === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-wolf-amber/10 border border-wolf-amber/25 text-wolf-amber text-sm">
          <AlertTriangle className="size-4 shrink-0" />
          Você não tem créditos. Adquira na loja para usar um PC.
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-wolf-red/10 border border-wolf-red/25 text-wolf-red text-sm">
          <AlertTriangle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {/* PIN gerado */}
      {pin && (
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-wolf-surface border-2 border-wolf-blue/40 shadow-lg shadow-wolf-blue/10">
          <div className="flex items-center gap-2">
            <Key className="size-5 text-wolf-blue-light" />
            <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Seu PIN de acesso</p>
          </div>
          <div className="flex gap-2">
            {pin.split("").map((digit, i) => (
              <div key={i} className="w-12 h-14 flex items-center justify-center rounded-xl bg-wolf-surface-2 border border-wolf-blue/30 font-[family-name:var(--font-orbitron)] font-black text-2xl text-wolf-white">
                {digit}
              </div>
            ))}
          </div>
          <p className="text-xs text-wolf-muted text-center">
            Máquina: <span className="text-wolf-white font-semibold">{selectedMachine?.name}</span>
            {" · "}Expira em {Math.ceil(pinSecondsLeft / 60)} min
          </p>
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={generatePin} loading={loading}>
              <RefreshCw className="size-3.5" /> Novo PIN
            </Button>
            <Button size="sm" className="flex-1 gap-2" onClick={() => { setPin(null); setSelectedMachine(null); }}>
              <CheckCircle2 className="size-3.5" /> Concluído
            </Button>
          </div>
        </div>
      )}

      {/* Selecionar máquina */}
      {!pin && (
        <>
          <div>
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide mb-3">
              Selecione uma máquina
              <span className="ml-2 text-wolf-muted font-normal text-xs">({freeMachines.length} disponíveis)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {machines_.map(machine => (
                <button key={machine.id} disabled={machine.status !== "free"}
                  onClick={() => setSelectedMachine(m => m?.id === machine.id ? null : machine)}
                  className={cn(
                    "flex flex-col gap-2 p-4 rounded-xl border text-left transition-all",
                    machine.status !== "free"
                      ? "opacity-40 cursor-not-allowed bg-wolf-surface/50 border-wolf-muted/20"
                      : selectedMachine?.id === machine.id
                        ? "bg-wolf-blue/15 border-wolf-blue text-wolf-white"
                        : "bg-wolf-surface border-wolf-blue/15 hover:border-wolf-blue/40"
                  )}>
                  <div className="flex items-center gap-2">
                    <Monitor className={cn("size-4", machine.status === "free" ? "text-emerald-400" : "text-wolf-muted")} />
                    <span className="font-[family-name:var(--font-orbitron)] font-bold text-sm text-wolf-white">{machine.name}</span>
                  </div>
                  <span className={cn(
                    "text-xs font-[family-name:var(--font-rajdhani)] font-bold uppercase",
                    machine.status === "free" ? "text-emerald-400" :
                    machine.status === "busy" ? "text-wolf-red" : "text-wolf-muted"
                  )}>
                    {machine.status === "free" ? "Disponível" : machine.status === "busy" ? "Ocupada" : "Manutenção"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="gap-2 w-full sm:w-auto sm:self-start"
            size="lg"
            loading={loading}
            disabled={!selectedMachine || (profile?.credits_minutes ?? 0) === 0}
            onClick={generatePin}>
            <Key className="size-5" /> Gerar PIN para {selectedMachine?.name ?? "o PC"}
          </Button>
        </>
      )}

      {/* Instruções */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-wolf-surface/50 border border-wolf-blue/10">
        <p className="text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted uppercase tracking-wider">Como funciona</p>
        {[
          "Selecione uma máquina disponível",
          "Clique em \"Gerar PIN\" — um código de 6 dígitos aparece",
          "Vá até o PC e insira o PIN na tela de bloqueio",
          "Sua sessão inicia e o tempo começa a contar",
          "Ao encerrar (ou quando o tempo acabar), o PC bloqueia automaticamente",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="size-5 rounded-full bg-wolf-blue/20 border border-wolf-blue/30 text-wolf-blue-light text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-sm text-wolf-muted">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
