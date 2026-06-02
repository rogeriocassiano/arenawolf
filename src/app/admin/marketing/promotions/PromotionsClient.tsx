"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, Plus, X, Trash2, Tag, Percent, Clock, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

const PROMO_TYPES = [
  { value: "discount_percent", label: "Desconto %", icon: Percent },
  { value: "discount_fixed", label: "Desconto fixo R$", icon: Tag },
  { value: "bonus_time", label: "Tempo bônus", icon: Clock },
  { value: "free_item", label: "Item grátis", icon: Gift },
];

type Promo = {
  id: string; title: string; description?: string; type: string;
  discount_value?: number; min_purchase?: number;
  valid_from?: string; valid_until?: string; active: boolean;
  max_uses?: number; uses_count?: number;
};

export function PromotionsClient({ promotions: initial }: { promotions: Promo[] }) {
  const [promotions, setPromotions] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", type: "discount_percent", discount_value: "",
    min_purchase: "", valid_from: "", valid_until: "", max_uses: ""
  });

  const supabase = createClient();

  async function toggleActive(promo: Promo) {
    await supabase.from("promotions").update({ active: !promo.active }).eq("id", promo.id);
    setPromotions(p => p.map(pr => pr.id === promo.id ? { ...pr, active: !pr.active } : pr));
  }

  async function deletePromo(id: string) {
    if (!confirm("Excluir promoção?")) return;
    await supabase.from("promotions").delete().eq("id", id);
    setPromotions(p => p.filter(pr => pr.id !== id));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const { data, error: err } = await supabase.from("promotions").insert({
      title: form.title, description: form.description, type: form.type,
      discount_value: Number(form.discount_value) || 0,
      min_purchase: Number(form.min_purchase) || 0,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      max_uses: Number(form.max_uses) || null,
      active: true,
    }).select().single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    setPromotions(p => [data, ...p]);
    setShowCreate(false);
    setForm({ title: "", description: "", type: "discount_percent", discount_value: "", min_purchase: "", valid_from: "", valid_until: "", max_uses: "" });
  }

  const activePromos = promotions.filter(p => p.active);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Promoções</h1>
          <p className="text-wolf-muted text-sm mt-1">{promotions.length} promoções · {activePromos.length} ativas</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0"><Plus className="size-4" /> Nova Promoção</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROMO_TYPES.map(({ value, label, icon: Icon }) => (
          <div key={value} className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-wolf-muted" />
              <p className="text-xs text-wolf-muted">{label}</p>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-wolf-white">
              {promotions.filter(p => p.type === value).length}
            </p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {promotions.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Target className="size-12 text-wolf-muted/30" />
          <p className="text-wolf-muted text-sm">Nenhuma promoção criada ainda</p>
          <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}><Plus className="size-4 mr-2" />Criar promoção</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {promotions.map(promo => {
            const typeInfo = PROMO_TYPES.find(t => t.value === promo.type);
            const Icon = typeInfo?.icon ?? Tag;
            const isExpired = promo.valid_until && new Date(promo.valid_until) < new Date();
            return (
              <div key={promo.id} className={cn("flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border transition-all",
                promo.active && !isExpired ? "bg-wolf-surface border-wolf-blue/20" : "bg-wolf-surface/50 border-wolf-blue/10 opacity-60"
              )}>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-wolf-amber bg-wolf-amber/10 border border-wolf-amber/25 px-2 py-0.5 rounded-full font-[family-name:var(--font-rajdhani)] font-bold">
                      <Icon className="size-3" /> {typeInfo?.label ?? promo.type}
                    </div>
                    {promo.active && !isExpired && (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full font-[family-name:var(--font-rajdhani)] font-bold">Ativa</span>
                    )}
                    {isExpired && (
                      <span className="text-xs text-wolf-muted bg-wolf-muted/10 border border-wolf-muted/20 px-2 py-0.5 rounded-full">Expirada</span>
                    )}
                    {!promo.active && !isExpired && (
                      <span className="text-xs text-wolf-muted bg-wolf-muted/10 border border-wolf-muted/20 px-2 py-0.5 rounded-full">Inativa</span>
                    )}
                  </div>
                  <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">{promo.title}</h3>
                  {promo.description && <p className="text-xs text-wolf-muted line-clamp-1">{promo.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-wolf-muted flex-wrap">
                    {promo.discount_value && promo.discount_value > 0 && (
                      <span className="text-wolf-blue-light font-semibold">
                        {promo.type === "discount_percent" ? `${promo.discount_value}% off` :
                         promo.type === "discount_fixed" ? `R$ ${promo.discount_value} off` :
                         promo.type === "bonus_time" ? `+${promo.discount_value} min bônus` : promo.discount_value}
                      </span>
                    )}
                    {promo.valid_from && <span>De: {formatDate(promo.valid_from)}</span>}
                    {promo.valid_until && <span>Até: {formatDate(promo.valid_until)}</span>}
                    {promo.max_uses && <span>{promo.uses_count ?? 0}/{promo.max_uses} usos</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(promo)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-rajdhani)] font-bold border transition-all",
                      promo.active ? "text-wolf-amber border-wolf-amber/30 hover:bg-wolf-amber/20" : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    )}>
                    {promo.active ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => deletePromo(promo.id)} className="p-2 rounded-lg hover:bg-wolf-red/20 text-wolf-muted hover:text-wolf-red transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 my-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Nova Promoção</h2>
              <button onClick={() => setShowCreate(false)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Título *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Ex: Desconto fim de semana"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Tipo *</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                  {PROMO_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Valor do desconto</label>
                  <input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} min={0} step="any"
                    placeholder={form.type === "discount_percent" ? "Ex: 20" : "Ex: 10.00"}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Compra mínima (R$)</label>
                  <input type="number" value={form.min_purchase} onChange={e => setForm(p => ({ ...p, min_purchase: e.target.value }))} min={0} step="any"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Válido de</label>
                  <input type="date" value={form.valid_from} onChange={e => setForm(p => ({ ...p, valid_from: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Válido até</label>
                  <input type="date" value={form.valid_until} onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Máximo de usos (deixe vazio para ilimitado)</label>
                <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))} min={1}
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Descrição</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Detalhes da promoção..."
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50 resize-none" />
              </div>
              {error && <p className="text-xs text-wolf-red">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={saving}>Criar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
