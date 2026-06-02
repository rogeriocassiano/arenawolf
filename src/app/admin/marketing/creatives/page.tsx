"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Plus, X, Link as LinkIcon, Trash2, ImageIcon, FileText, Film, Sparkles, Bot, Loader2, Copy, Check, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ASSET_TYPES = ["image", "video", "copy", "template"];
const typeConfig = {
  image: { label: "Imagem", icon: ImageIcon, color: "text-pink-400 bg-pink-500/10 border-pink-500/25" },
  video: { label: "Vídeo", icon: Film, color: "text-purple-400 bg-purple-500/10 border-purple-500/25" },
  copy: { label: "Copy/Texto", icon: FileText, color: "text-wolf-amber bg-wolf-amber/10 border-wolf-amber/25" },
  template: { label: "Template", icon: Palette, color: "text-wolf-blue-light bg-wolf-blue/10 border-wolf-blue/25" },
};

const AI_PROMPTS = [
  { label: "Post Instagram — Promoção", prompt: "Crie um copy criativo e envolvente para um post de Instagram anunciando: " },
  { label: "Story — Urgência", prompt: "Crie um texto curto e impactante para Stories do Instagram com senso de urgência sobre: " },
  { label: "Legenda Reels", prompt: "Crie uma legenda engajante com emojis e hashtags para um Reels da Arena Wolf sobre: " },
  { label: "Anúncio Facebook", prompt: "Crie o texto de um anúncio de Facebook Ads (headline + descrição + CTA) para: " },
  { label: "WhatsApp — Oferta", prompt: "Crie uma mensagem de WhatsApp direta e persuasiva para divulgar para clientes: " },
  { label: "Email Marketing", prompt: "Crie o assunto e corpo de um email marketing para clientes da Arena Wolf sobre: " },
];

export default function CreativesPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", type: "image", url: "", description: "", tags: "" });

  // AI Generator state
  const [showAI, setShowAI] = useState(false);
  const [aiTemplate, setAiTemplate] = useState(AI_PROMPTS[0]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [aiHistory, setAiHistory] = useState<{ role: string; content: string }[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.from("marketing_assets").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setAssets(data ?? []);
      setLoading(false);
    });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase.from("marketing_assets").insert({
      title: form.title, type: form.type, url: form.url,
      description: form.description,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setAssets(p => [data, ...p]);
      setShowCreate(false);
      setForm({ title: "", type: "image", url: "", description: "", tags: "" });
    }
  }

  async function deleteAsset(id: string) {
    await supabase.from("marketing_assets").delete().eq("id", id);
    setAssets(p => p.filter(a => a.id !== id));
    setConfirmDeleteId(null);
  }

  async function generateCopy() {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResult("");
    const fullPrompt = aiTemplate.prompt + aiTopic;
    const newMessages = [...aiHistory, { role: "user", content: fullPrompt }];
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const result = data.content ?? data.error ?? "Erro desconhecido";
      setAiResult(result);
      setAiHistory([...newMessages, { role: "assistant", content: result }]);
    } catch {
      setAiResult("❌ Erro ao conectar com a IA. Verifique se GEMINI_API_KEY está configurada.");
    }
    setAiLoading(false);
  }

  async function saveAsCopy() {
    if (!aiResult) return;
    const title = `Copy — ${aiTemplate.label} — ${new Date().toLocaleDateString("pt-BR")}`;
    const { data } = await supabase.from("marketing_assets").insert({
      title, type: "copy", description: aiResult,
      tags: ["ia-gerado", aiTemplate.label.toLowerCase().replace(/\s+/g, "-")],
    }).select().single();
    if (data) {
      setAssets(p => [data, ...p]);
      setShowAI(false);
      setAiResult("");
      setAiTopic("");
      setAiHistory([]);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(aiResult);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  }

  const filtered = filter === "all" ? assets : assets.filter(a => a.type === filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Assets Criativos</h1>
          <p className="text-wolf-muted text-sm mt-1">{assets.length} assets cadastrados</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={() => setShowAI(true)} variant="outline" className="gap-2">
            <Wand2 className="size-4 text-purple-400" /> Gerar com IA
          </Button>
          <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="size-4" /> Novo Asset</Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: "all", label: "Todos" }, ...ASSET_TYPES.map(t => ({ value: t, label: typeConfig[t as keyof typeof typeConfig].label }))].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-[family-name:var(--font-rajdhani)] font-semibold border transition-all",
              filter === f.value ? "bg-wolf-blue border-wolf-blue text-white" : "bg-wolf-surface border-wolf-blue/20 text-wolf-muted hover:text-wolf-white"
            )}>
            {f.label} {f.value === "all" ? `(${assets.length})` : `(${assets.filter(a => a.type === f.value).length})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-wolf-muted text-sm">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Palette className="size-12 text-wolf-muted/30" />
          <p className="text-wolf-muted text-sm">Nenhum asset encontrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asset => {
            const cfg = typeConfig[asset.type as keyof typeof typeConfig] ?? typeConfig.image;
            const Icon = cfg.icon;
            return (
              <div key={asset.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all group">
                {asset.type === "image" && asset.url ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-wolf-surface-2">
                    <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={cn("aspect-video rounded-xl flex items-center justify-center border", cfg.color)}>
                    <Icon className="size-10 opacity-50" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white text-sm truncate">{asset.title}</p>
                    <div className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border mt-1", cfg.color)}>
                      <Icon className="size-3" />{cfg.label}
                    </div>
                  </div>
                  <button onClick={() => setConfirmDeleteId(asset.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-wolf-red/20 text-wolf-muted hover:text-wolf-red transition-all">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {asset.description && <p className="text-xs text-wolf-muted line-clamp-2">{asset.description}</p>}
                {asset.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map((tag: string) => (
                      <span key={tag} className="text-xs text-wolf-muted bg-wolf-surface-2 border border-wolf-blue/15 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
                {asset.url && (
                  <a href={asset.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-wolf-blue-light hover:underline">
                    <LinkIcon className="size-3" /> Ver arquivo
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          message="Excluir este asset? Esta ação não pode ser desfeita."
          onConfirm={() => deleteAsset(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {/* Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Novo Asset</h2>
              <button onClick={() => setShowCreate(false)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Título *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Nome do asset"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Tipo</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                  {ASSET_TYPES.map(t => <option key={t} value={t}>{typeConfig[t as keyof typeof typeConfig].label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">URL (link externo ou upload)</label>
                <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Descrição / Copy</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Texto do post, copy do anúncio..."
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50 resize-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Tags (separadas por vírgula)</label>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="instagram, promo, cs2"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={saving}>Salvar Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerador de Copy com IA */}
      {showAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="bg-wolf-surface border border-purple-500/30 rounded-2xl w-full max-w-2xl flex flex-col gap-0 my-4 overflow-hidden shadow-2xl shadow-purple-500/10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Wand2 className="size-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Gerador de Copy com IA</h2>
                  <p className="text-xs text-wolf-muted">Crie textos de marketing com inteligência artificial</p>
                </div>
              </div>
              <button onClick={() => { setShowAI(false); setAiResult(""); setAiTopic(""); setAiHistory([]); }}
                className="text-wolf-muted hover:text-wolf-white transition-colors">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Templates */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Tipo de conteúdo</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AI_PROMPTS.map(p => (
                    <button key={p.label} type="button"
                      onClick={() => setAiTemplate(p)}
                      className={cn("text-left px-3 py-2.5 rounded-xl border text-xs font-[family-name:var(--font-rajdhani)] font-semibold transition-all",
                        aiTemplate.label === p.label
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                          : "bg-wolf-surface-2 border-wolf-blue/20 text-wolf-muted hover:text-wolf-white hover:border-wolf-blue/40"
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tema/Assunto */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">
                  Sobre o que é o conteúdo?
                </label>
                <div className="flex gap-2">
                  <input
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && generateCopy()}
                    placeholder="Ex: Promoção Corujão de sexta, R$8/hora das 22h às 6h"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm placeholder:text-wolf-muted focus:outline-none focus:border-purple-500/50"
                  />
                  <Button onClick={generateCopy} disabled={!aiTopic.trim() || aiLoading} className="gap-2 bg-purple-600 hover:bg-purple-500 border-purple-500/50 shrink-0">
                    {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    {aiLoading ? "Gerando..." : "Gerar"}
                  </Button>
                </div>
                <p className="text-xs text-wolf-muted/60 italic">Prompt: <span className="text-wolf-muted">{aiTemplate.prompt}<span className="text-wolf-white">{aiTopic || "..."}</span></span></p>
              </div>

              {/* Resultado */}
              {(aiLoading || aiResult) && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase flex items-center gap-1.5">
                      <Bot className="size-3.5 text-purple-400" /> Resultado da IA
                    </label>
                    {aiResult && (
                      <div className="flex gap-2">
                        <button onClick={copyToClipboard}
                          className="flex items-center gap-1.5 text-xs text-wolf-muted hover:text-wolf-white px-2.5 py-1 rounded-lg hover:bg-wolf-surface-2 border border-wolf-blue/15 transition-all">
                          {aiCopied ? <><Check className="size-3 text-emerald-400" /> Copiado!</> : <><Copy className="size-3" /> Copiar</>}
                        </button>
                        <button onClick={() => { setAiResult(""); setAiTopic(""); }}
                          className="text-xs text-wolf-muted hover:text-wolf-red px-2.5 py-1 rounded-lg hover:bg-wolf-red/10 border border-wolf-blue/15 transition-all">
                          Limpar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative min-h-[120px] p-4 rounded-xl bg-wolf-surface-2 border border-purple-500/20">
                    {aiLoading ? (
                      <div className="flex items-center gap-3 text-wolf-muted">
                        <Loader2 className="size-4 animate-spin text-purple-400" />
                        <span className="text-sm">A IA está criando o conteúdo...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-wolf-white whitespace-pre-wrap leading-relaxed">{aiResult}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Ações */}
              {aiResult && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-wolf-blue/10">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => generateCopy()}>
                    <Wand2 className="size-4" /> Gerar novamente
                  </Button>
                  <Button className="flex-1 gap-2 bg-purple-600 hover:bg-purple-500" onClick={saveAsCopy}>
                    <FileText className="size-4" /> Salvar como Copy
                  </Button>
                  <Button className="flex-1 gap-2" onClick={() => {
                    setForm(p => ({ ...p, type: "copy", description: aiResult, title: `Copy — ${aiTemplate.label}` }));
                    setShowAI(false);
                    setShowCreate(true);
                  }}>
                    <Plus className="size-4" /> Salvar como Asset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
