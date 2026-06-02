"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, X, Clock, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const PLATFORMS = ["Instagram", "Facebook", "TikTok", "YouTube", "WhatsApp", "Email", "Google Ads"];
const TYPES = ["Post", "Story", "Reels", "Anúncio", "Email mkt", "Promoção"];
const platformColors: Record<string, string> = {
  Instagram: "text-pink-400 bg-pink-500/10 border-pink-500/25",
  Facebook: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  TikTok: "text-white bg-white/10 border-white/25",
  YouTube: "text-red-400 bg-red-500/10 border-red-500/25",
  WhatsApp: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  Email: "text-wolf-amber bg-wolf-amber/10 border-wolf-amber/25",
  "Google Ads": "text-wolf-blue-light bg-wolf-blue/10 border-wolf-blue/25",
};

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function MarketingCalendarPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [form, setForm] = useState({ title: "", platform: "Instagram", type: "Post", scheduled_at: "", content: "" });

  const supabase = createClient();

  useEffect(() => {
    supabase.from("marketing_calendar").select("*").order("scheduled_at").then(({ data }) => {
      setPosts(data ?? []);
      setLoading(false);
    });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const postsThisMonth = posts.filter(p => {
    const d = new Date(p.scheduled_at);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const postsByDay: Record<number, any[]> = {};
  postsThisMonth.forEach(p => {
    const day = new Date(p.scheduled_at).getDate();
    if (!postsByDay[day]) postsByDay[day] = [];
    postsByDay[day].push(p);
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase.from("marketing_calendar").insert({
      title: form.title, platform: form.platform, content_type: form.type,
      scheduled_at: form.scheduled_at, content: form.content, status: "draft",
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setPosts(p => [...p, data].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()));
      setShowCreate(false);
      setForm({ title: "", platform: "Instagram", type: "Post", scheduled_at: "", content: "" });
    }
  }

  const today = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Calendário Editorial</h1>
          <p className="text-wolf-muted text-sm mt-1">{posts.length} posts cadastrados</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0"><Plus className="size-4" /> Agendar Post</Button>
      </div>

      {/* Calendário */}
      <div className="rounded-2xl bg-wolf-surface border border-wolf-blue/15 p-5 flex flex-col gap-4">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 rounded-lg hover:bg-wolf-blue/20 text-wolf-muted hover:text-wolf-white transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 rounded-lg hover:bg-wolf-blue/20 text-wolf-muted hover:text-wolf-white transition-colors">
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="text-center text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted py-2 tracking-wider">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = postsByDay[day] ?? [];
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            return (
              <button key={day}
                onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T09:00`;
                  setForm(p => ({ ...p, scheduled_at: dateStr }));
                  setShowCreate(true);
                }}
                className={cn("min-h-[64px] rounded-xl p-2 flex flex-col gap-1 text-left transition-all hover:bg-wolf-blue/10 border",
                  isToday ? "border-wolf-blue/50 bg-wolf-blue/10" : "border-transparent hover:border-wolf-blue/20"
                )}>
                <span className={cn("text-xs font-[family-name:var(--font-orbitron)] font-bold w-6 h-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-wolf-blue text-white" : "text-wolf-muted")}>{day}</span>
                <div className="flex flex-col gap-0.5">
                  {dayPosts.slice(0, 2).map(p => (
                    <div key={p.id} className={cn("text-xs px-1.5 py-0.5 rounded font-[family-name:var(--font-rajdhani)] font-semibold truncate border", platformColors[p.platform] ?? "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20")}>
                      {p.title}
                    </div>
                  ))}
                  {dayPosts.length > 2 && <span className="text-xs text-wolf-muted">+{dayPosts.length - 2}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de próximos posts */}
      <div>
        <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white mb-3 tracking-wide">Próximos Posts</h2>
        {posts.filter(p => new Date(p.scheduled_at) >= new Date()).slice(0, 8).length === 0 ? (
          <p className="text-wolf-muted text-sm">Nenhum post agendado futuro</p>
        ) : (
          <div className="flex flex-col gap-2">
            {posts.filter(p => new Date(p.scheduled_at) >= new Date()).slice(0, 8).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-wolf-surface border border-wolf-blue/10">
                <div className={cn("text-xs px-2 py-0.5 rounded-full border font-[family-name:var(--font-rajdhani)] font-bold shrink-0", platformColors[p.platform] ?? "text-wolf-muted")}>{p.platform}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-wolf-white font-[family-name:var(--font-rajdhani)] font-semibold truncate">{p.title}</p>
                  <p className="text-xs text-wolf-muted">{p.content_type}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-wolf-muted shrink-0">
                  <Clock className="size-3" />
                  {new Date(p.scheduled_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 my-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">Agendar Post</h2>
              <button onClick={() => setShowCreate(false)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Título *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Ex: Post promoção fim de semana"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Plataforma</label>
                  <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                    {PLATFORMS.map(pl => <option key={pl}>{pl}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Tipo</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Data e hora *</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} required
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Copy / Texto do post</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} placeholder="Texto que será publicado..."
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50 resize-none" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={saving}>Agendar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
