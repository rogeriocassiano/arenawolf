"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Users, User, Plus, X, Gamepad2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createTeam } from "@/app/actions/tournaments";

const GAMES = ["CS2", "Valorant", "FC 25", "League of Legends", "GTA V", "Free Fire"];
const podiumIcons = [Crown, Trophy, Medal];
const podiumColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
const podiumBg = ["bg-yellow-400/10 border-yellow-400/30", "bg-gray-400/10 border-gray-400/30", "bg-amber-600/10 border-amber-600/30"];

type RankingEntry = {
  id: string;
  points: number;
  position: number;
  game: string;
  season: string;
  profile?: { nickname: string; avatar_url?: string };
};

type Team = {
  id: string;
  name: string;
  tag: string;
  game: string;
  logo_url?: string;
  captain_id: string;
  members?: { user_id: string; role: string; profile?: { nickname: string } }[];
};

type Props = {
  rankings: RankingEntry[];
  teams: Team[];
  currentUserId: string;
};

export function RankingClient({ rankings, teams, currentUserId }: Props) {
  const [tab, setTab] = useState<"individual" | "times">("individual");
  const [selectedGame, setSelectedGame] = useState("CS2");
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", tag: "", game: "CS2" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const filteredRankings = rankings.filter(r => r.game === selectedGame);
  const filteredTeams = teams.filter(t => t.game === selectedGame);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    const fd = new FormData();
    fd.set("name", teamForm.name);
    fd.set("tag", teamForm.tag.toUpperCase());
    fd.set("game", teamForm.game);
    const res = await createTeam(fd);
    setCreating(false);
    if (res.error) setCreateError(res.error);
    else setShowCreateTeam(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
            Ranking Arena Wolf
          </h1>
          <p className="text-wolf-muted text-sm mt-1">Temporada 2025 · Partidas somente na Arena</p>
        </div>
        {tab === "times" && (
          <Button onClick={() => setShowCreateTeam(true)} size="sm" className="gap-2 shrink-0">
            <Plus className="size-4" /> Criar Time
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-wolf-surface border border-wolf-blue/15 w-fit">
        {(["individual", "times"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-[family-name:var(--font-rajdhani)] font-bold tracking-wide transition-all",
              tab === t ? "bg-wolf-blue text-white" : "text-wolf-muted hover:text-wolf-white"
            )}>
            {t === "individual" ? <User className="size-4" /> : <Users className="size-4" />}
            {t === "individual" ? "Individual" : "Times"}
          </button>
        ))}
      </div>

      {/* Game filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GAMES.map(game => (
          <button key={game} onClick={() => setSelectedGame(game)}
            className={cn("px-4 py-1.5 rounded-full border text-sm font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide transition-all whitespace-nowrap",
              selectedGame === game
                ? "bg-wolf-blue border-wolf-blue text-white"
                : "bg-wolf-surface border-wolf-blue/20 text-wolf-muted hover:border-wolf-blue/40 hover:text-wolf-white"
            )}>
            {game}
          </button>
        ))}
      </div>

      {/* Individual Ranking */}
      {tab === "individual" && (
        <>
          {/* Top 3 Podium */}
          {filteredRankings.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 0, 2].map(pos => {
                const entry = filteredRankings[pos];
                if (!entry) return <div key={pos} />;
                const Icon = podiumIcons[pos];
                return (
                  <div key={pos} className={cn("flex flex-col items-center gap-3 p-4 rounded-2xl border text-center", podiumBg[pos], pos === 0 && "order-2")}>
                    <Icon className={cn("size-6", podiumColors[pos])} />
                    <Avatar className="size-12">
                      <AvatarImage src={entry.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{entry.profile?.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white text-sm">{entry.profile?.nickname ?? "Player"}</p>
                      <p className={cn("font-[family-name:var(--font-orbitron)] font-black text-lg", podiumColors[pos])}>{entry.points}</p>
                      <p className="text-xs text-wolf-muted">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          {filteredRankings.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Trophy className="size-12 text-wolf-muted/30" />
              <p className="text-wolf-muted text-sm">Sem ranking para {selectedGame} ainda</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredRankings.map((entry, index) => {
                const isTop3 = index < 3;
                const PodiumIcon = isTop3 ? podiumIcons[index] : null;
                const isMe = entry.profile?.nickname === currentUserId;
                return (
                  <div key={entry.id}
                    className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all",
                      isMe ? "bg-wolf-blue/10 border-wolf-blue/40" :
                      isTop3 ? "bg-wolf-surface border-wolf-blue/20" :
                      "bg-wolf-surface/60 border-wolf-blue/10 hover:border-wolf-blue/20"
                    )}>
                    <div className={cn("w-8 text-center font-[family-name:var(--font-orbitron)] font-bold text-sm shrink-0",
                      isTop3 ? podiumColors[index] : "text-wolf-muted")}>
                      {PodiumIcon ? <PodiumIcon className="size-5 mx-auto" /> : `#${index + 1}`}
                    </div>
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={entry.profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{entry.profile?.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white text-sm truncate">
                        {entry.profile?.nickname ?? "Player"}
                        {isMe && <span className="ml-2 text-xs text-wolf-blue-light">(você)</span>}
                      </p>
                      <p className="text-xs text-wolf-muted">{entry.game}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("font-[family-name:var(--font-orbitron)] font-bold text-sm", isTop3 ? podiumColors[index] : "text-wolf-white")}>
                        {entry.points}
                      </p>
                      <p className="text-xs text-wolf-muted">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Times */}
      {tab === "times" && (
        <>
          {filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Users className="size-12 text-wolf-muted/30" />
              <p className="text-wolf-muted text-sm">Sem times em {selectedGame} ainda</p>
              <Button onClick={() => setShowCreateTeam(true)} size="sm" variant="outline">
                <Plus className="size-4 mr-2" /> Criar o primeiro time
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map(team => (
                <div key={team.id} className="flex flex-col gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-wolf-blue/15 border border-wolf-blue/25 flex items-center justify-center">
                      {team.logo_url
                        ? <img src={team.logo_url} className="size-full rounded-xl object-cover" alt={team.name} />
                        : <Shield className="size-6 text-wolf-blue-light" />}
                    </div>
                    <div>
                      <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">{team.name}</p>
                      <p className="text-xs text-wolf-muted">[{team.tag}] · {team.game}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {team.members?.slice(0, 5).map(m => (
                      <div key={m.user_id} className="flex items-center gap-2 text-xs">
                        <div className="size-5 rounded-full bg-wolf-surface-2 border border-wolf-blue/15 flex items-center justify-center">
                          <User className="size-3 text-wolf-muted" />
                        </div>
                        <span className="text-wolf-white font-[family-name:var(--font-rajdhani)] font-semibold">{m.profile?.nickname ?? "Player"}</span>
                        {m.role === "captain" && <span className="text-yellow-400 text-xs">★ cap</span>}
                      </div>
                    ))}
                    {(team.members?.length ?? 0) > 5 && (
                      <p className="text-xs text-wolf-muted">+{(team.members?.length ?? 0) - 5} mais</p>
                    )}
                  </div>
                  {team.captain_id === currentUserId && (
                    <p className="text-xs text-wolf-blue-light font-semibold">Você é o capitão</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal criar time */}
      {showCreateTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Criar Time</h2>
              <button onClick={() => setShowCreateTeam(false)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Nome do time *</label>
                <input value={teamForm.name} onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ex: Wolf Pack"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Tag (até 5 letras) *</label>
                <input value={teamForm.tag} onChange={e => setTeamForm(p => ({ ...p, tag: e.target.value.toUpperCase().slice(0, 5) }))} required placeholder="Ex: WOLF"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50 uppercase" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Jogo *</label>
                <select value={teamForm.game} onChange={e => setTeamForm(p => ({ ...p, game: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                  {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              {createError && <p className="text-xs text-wolf-red">{createError}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateTeam(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={creating}>Criar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
