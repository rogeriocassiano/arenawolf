"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus, X, Edit2, Pause, Play, Trash2, Target, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

const statusConfig = {
  draft: { label: "Rascunho", color: "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20" },
  active: { label: "Ativa", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  paused: { label: "Pausada", color: "text-wolf-amber bg-wolf-amber/10 border-wolf-amber/30" },
  finished: { label: "Encerrada", color: "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20" },
};

const PLATFORMS = ["Instagram", "Facebook", "Google Ads", "TikTok", "WhatsApp", "Email"];
const OBJECTIVES = ["Awareness", "Engajamento", "Geração de leads", "Conversão", "Retenção"];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", platform: "Instagram", objective: "Engajamento",
    budget: "", start_date: "", end_date: "", target_audience: "", description: ""
  });

  const supabase = createClient();

  useEffect(() => {
    supabase.from("marketing_campaigns").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setCampaigns(data ?? []);
      setLoading(false);
    });
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("marketing_campaigns").update({ status }).eq("id", id);
    setCampaigns(p => p.map(c => c.id === id ? { ...c, status } : c));
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Excluir campanha?")) return;
    await supabase.from("marketing_campaigns").delete().eq("id", id);
    setCampaigns(p => p.filter(c => c.id !== id));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const { data, error: err } = await supabase.from("marketing_campaigns").insert({
      name: form.name,
      platform: form.platform,
      objective: form.objective,
      budget: Number(form.budget) || 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      target_audience: form.target_audience,
      description: form.description,
      status: "draft",
    }).select().single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    setCampaigns(p => [data, ...p]);
    setShowCreate(false);
    setForm({ name: "", platform: "Instagram", objective: "Engajamento", budget: "", start_date: "", end_date: "", target_audience: "", description: "" });
  }

  const activeCampaigns = campaigns.filter(c => c.status === "active");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Campanhas</h1>
          <p className="text-wolf-muted text-sm mt-1">{campaigns.length} campanhas · {activeCampaigns.length} ativas</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0"><Plus className="size-4" /> Nova Campanha</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Ativas", value: campaigns.filter(c => c.status === "active").length, color: "text-emerald-400" },
          { label: "Rascunhos", value: campaigns.filter(c => c.status === "draft").length, color: "text-wolf-muted" },
          { label: "Pausadas", value: campaigns.filter(c => c.status === "paused").length, color: "text-wolf-amber" },
          { label: "Encerradas", value: campaigns.filter(c => c.status === "finished").length, color: "text-wolf-muted" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
            <p className="text-xs text-wolf-muted">{label}</p>
            <p className={cn("font-[family-name:var(--font-orbitron)] font-black text-2xl mt-1", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="py-20 text-center text-wolf-muted text-sm">Carregando...</div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Megaphone className="size-12 text-wolf-muted/30" />
          <p className="text-wolf-muted text-sm">Nenhuma campanha criada ainda</p>
          <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}><Plus className="size-4 mr-2" />Criar primeira campanha</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map(c => {
            const cfg = statusConfig[c.status as keyof typeof statusConfig] ?? statusConfig.draft;
            return (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/25 transition-all">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-[family-name:var(--font-rajdhani)] font-bold", cfg.color)}>{cfg.label}</span>
                    <span className="text-xs text-wolf-muted bg-wolf-surface-2 border border-wolf-blue/15 px-2 py-0.5 rounded-full">{c.platform}</span>
                    <span className="text-xs text-wolf-muted">{c.objective}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">{c.name}</h3>
                  {c.target_audience && <p className="text-xs text-wolf-muted line-clamp-1"><span className="text-wolf-muted/60">Público:</span> {c.target_audience}</p>}
                  <div className="flex items-center gap-4 text-xs text-wolf-muted flex-wrap">
                    {c.budget > 0 && <span className="text-emerald-400 font-semibold">R$ {Number(c.budget).toFixed(2)} orçamento</span>}
                    {c.start_date && <span>Início: {formatDate(c.start_date)}</span>}
                    {c.end_date && <span>Fim: {formatDate(c.end_date)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status === "active" && (
                    <button onClick={() => updateStatus(c.id, "paused")} title="Pausar" className="p-2 rounded-lg hover:bg-wolf-amber/20 text-wolf-muted hover:text-wolf-amber transition-colors">
                      <Pause className="size-4" />
                    </button>
                  )}
                  {(c.status === "paused" || c.status === "draft") && (
                    <button onClick={() => updateStatus(c.id, "active")} title="Ativar" className="p-2 rounded-lg hover:bg-emerald-500/20 text-wolf-muted hover:text-emerald-400 transition-colors">
                      <Play className="size-4" />
                    </button>
                  )}
                  <button onClick={() => deleteCampaign(c.id)} title="Excluir" className="p-2 rounded-lg hover:bg-wolf-red/20 text-wolf-muted hover:text-wolf-red transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-lg flex flex-col gap-5 my-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Nova Campanha</h2>
              <button onClick={() => setShowCreate(false)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Nome da campanha *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ex: Promoção Corujão Julho"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Plataforma</label>
                  <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                    {PLATFORMS.map(pl => <option key={pl}>{pl}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Objetivo</label>
                  <select value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                    {OBJECTIVES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Orçamento (R$)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="0.00" min={0} step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Data início</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Data fim</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Público-alvo</label>
                  <input value={form.target_audience} onChange={e => setForm(p => ({ ...p, target_audience: e.target.value }))} placeholder="Ex: Gamers 18-35 anos, BH e Grande BH"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Descrição / Notas</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Detalhes, criativo, copy..."
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50 resize-none" />
                </div>
              </div>
              {error && <p className="text-xs text-wolf-red">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={saving}>Criar Campanha</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
