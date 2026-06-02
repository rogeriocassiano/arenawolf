"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { Trophy, Plus, X, Sword, Users, Calendar, Settings, ChevronRight, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTournament } from "@/app/actions/tournaments";
import Link from "next/link";

const GAMES = ["CS2", "Valorant", "FC 25", "League of Legends", "GTA V", "Free Fire"];
const FORMATS = [
  { value: "single_elimination", label: "Eliminação Simples" },
  { value: "double_elimination", label: "Eliminação Dupla" },
  { value: "round_robin", label: "Todos contra Todos" },
  { value: "swiss", label: "Sistema Suíço" },
];

const statusConfig = {
  open: { label: "Inscrições Abertas", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  in_progress: { label: "Em Andamento", color: "text-wolf-amber bg-wolf-amber/10 border-wolf-amber/30" },
  finished: { label: "Encerrado", color: "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20" },
  cancelled: { label: "Cancelado", color: "text-wolf-red bg-wolf-red/10 border-wolf-red/30" },
};

type Tournament = {
  id: string;
  title: string;
  game: string;
  format: string;
  type: string;
  status: string;
  max_slots: number;
  slots_taken: number;
  prize_pool?: string;
  entry_fee: number;
  start_at: string;
  participants?: { count: number }[];
};

export function AdminTournamentsClient({ tournaments }: { tournaments: Tournament[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTournament(fd);
      if (res?.error) setError(res.error);
      else if (res?.id) router.push(`/admin/tournaments/${res.id}`);
    });
  }

  const statusOrder = { in_progress: 0, open: 1, finished: 2, cancelled: 3 };
  const sorted = [...tournaments].sort((a, b) => (statusOrder[a.status as keyof typeof statusOrder] ?? 9) - (statusOrder[b.status as keyof typeof statusOrder] ?? 9));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Campeonatos</h1>
          <p className="text-wolf-muted text-sm mt-1">{tournaments.length} torneios cadastrados</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
          <Plus className="size-4" /> Novo Campeonato
        </Button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: tournaments.length, color: "text-wolf-white" },
          { label: "Abertos", value: tournaments.filter(t => t.status === "open").length, color: "text-emerald-400" },
          { label: "Em andamento", value: tournaments.filter(t => t.status === "in_progress").length, color: "text-wolf-amber" },
          { label: "Concluídos", value: tournaments.filter(t => t.status === "finished").length, color: "text-wolf-muted" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-1 p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
            <p className="text-xs text-wolf-muted">{label}</p>
            <p className={cn("font-[family-name:var(--font-orbitron)] font-black text-2xl", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Trophy className="size-12 text-wolf-muted/30" />
          <p className="text-wolf-muted text-sm">Nenhum campeonato criado ainda</p>
          <Button onClick={() => setShowCreate(true)} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> Criar primeiro campeonato
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map(t => {
            const cfg = statusConfig[t.status as keyof typeof statusConfig] ?? statusConfig.open;
            const participantCount = t.participants?.[0]?.count ?? t.slots_taken;
            return (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-[family-name:var(--font-rajdhani)] font-bold", cfg.color)}>{cfg.label}</span>
                    <span className="text-xs text-wolf-muted bg-wolf-surface-2 border border-wolf-blue/15 px-2 py-0.5 rounded-full">{t.game}</span>
                    <span className="text-xs text-wolf-muted">{t.type === "solo" ? "Individual" : "Times"}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{t.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-wolf-muted flex-wrap">
                    <span className="flex items-center gap-1"><Users className="size-3.5" />{participantCount}/{t.max_slots} inscritos</span>
                    <span className="flex items-center gap-1"><Calendar className="size-3.5" />{formatDateTime(t.start_at)}</span>
                    {t.prize_pool && <span className="text-yellow-400 font-semibold">🏆 {t.prize_pool}</span>}
                    {t.entry_fee > 0 && <span>{formatCurrency(t.entry_fee * 100)} inscrição</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/admin/tournaments/${t.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      Gerenciar <ChevronRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar campeonato */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-lg flex flex-col gap-5 my-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Novo Campeonato</h2>
              <button onClick={() => setShowCreate(false)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Título *</label>
                  <input name="title" required placeholder="Ex: Wolf Cup - CS2"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Jogo *</label>
                  <select name="game" required className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                    {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Formato *</label>
                  <select name="format" required className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                    {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Tipo *</label>
                  <select name="type" required className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                    <option value="solo">Individual (Solo)</option>
                    <option value="team">Times</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Máximo de vagas *</label>
                  <input name="max_slots" type="number" required defaultValue={16} min={2} max={256}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Taxa de inscrição (R$)</label>
                  <input name="entry_fee" type="number" defaultValue={0} min={0} step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Premiação</label>
                  <input name="prize_pool" placeholder="Ex: R$ 500 + troféu"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Data de início *</label>
                  <input name="start_at" type="datetime-local" required
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Regras</label>
                  <textarea name="rules" rows={3} placeholder="Descreva as regras do campeonato..."
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50 resize-none" />
                </div>
              </div>
              {error && <p className="text-xs text-wolf-red">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={isPending}>Criar Campeonato</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
