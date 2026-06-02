"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { Trophy, Users, ChevronLeft, Swords, Play, Check, X, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateMatch } from "@/app/actions/tournaments";
import { createClient } from "@/lib/supabase/client";

type Participant = { id: string; user_id?: string; profile?: { nickname: string; avatar_url?: string }; status: string; seed?: number };
type Match = {
  id: string; round: number; match_number: number; status: string;
  score_a: number; score_b: number; winner?: string;
  participant_a?: string; participant_b?: string;
  pa?: { id: string; profile?: { nickname: string } };
  pb?: { id: string; profile?: { nickname: string } };
  pw?: { id: string; profile?: { nickname: string } };
};
type Tournament = { id: string; title: string; game: string; format: string; type: string; status: string; max_slots: number; slots_taken: number; prize_pool?: string; entry_fee: number; start_at: string; rules: string };

const statusConfig = {
  open: { label: "Inscrições Abertas", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  in_progress: { label: "Em Andamento", color: "text-wolf-amber bg-wolf-amber/10 border-wolf-amber/30" },
  finished: { label: "Encerrado", color: "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20" },
  cancelled: { label: "Cancelado", color: "text-wolf-red bg-wolf-red/10 border-wolf-red/30" },
};

export function AdminTournamentDetailClient({ tournament, matches: initialMatches, participants }: {
  tournament: Tournament; matches: Match[]; participants: Participant[];
}) {
  const [matches, setMatches] = useState(initialMatches);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [tournamentStatus, setTournamentStatus] = useState(tournament.status);
  const supabase = createClient();

  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const maxRound = rounds.length;
  const roundLabel = (round: number) => {
    if (maxRound <= 1) return "Final";
    if (round === maxRound) return "Final";
    if (round === maxRound - 1) return "Semifinal";
    if (round === maxRound - 2) return "Quartas de Final";
    return `Rodada ${round}`;
  };

  async function handleUpdateStatus(status: string) {
    await supabase.from("tournaments").update({ status }).eq("id", tournament.id);
    setTournamentStatus(status);
  }

  async function handleGenerateBracket() {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newMatches = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        newMatches.push({
          tournament_id: tournament.id,
          round: 1,
          match_number: i / 2 + 1,
          participant_a: shuffled[i].id,
          participant_b: shuffled[i + 1].id,
          status: "pending",
        });
      }
    }
    const { data } = await supabase.from("tournament_matches").insert(newMatches).select("*, pa:participant_a(id, profile:profiles(nickname)), pb:participant_b(id, profile:profiles(nickname))");
    if (data) setMatches(prev => [...prev, ...data]);
  }

  function openEditMatch(match: Match) {
    setEditingMatch(match);
    setScoreA(match.score_a);
    setScoreB(match.score_b);
  }

  function handleSaveMatch() {
    if (!editingMatch) return;
    const winnerId = scoreA > scoreB ? editingMatch.participant_a : editingMatch.participant_b;
    if (!winnerId) return;
    startTransition(async () => {
      const res = await updateMatch(editingMatch.id, scoreA, scoreB, winnerId);
      if (!res?.error) {
        setMatches(prev => prev.map(m => m.id === editingMatch.id
          ? { ...m, score_a: scoreA, score_b: scoreB, winner: winnerId, status: "finished" }
          : m));
        setEditingMatch(null);
      }
    });
  }

  const statusCfg = statusConfig[tournamentStatus as keyof typeof statusConfig] ?? statusConfig.open;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/tournaments" className="flex items-center gap-1.5 text-wolf-muted hover:text-wolf-white text-sm mb-4 transition-colors">
          <ChevronLeft className="size-4" /> Voltar para Campeonatos
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("text-xs px-2.5 py-1 rounded-full border font-[family-name:var(--font-rajdhani)] font-bold", statusCfg.color)}>{statusCfg.label}</span>
              <span className="text-xs text-wolf-muted bg-wolf-surface border border-wolf-blue/15 px-2 py-0.5 rounded-full">{tournament.game}</span>
            </div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-wolf-white">{tournament.title}</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {tournamentStatus === "open" && participants.length >= 2 && (
              <Button size="sm" onClick={handleGenerateBracket} variant="outline" className="gap-2">
                <Swords className="size-3.5" /> Gerar Chave
              </Button>
            )}
            {tournamentStatus === "open" && (
              <Button size="sm" onClick={() => handleUpdateStatus("in_progress")} className="gap-2">
                <Play className="size-3.5" /> Iniciar
              </Button>
            )}
            {tournamentStatus === "in_progress" && (
              <Button size="sm" onClick={() => handleUpdateStatus("finished")} variant="outline" className="gap-2">
                <Check className="size-3.5" /> Encerrar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
          <p className="text-xs text-wolf-muted">Inscritos</p>
          <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{tournament.slots_taken}/{tournament.max_slots}</p>
        </div>
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
          <p className="text-xs text-wolf-muted">Partidas</p>
          <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{matches.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
          <p className="text-xs text-wolf-muted">Inscrição</p>
          <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{tournament.entry_fee === 0 ? "Grátis" : formatCurrency(tournament.entry_fee * 100)}</p>
        </div>
        {tournament.prize_pool && (
          <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
            <p className="text-xs text-wolf-muted">Premiação</p>
            <p className="font-[family-name:var(--font-orbitron)] font-bold text-yellow-400 text-sm">{tournament.prize_pool}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bracket */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide flex items-center gap-2">
            <Swords className="size-4 text-wolf-blue-light" /> Chave / Partidas
          </h2>
          {matches.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 bg-wolf-surface rounded-2xl border border-wolf-blue/15">
              <Trophy className="size-10 text-wolf-muted/30" />
              <p className="text-wolf-muted text-sm text-center">Chave não gerada ainda</p>
              {participants.length >= 2 ? (
                <Button size="sm" onClick={handleGenerateBracket} className="gap-2">
                  <Swords className="size-3.5" /> Gerar Chave Automaticamente
                </Button>
              ) : (
                <p className="text-xs text-wolf-muted/60">Aguardando ao menos 2 inscritos</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-6 min-w-max pb-2">
                {rounds.map(round => (
                  <div key={round} className="flex flex-col gap-3 min-w-[200px]">
                    <p className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-wolf-blue-light tracking-wider uppercase text-center">
                      {roundLabel(round)}
                    </p>
                    <div className="flex flex-col gap-4">
                      {matches.filter(m => m.round === round).map(match => {
                        const nameA = match.pa?.profile?.nickname ?? "TBD";
                        const nameB = match.pb?.profile?.nickname ?? "TBD";
                        const isFinished = match.status === "finished";
                        return (
                          <div key={match.id} className={cn("rounded-xl border overflow-hidden",
                            isFinished ? "border-wolf-blue/25 bg-wolf-surface" : "border-wolf-blue/15 bg-wolf-surface/60"
                          )}>
                            {[
                              { name: nameA, score: match.score_a, participantId: match.participant_a },
                              { name: nameB, score: match.score_b, participantId: match.participant_b },
                            ].map(({ name, score, participantId }, idx) => {
                              const isWinner = isFinished && match.winner === participantId;
                              return (
                                <div key={idx} className={cn("flex items-center gap-2 px-3 py-2.5 text-sm border-b last:border-0 border-wolf-blue/10",
                                  isWinner ? "bg-emerald-500/10" : ""
                                )}>
                                  <span className={cn("flex-1 font-[family-name:var(--font-rajdhani)] font-semibold truncate",
                                    isWinner ? "text-emerald-400" : "text-wolf-white"
                                  )}>{name}</span>
                                  {isFinished && participantId && (
                                    <span className={cn("font-[family-name:var(--font-orbitron)] font-bold", isWinner ? "text-emerald-400" : "text-wolf-muted")}>{score}</span>
                                  )}
                                </div>
                              );
                            })}
                            {!isFinished && match.participant_a && match.participant_b && (
                              <button onClick={() => openEditMatch(match)}
                                className="w-full text-xs text-wolf-blue-light bg-wolf-blue/5 hover:bg-wolf-blue/15 py-1.5 transition-colors font-[family-name:var(--font-rajdhani)] font-semibold">
                                <Edit2 className="size-3 inline mr-1" /> Registrar placar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Participants list */}
        <div className="flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide flex items-center gap-2">
            <Users className="size-4 text-wolf-blue-light" /> Inscritos ({participants.length})
          </h2>
          <div className="flex flex-col gap-2">
            {participants.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-wolf-surface border border-wolf-blue/10">
                <span className="text-xs text-wolf-muted w-5 text-center font-[family-name:var(--font-orbitron)] font-bold">{p.seed ?? idx + 1}</span>
                <span className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white text-sm flex-1">
                  {p.profile?.nickname ?? "Player"}
                </span>
                {p.status === "winner" && <span className="text-xs text-yellow-400">🏆</span>}
                {p.status === "eliminated" && <span className="text-xs text-wolf-muted line-through">elim.</span>}
              </div>
            ))}
            {participants.length === 0 && <p className="text-wolf-muted text-xs">Nenhum inscrito ainda</p>}
          </div>
        </div>
      </div>

      {/* Modal editar placar */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Registrar Placar</h2>
              <button onClick={() => setEditingMatch(null)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col gap-2 text-center">
                <p className="text-xs text-wolf-muted truncate">{editingMatch.pa?.profile?.nickname ?? "Player A"}</p>
                <input type="number" value={scoreA} onChange={e => setScoreA(Number(e.target.value))} min={0}
                  className="w-full text-center text-2xl font-[family-name:var(--font-orbitron)] font-black px-3 py-3 rounded-xl bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <span className="text-wolf-muted font-bold text-lg">×</span>
              <div className="flex-1 flex flex-col gap-2 text-center">
                <p className="text-xs text-wolf-muted truncate">{editingMatch.pb?.profile?.nickname ?? "Player B"}</p>
                <input type="number" value={scoreB} onChange={e => setScoreB(Number(e.target.value))} min={0}
                  className="w-full text-center text-2xl font-[family-name:var(--font-orbitron)] font-black px-3 py-3 rounded-xl bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white focus:outline-none focus:border-wolf-blue/50" />
              </div>
            </div>
            {scoreA !== scoreB && (
              <p className="text-center text-sm text-emerald-400 font-[family-name:var(--font-rajdhani)] font-bold">
                Vencedor: {scoreA > scoreB ? (editingMatch.pa?.profile?.nickname ?? "Player A") : (editingMatch.pb?.profile?.nickname ?? "Player B")}
              </p>
            )}
            {scoreA === scoreB && scoreA >= 0 && (
              <p className="text-center text-xs text-wolf-amber">Empate não é permitido — um dos dois deve ter mais pontos</p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setEditingMatch(null)}>Cancelar</Button>
              <Button className="flex-1" disabled={scoreA === scoreB} loading={isPending} onClick={handleSaveMatch}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
