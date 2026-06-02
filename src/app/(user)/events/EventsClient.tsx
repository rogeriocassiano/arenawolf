"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Sword, Users, Calendar, Moon, Trophy, Gamepad2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { registerForTournament } from "@/app/actions/tournaments";

const eventTypeConfig = {
  corujao: { label: "Corujão", icon: Moon, color: "text-purple-400 bg-purple-500/15 border-purple-500/30" },
  campeonato: { label: "Campeonato", icon: Sword, color: "text-wolf-red bg-wolf-red/15 border-wolf-red/30" },
  evento: { label: "Evento", icon: Calendar, color: "text-wolf-blue-light bg-wolf-blue/15 border-wolf-blue/30" },
};

const tournamentStatusConfig = {
  open: { label: "Inscrições abertas", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
  in_progress: { label: "Em andamento", color: "text-wolf-amber bg-wolf-amber/15 border-wolf-amber/30" },
  finished: { label: "Encerrado", color: "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20" },
  cancelled: { label: "Cancelado", color: "text-wolf-red bg-wolf-red/15 border-wolf-red/30" },
};

type Event = { id: string; title: string; type: string; description: string; start_at: string; end_at: string; price: number; max_slots: number; slots_taken: number; requires_advance_payment: boolean; active: boolean };
type Tournament = { id: string; title: string; game: string; format: string; type: string; status: string; max_slots: number; slots_taken: number; prize_pool?: string; entry_fee: number; start_at: string };

type Props = { events: Event[]; tournaments: Tournament[]; myTournamentIds: string[] };

export function EventsClient({ events, tournaments, myTournamentIds }: Props) {
  const [tab, setTab] = useState<"eventos" | "campeonatos">("eventos");
  const [registering, setRegistering] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Set<string>>(new Set(myTournamentIds));
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleRegister(tournamentId: string) {
    setRegistering(tournamentId);
    const res = await registerForTournament(tournamentId);
    setRegistering(null);
    if (res?.error) setErrors(p => ({ ...p, [tournamentId]: res.error! }));
    else setRegistered(p => new Set([...p, tournamentId]));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Eventos</h1>
        <p className="text-wolf-muted text-sm mt-1">Corujões, campeonatos e eventos da Arena Wolf</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-wolf-surface border border-wolf-blue/15 w-fit">
        <button onClick={() => setTab("eventos")}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-[family-name:var(--font-rajdhani)] font-bold tracking-wide transition-all",
            tab === "eventos" ? "bg-wolf-blue text-white" : "text-wolf-muted hover:text-wolf-white")}>
          <Calendar className="size-4" /> Eventos
        </button>
        <button onClick={() => setTab("campeonatos")}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-[family-name:var(--font-rajdhani)] font-bold tracking-wide transition-all",
            tab === "campeonatos" ? "bg-wolf-blue text-white" : "text-wolf-muted hover:text-wolf-white")}>
          <Trophy className="size-4" /> Campeonatos
        </button>
      </div>

      {/* EVENTOS */}
      {tab === "eventos" && (
        <>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Sword className="size-12 text-wolf-muted/30" />
              <p className="text-wolf-muted text-sm">Nenhum evento agendado no momento</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => {
                const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig] ?? eventTypeConfig.evento;
                const Icon = config.icon;
                const spotsLeft = event.max_slots - event.slots_taken;
                const isFull = spotsLeft <= 0;
                return (
                  <div key={event.id} className="flex flex-col gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-[family-name:var(--font-rajdhani)] font-bold tracking-wide", config.color)}>
                        <Icon className="size-3" /> {config.label}
                      </div>
                      {isFull && <span className="text-xs text-wolf-red bg-wolf-red/10 border border-wolf-red/20 px-2 py-0.5 rounded-full">Lotado</span>}
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm leading-snug">{event.title}</h3>
                      <p className="text-xs text-wolf-muted mt-1 line-clamp-2">{event.description}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-wolf-muted">
                      <div className="flex items-center gap-1.5"><Calendar className="size-3.5" />{formatDateTime(event.start_at)}</div>
                      <div className="flex items-center gap-1.5"><Users className="size-3.5" />
                        {isFull ? "Vagas esgotadas" : `${spotsLeft} vaga${spotsLeft !== 1 ? "s" : ""} disponível`}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white">
                        {event.price === 0 ? "Grátis" : formatCurrency(event.price * 100)}
                        {event.requires_advance_payment && <span className="text-xs text-wolf-muted font-normal ml-1">(50% antecipado)</span>}
                      </p>
                      <Button size="sm" disabled={isFull} variant={isFull ? "ghost" : "default"}>
                        {isFull ? "Lotado" : "Inscrever"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* CAMPEONATOS */}
      {tab === "campeonatos" && (
        <>
          {tournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Trophy className="size-12 text-wolf-muted/30" />
              <p className="text-wolf-muted text-sm">Nenhum campeonato disponível agora</p>
              <p className="text-xs text-wolf-muted/60">Fique de olho! O admin cria os campeonatos aqui.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {tournaments.map(t => {
                const statusCfg = tournamentStatusConfig[t.status as keyof typeof tournamentStatusConfig] ?? tournamentStatusConfig.open;
                const spotsLeft = t.max_slots - t.slots_taken;
                const isRegistered = registered.has(t.id);
                const isFull = spotsLeft <= 0;
                const isOpen = t.status === "open";
                return (
                  <div key={t.id} className="flex flex-col gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-[family-name:var(--font-rajdhani)] font-bold tracking-wide", statusCfg.color)}>
                        {statusCfg.label}
                      </div>
                      <span className="text-xs text-wolf-muted bg-wolf-surface-2 border border-wolf-blue/15 px-2 py-0.5 rounded-full">{t.game}</span>
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">{t.title}</h3>
                      <p className="text-xs text-wolf-muted mt-1">
                        {t.type === "solo" ? "Individual" : "Times"} · {t.format.replace("_", " ")}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-wolf-surface-2 border border-wolf-blue/10">
                        <p className="text-wolf-muted">Vagas</p>
                        <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{t.slots_taken}/{t.max_slots}</p>
                      </div>
                      <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-wolf-surface-2 border border-wolf-blue/10">
                        <p className="text-wolf-muted">Inscrição</p>
                        <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{t.entry_fee === 0 ? "Grátis" : formatCurrency(t.entry_fee * 100)}</p>
                      </div>
                      {t.prize_pool && (
                        <div className="col-span-2 flex flex-col gap-0.5 p-2.5 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
                          <p className="text-wolf-muted">Premiação</p>
                          <p className="font-[family-name:var(--font-rajdhani)] font-bold text-yellow-400">{t.prize_pool}</p>
                        </div>
                      )}
                      <div className="col-span-2 flex items-center gap-1.5 text-wolf-muted">
                        <Calendar className="size-3.5" />{formatDateTime(t.start_at)}
                      </div>
                    </div>
                    {errors[t.id] && <p className="text-xs text-wolf-red">{errors[t.id]}</p>}
                    <div className="flex gap-2 mt-auto">
                      <Link href={`/events/tournament/${t.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                          Ver chave <ChevronRight className="size-3" />
                        </Button>
                      </Link>
                      {isOpen && !isRegistered && !isFull && (
                        <Button size="sm" className="flex-1" loading={registering === t.id} onClick={() => handleRegister(t.id)}>
                          Inscrever
                        </Button>
                      )}
                      {isRegistered && (
                        <span className="flex-1 text-center text-xs text-emerald-400 font-semibold self-center">✓ Inscrito</span>
                      )}
                      {isFull && !isRegistered && (
                        <Button size="sm" disabled className="flex-1">Lotado</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
