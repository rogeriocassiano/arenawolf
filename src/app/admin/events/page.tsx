"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sword, Plus, X, Trash2, Edit2, Calendar, Users, Moon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatCurrency } from "@/lib/utils";

const EVENT_TYPES = [
  { value: "evento", label: "Evento", icon: Calendar, color: "text-wolf-blue-light bg-wolf-blue/10 border-wolf-blue/30" },
  { value: "campeonato", label: "Campeonato", icon: Sword, color: "text-wolf-red bg-wolf-red/10 border-wolf-red/30" },
  { value: "corujao", label: "Corujão", icon: Moon, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
];

type Event = {
  id: string; title: string; description: string; type: string;
  start_at: string; end_at: string; price: number;
  max_slots: number; slots_taken: number;
  requires_advance_payment: boolean; active: boolean;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", type: "evento",
    start_at: "", end_at: "", price: "0",
    max_slots: "50", requires_advance_payment: false,
  });

  const supabase = createClient();

  useEffect(() => {
    supabase.from("events").select("*").order("start_at", { ascending: false }).then(({ data }) => {
      setEvents(data ?? []);
      setLoading(false);
    });
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", type: "evento", start_at: "", end_at: "", price: "0", max_slots: "50", requires_advance_payment: false });
    setShowCreate(true);
  }

  function openEdit(e: Event) {
    setEditing(e);
    setForm({
      title: e.title, description: e.description, type: e.type,
      start_at: e.start_at?.slice(0, 16) ?? "", end_at: e.end_at?.slice(0, 16) ?? "",
      price: String(e.price), max_slots: String(e.max_slots),
      requires_advance_payment: e.requires_advance_payment,
    });
    setShowCreate(true);
  }

  async function toggleActive(ev: Event) {
    await supabase.from("events").update({ active: !ev.active }).eq("id", ev.id);
    setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, active: !e.active } : e));
  }

  async function deleteEvent(id: string) {
    await supabase.from("events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setConfirmDeleteId(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title, description: form.description, type: form.type,
      start_at: form.start_at, end_at: form.end_at || null,
      price: Number(form.price), max_slots: Number(form.max_slots),
      requires_advance_payment: form.requires_advance_payment,
    };
    if (editing) {
      const { data } = await supabase.from("events").update(payload).eq("id", editing.id).select().single();
      if (data) setEvents(prev => prev.map(ev => ev.id === editing.id ? { ...ev, ...data } : ev));
    } else {
      const { data } = await supabase.from("events").insert({ ...payload, active: true, slots_taken: 0 }).select().single();
      if (data) setEvents(prev => [data, ...prev]);
    }
    setSaving(false);
    setShowCreate(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Eventos</h1>
          <p className="text-wolf-muted text-sm mt-1">{events.length} eventos cadastrados</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0"><Plus className="size-4" /> Novo Evento</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EVENT_TYPES.map(t => (
          <div key={t.value} className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <t.icon className="size-4 text-wolf-muted" />
              <p className="text-xs text-wolf-muted">{t.label}</p>
            </div>
            <p className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-wolf-white">
              {events.filter(e => e.type === t.value).length}
            </p>
          </div>
        ))}
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-wolf-muted" />
            <p className="text-xs text-wolf-muted">Ativos</p>
          </div>
          <p className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-emerald-400">
            {events.filter(e => e.active).length}
          </p>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="py-20 text-center text-wolf-muted text-sm">Carregando...</div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Sword className="size-12 text-wolf-muted/30" />
          <p className="text-wolf-muted text-sm">Nenhum evento cadastrado</p>
          <Button variant="outline" size="sm" onClick={openCreate}><Plus className="size-4 mr-2" />Criar evento</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map(ev => {
            const typeCfg = EVENT_TYPES.find(t => t.value === ev.type) ?? EVENT_TYPES[0];
            const Icon = typeCfg.icon;
            const spotsLeft = ev.max_slots - ev.slots_taken;
            return (
              <div key={ev.id} className={cn("flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border transition-all",
                ev.active ? "bg-wolf-surface border-wolf-blue/15 hover:border-wolf-blue/25" : "bg-wolf-surface/50 border-wolf-blue/10 opacity-60"
              )}>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={cn("flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-[family-name:var(--font-rajdhani)] font-bold", typeCfg.color)}>
                      <Icon className="size-3" /> {typeCfg.label}
                    </div>
                    {ev.active
                      ? <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full font-[family-name:var(--font-rajdhani)] font-bold">Ativo</span>
                      : <span className="text-xs text-wolf-muted bg-wolf-muted/10 border border-wolf-muted/20 px-2 py-0.5 rounded-full">Inativo</span>
                    }
                  </div>
                  <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm">{ev.title}</h3>
                  {ev.description && <p className="text-xs text-wolf-muted line-clamp-1">{ev.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-wolf-muted flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="size-3.5" />{formatDateTime(ev.start_at)}</span>
                    <span className="flex items-center gap-1"><Users className="size-3.5" />{ev.slots_taken}/{ev.max_slots} inscritos</span>
                    {ev.price > 0 && <span>{formatCurrency(ev.price * 100)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(ev)} className="p-2 rounded-lg hover:bg-wolf-blue/20 text-wolf-muted hover:text-wolf-blue-light transition-colors">
                    <Edit2 className="size-4" />
                  </button>
                  <button onClick={() => toggleActive(ev)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-rajdhani)] font-bold border transition-all",
                      ev.active ? "text-wolf-amber border-wolf-amber/30 hover:bg-wolf-amber/20" : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    )}>
                    {ev.active ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => setConfirmDeleteId(ev.id)} className="p-2 rounded-lg hover:bg-wolf-red/20 text-wolf-muted hover:text-wolf-red transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          message="Excluir este evento? Esta ação não pode ser desfeita."
          onConfirm={() => deleteEvent(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {/* Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-lg flex flex-col gap-5 my-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{editing ? "Editar Evento" : "Novo Evento"}</h2>
              <button onClick={() => setShowCreate(false)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Título *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Ex: Corujão de Sexta — CS2"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Tipo</label>
                <div className="flex gap-2">
                  {EVENT_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => setForm(p => ({ ...p, type: t.value }))}
                      className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-[family-name:var(--font-rajdhani)] font-bold transition-all",
                        form.type === t.value ? t.color : "text-wolf-muted border-wolf-blue/20 hover:border-wolf-blue/40"
                      )}>
                      <t.icon className="size-3.5" /> {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Descrição</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Descreva o evento..."
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Início *</label>
                  <input type="datetime-local" value={form.start_at} onChange={e => setForm(p => ({ ...p, start_at: e.target.value }))} required
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Fim</label>
                  <input type="datetime-local" value={form.end_at} onChange={e => setForm(p => ({ ...p, end_at: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Preço (R$)</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} min={0} step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Vagas</label>
                  <input type="number" value={form.max_slots} onChange={e => setForm(p => ({ ...p, max_slots: e.target.value }))} min={1}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.requires_advance_payment} onChange={e => setForm(p => ({ ...p, requires_advance_payment: e.target.checked }))}
                  className="size-4 rounded border-wolf-blue/30 bg-wolf-surface-2 accent-wolf-blue" />
                <span className="text-sm text-wolf-muted">Exige pagamento antecipado (50%)</span>
              </label>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={saving}>{editing ? "Salvar" : "Criar Evento"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
