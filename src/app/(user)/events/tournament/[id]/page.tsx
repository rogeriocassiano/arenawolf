import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Trophy, Users, Calendar, ChevronLeft, Swords } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [tournamentRes, matchesRes, participantsRes] = await Promise.all([
    supabase.from("tournaments").select("*").eq("id", id).single(),
    supabase.from("tournament_matches").select("*, pa:participant_a(user_id, profile:profiles(nickname)), pb:participant_b(user_id, profile:profiles(nickname)), pw:winner(user_id, profile:profiles(nickname))").eq("tournament_id", id).order("round").order("match_number"),
    supabase.from("tournament_participants").select("*, profile:profiles(nickname, avatar_url)").eq("tournament_id", id).order("seed"),
  ]);

  if (!tournamentRes.data) notFound();

  const tournament = tournamentRes.data;
  const matches = matchesRes.data ?? [];
  const participants = participantsRes.data ?? [];

  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const maxRound = rounds.length;

  const roundLabel = (round: number) => {
    if (maxRound === 1) return "Final";
    if (round === maxRound) return "Final";
    if (round === maxRound - 1) return "Semifinal";
    if (round === maxRound - 2) return "Quartas de Final";
    return `Rodada ${round}`;
  };

  const statusConfig = {
    open: { label: "Inscrições Abertas", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    in_progress: { label: "Em Andamento", color: "text-wolf-amber bg-wolf-amber/10 border-wolf-amber/30" },
    finished: { label: "Encerrado", color: "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20" },
    cancelled: { label: "Cancelado", color: "text-wolf-red bg-wolf-red/10 border-wolf-red/30" },
  };
  const statusCfg = statusConfig[tournament.status as keyof typeof statusConfig] ?? statusConfig.open;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/events" className="flex items-center gap-1.5 text-wolf-muted hover:text-wolf-white text-sm mb-4 transition-colors">
          <ChevronLeft className="size-4" /> Voltar para Eventos
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("text-xs px-2.5 py-1 rounded-full border font-[family-name:var(--font-rajdhani)] font-bold", statusCfg.color)}>
                {statusCfg.label}
              </span>
              <span className="text-xs text-wolf-muted bg-wolf-surface border border-wolf-blue/15 px-2 py-0.5 rounded-full">{tournament.game}</span>
              <span className="text-xs text-wolf-muted">{tournament.type === "solo" ? "Individual" : "Times"}</span>
            </div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
              {tournament.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 flex flex-col gap-1">
          <p className="text-xs text-wolf-muted">Inscritos</p>
          <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{tournament.slots_taken}/{tournament.max_slots}</p>
        </div>
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 flex flex-col gap-1">
          <p className="text-xs text-wolf-muted">Formato</p>
          <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">{tournament.format.replace("_", " ")}</p>
        </div>
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 flex flex-col gap-1">
          <p className="text-xs text-wolf-muted">Inscrição</p>
          <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{tournament.entry_fee === 0 ? "Grátis" : formatCurrency(tournament.entry_fee * 100)}</p>
        </div>
        {tournament.prize_pool && (
          <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 flex flex-col gap-1">
            <p className="text-xs text-wolf-muted">Premiação</p>
            <p className="font-[family-name:var(--font-orbitron)] font-bold text-yellow-400 text-sm">{tournament.prize_pool}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bracket / Matches */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-wolf-white tracking-wide flex items-center gap-2">
            <Swords className="size-5 text-wolf-blue-light" /> Chave do Torneio
          </h2>

          {matches.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 bg-wolf-surface rounded-2xl border border-wolf-blue/15">
              <Trophy className="size-10 text-wolf-muted/30" />
              <p className="text-wolf-muted text-sm">A chave será gerada quando as inscrições fecharem</p>
              {tournament.status === "open" && (
                <p className="text-xs text-wolf-muted/60">Início: {formatDateTime(tournament.start_at)}</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-max pb-2">
                {rounds.map(round => (
                  <div key={round} className="flex flex-col gap-3 min-w-[180px]">
                    <p className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-wolf-blue-light tracking-wider uppercase text-center">
                      {roundLabel(round)}
                    </p>
                    <div className="flex flex-col gap-3">
                      {matches.filter(m => m.round === round).map(match => {
                        const nameA = (match.pa as any)?.profile?.nickname ?? "TBD";
                        const nameB = (match.pb as any)?.profile?.nickname ?? "TBD";
                        const winnerId = match.winner;
                        const isFinished = match.status === "finished";
                        return (
                          <div key={match.id} className={cn("rounded-xl border overflow-hidden",
                            isFinished ? "border-wolf-blue/25 bg-wolf-surface" : "border-wolf-blue/15 bg-wolf-surface/50"
                          )}>
                            {[
                              { name: nameA, score: match.score_a, participantId: match.participant_a },
                              { name: nameB, score: match.score_b, participantId: match.participant_b },
                            ].map(({ name, score, participantId }, idx) => {
                              const isWinner = isFinished && winnerId === participantId;
                              return (
                                <div key={idx} className={cn(
                                  "flex items-center gap-2 px-3 py-2 text-sm border-b last:border-0 border-wolf-blue/10",
                                  isWinner ? "bg-emerald-500/10" : ""
                                )}>
                                  {isWinner && <span className="text-yellow-400 text-xs">★</span>}
                                  <span className={cn("flex-1 font-[family-name:var(--font-rajdhani)] font-semibold truncate",
                                    isWinner ? "text-emerald-400" : isFinished && !isWinner && participantId ? "text-wolf-muted line-through" : "text-wolf-white"
                                  )}>{name}</span>
                                  {isFinished && participantId && (
                                    <span className={cn("font-[family-name:var(--font-orbitron)] font-bold text-sm",
                                      isWinner ? "text-emerald-400" : "text-wolf-muted"
                                    )}>{score}</span>
                                  )}
                                </div>
                              );
                            })}
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

        {/* Participants */}
        <div className="flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-wolf-white tracking-wide flex items-center gap-2">
            <Users className="size-5 text-wolf-blue-light" /> Inscritos ({participants.length})
          </h2>
          {participants.length === 0 ? (
            <p className="text-wolf-muted text-sm">Nenhum inscrito ainda</p>
          ) : (
            <div className="flex flex-col gap-2">
              {participants.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-wolf-surface border border-wolf-blue/10">
                  <span className="text-xs text-wolf-muted w-5 text-center font-[family-name:var(--font-orbitron)] font-bold">{idx + 1}</span>
                  <div className="size-7 rounded-full bg-wolf-blue/20 border border-wolf-blue/25 flex items-center justify-center">
                    <span className="text-xs font-bold text-wolf-blue-light">
                      {(p as any).profile?.nickname?.slice(0, 2).toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <span className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white text-sm flex-1">
                    {(p as any).profile?.nickname ?? "Player"}
                  </span>
                  {p.status === "winner" && <span className="text-xs text-yellow-400">🏆</span>}
                  {p.status === "eliminated" && <span className="text-xs text-wolf-red">✕</span>}
                </div>
              ))}
            </div>
          )}

          {tournament.rules && (
            <div className="mt-2">
              <h3 className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-wolf-muted tracking-wider uppercase mb-2">Regras</h3>
              <p className="text-xs text-wolf-muted leading-relaxed whitespace-pre-wrap">{tournament.rules}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
