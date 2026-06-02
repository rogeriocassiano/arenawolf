"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  Plus, X, Pencil, Monitor, Gamepad2, Globe, Wrench,
  ChevronRight, Layers, Check, ToggleLeft, ToggleRight, Save
} from "lucide-react";
import { createApp, updateApp, deleteApp, toggleMachineApp } from "@/app/actions/apps";

type App = {
  id: string; name: string; description: string; category: string;
  exe_path: string; exe_args: string; icon_url: string; banner_url: string;
  sort_order: number; active: boolean;
};
type Machine = { id: string; name: string; type: string };
type MachineApp = { machine_id: string; app_id: string; enabled: boolean };

const CATEGORIES = ["Jogo", "Plataforma", "Navegador", "Utilitário", "Outro"];

const CATEGORY_ICON: Record<string, React.ElementType> = {
  Jogo: Gamepad2, Plataforma: Layers, Navegador: Globe, Utilitário: Wrench, Outro: Monitor,
};

const CATEGORY_COLOR: Record<string, string> = {
  Jogo: "text-wolf-red border-wolf-red/20 bg-wolf-red/10",
  Plataforma: "text-wolf-blue-light border-wolf-blue/20 bg-wolf-blue/10",
  Navegador: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  Utilitário: "text-wolf-amber border-wolf-amber/20 bg-wolf-amber/10",
  Outro: "text-wolf-muted border-wolf-muted/20 bg-wolf-muted/10",
};

const EMPTY_APP = {
  name: "", description: "", category: "Jogo",
  exe_path: "", exe_args: "", icon_url: "", banner_url: "", sort_order: 0, active: true,
};

interface AppsClientProps {
  initialApps: App[];
  machines: Machine[];
  machineApps: MachineApp[];
}

export function AppsClient({ initialApps, machines, machineApps: initialMachineApps }: AppsClientProps) {
  const [apps, setApps] = useState(initialApps);
  const [machineApps, setMachineApps] = useState(initialMachineApps);
  const [tab, setTab] = useState<"apps" | "machines">("apps");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(machines[0] ?? null);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; app?: App } | null>(null);
  const [form, setForm] = useState(EMPTY_APP);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  function openCreate() {
    setForm(EMPTY_APP);
    setModal({ mode: "create" });
  }

  function openEdit(app: App) {
    setForm({ ...app });
    setModal({ mode: "edit", app });
  }

  function handleSave() {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (modal?.mode === "edit" && modal.app) {
        const res = await updateApp(modal.app.id, fd);
        if (res.error) { showFeedback("Erro: " + res.error); return; }
        setApps(prev => prev.map(a => a.id === modal.app!.id ? { ...a, ...form } : a));
      } else {
        const res = await createApp(fd);
        if (res.error) { showFeedback("Erro: " + res.error); return; }
        if (res.app) setApps(prev => [...prev, res.app!]);
      }
      setModal(null);
      showFeedback("✅ Salvo com sucesso");
    });
  }

  function handleDelete(appId: string) {
    setConfirmDeleteId(appId);
  }

  function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    startTransition(async () => {
      const res = await deleteApp(id);
      if (res.error) { showFeedback("Erro: " + res.error); return; }
      setApps(prev => prev.filter(a => a.id !== id));
      showFeedback("✅ App removido");
    });
  }

  function handleToggleMachineApp(machineId: string, appId: string, currentEnabled: boolean) {
    startTransition(async () => {
      const res = await toggleMachineApp(machineId, appId, !currentEnabled);
      if (res.error) { showFeedback("Erro: " + res.error); return; }
      setMachineApps(prev => {
        const existing = prev.find(ma => ma.machine_id === machineId && ma.app_id === appId);
        if (existing) return prev.map(ma =>
          ma.machine_id === machineId && ma.app_id === appId
            ? { ...ma, enabled: !currentEnabled } : ma
        );
        return [...prev, { machine_id: machineId, app_id: appId, enabled: true }];
      });
    });
  }

  function isMachineAppEnabled(machineId: string, appId: string): boolean {
    const ma = machineApps.find(m => m.machine_id === machineId && m.app_id === appId);
    return ma ? ma.enabled : false;
  }

  const machineEnabledApps = selectedMachine
    ? apps.filter(app => isMachineAppEnabled(selectedMachine.id, app.id))
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide flex items-center gap-3">
            <Gamepad2 className="size-6 text-wolf-blue-light" /> Launcher de Apps
          </h1>
          <p className="text-wolf-muted text-sm mt-1">Gerencie os apps disponíveis nos PCs da lan house</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-4" /> Novo App
        </Button>
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          message="Excluir este app? Esta ação não pode ser desfeita."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
          loading={isPending}
        />
      )}

      {/* Feedback */}
      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-[family-name:var(--font-rajdhani)] font-semibold">
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-wolf-surface rounded-xl w-fit border border-wolf-blue/15">
        {(["apps", "machines"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-[family-name:var(--font-rajdhani)] font-bold transition-all",
              tab === t ? "bg-wolf-blue text-white" : "text-wolf-muted hover:text-wolf-white"
            )}>
            {t === "apps" ? "Catálogo de Apps" : "Por Máquina"}
          </button>
        ))}
      </div>

      {/* TAB: Catálogo */}
      {tab === "apps" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-wolf-muted">
            {apps.length} apps cadastrados · Aparece em todas as máquinas que o tiverem habilitado
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {apps.map(app => {
              const CatIcon = CATEGORY_ICON[app.category] ?? Monitor;
              return (
                <div key={app.id} className={cn(
                  "flex flex-col gap-3 p-4 rounded-xl border bg-wolf-surface transition-all",
                  app.active ? "border-wolf-blue/15 hover:border-wolf-blue/30" : "opacity-50 border-wolf-muted/15"
                )}>
                  <div className="flex items-start gap-3">
                    {app.icon_url ? (
                      <img src={app.icon_url} alt={app.name}
                        className="size-10 rounded-lg object-cover bg-wolf-surface-2 shrink-0"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="size-10 rounded-lg bg-wolf-surface-2 flex items-center justify-center shrink-0">
                        <CatIcon className="size-5 text-wolf-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm truncate">{app.name}</p>
                      <span className={cn("text-xs font-[family-name:var(--font-rajdhani)] font-bold px-1.5 py-0.5 rounded border", CATEGORY_COLOR[app.category])}>
                        {app.category}
                      </span>
                    </div>
                  </div>
                  {app.description && <p className="text-xs text-wolf-muted line-clamp-2">{app.description}</p>}
                  <p className="text-xs text-wolf-muted/60 font-mono truncate" title={app.exe_path}>{app.exe_path}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => openEdit(app)}>
                      <Pencil className="size-3" /> Editar
                    </Button>
                    <Button size="sm" variant="outline"
                      className="flex-1 gap-1 text-xs border-wolf-red/25 text-wolf-red hover:bg-wolf-red/15"
                      onClick={() => handleDelete(app.id)}>
                      <X className="size-3" /> Excluir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Por Máquina */}
      {tab === "machines" && (
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Lista de máquinas */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-wolf-muted uppercase tracking-wider font-[family-name:var(--font-rajdhani)] font-bold px-1">Máquinas</p>
            {machines.map(m => (
              <button key={m.id} onClick={() => setSelectedMachine(m)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all border",
                  selectedMachine?.id === m.id
                    ? "bg-wolf-blue/15 border-wolf-blue/40 text-wolf-white"
                    : "bg-wolf-surface border-wolf-blue/10 text-wolf-muted hover:text-wolf-white hover:border-wolf-blue/25"
                )}>
                <Monitor className="size-4 shrink-0" />
                <span className="font-[family-name:var(--font-rajdhani)] font-semibold text-sm">{m.name}</span>
                <ChevronRight className="size-3.5 ml-auto" />
              </button>
            ))}
          </div>

          {/* Apps da máquina selecionada */}
          {selectedMachine && (
            <div className="lg:col-span-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white flex items-center gap-2">
                  <Monitor className="size-4 text-wolf-blue-light" /> {selectedMachine.name}
                  <span className="text-wolf-muted font-normal text-xs">— {machineEnabledApps.length} apps habilitados</span>
                </p>
              </div>
              <p className="text-xs text-wolf-muted">Ative ou desative cada app para esta máquina. O usuário verá apenas os apps habilitados.</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {apps.map(app => {
                  const enabled = isMachineAppEnabled(selectedMachine.id, app.id);
                  const CatIcon = CATEGORY_ICON[app.category] ?? Monitor;
                  return (
                    <div key={app.id} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      enabled ? "bg-wolf-blue/5 border-wolf-blue/25" : "bg-wolf-surface border-wolf-blue/10 opacity-60"
                    )}>
                      {app.icon_url ? (
                        <img src={app.icon_url} alt={app.name}
                          className="size-8 rounded object-cover bg-wolf-surface-2 shrink-0"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="size-8 rounded bg-wolf-surface-2 flex items-center justify-center shrink-0">
                          <CatIcon className="size-4 text-wolf-muted" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white truncate">{app.name}</p>
                        <p className="text-xs text-wolf-muted">{app.category}</p>
                      </div>
                      <button
                        onClick={() => handleToggleMachineApp(selectedMachine.id, app.id, enabled)}
                        className="shrink-0 transition-colors"
                        disabled={isPending}>
                        {enabled
                          ? <ToggleRight className="size-7 text-wolf-blue-light" />
                          : <ToggleLeft className="size-7 text-wolf-muted" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-wolf-surface border border-wolf-blue/25 rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm flex items-center gap-2">
                <Gamepad2 className="size-4 text-wolf-blue-light" />
                {modal.mode === "create" ? "Novo App" : `Editar: ${modal.app?.name}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-wolf-muted hover:text-wolf-white">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: "name", label: "Nome *", placeholder: "Steam" },
                { key: "description", label: "Descrição", placeholder: "Plataforma de jogos" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className={cn("flex flex-col gap-1.5", key === "description" && "sm:col-span-2")}>
                  <label className="text-xs text-wolf-muted">{label}</label>
                  <input value={(form as Record<string,unknown>)[key] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Categoria</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Ordem de exibição</label>
                <input type="number" value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-wolf-muted">Caminho do executável *</label>
                <input value={form.exe_path}
                  onChange={e => setForm(f => ({ ...f, exe_path: e.target.value }))}
                  placeholder="C:\Program Files\App\app.exe"
                  className="px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm font-mono focus:outline-none focus:border-wolf-blue/50" />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-wolf-muted">Argumentos (opcional)</label>
                <input value={form.exe_args}
                  onChange={e => setForm(f => ({ ...f, exe_args: e.target.value }))}
                  placeholder="-applaunch 730"
                  className="px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm font-mono focus:outline-none focus:border-wolf-blue/50" />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-wolf-muted">URL do ícone</label>
                <input value={form.icon_url}
                  onChange={e => setForm(f => ({ ...f, icon_url: e.target.value }))}
                  placeholder="https://..."
                  className="px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-wolf-muted">URL do banner (card de fundo)</label>
                <input value={form.banner_url}
                  onChange={e => setForm(f => ({ ...f, banner_url: e.target.value }))}
                  placeholder="https://..."
                  className="px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer sm:col-span-2">
                <input type="checkbox" checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="size-4 rounded" />
                <span className="text-sm text-wolf-muted">App ativo (visível no launcher)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancelar</Button>
              <Button className="flex-1 gap-2" loading={isPending} onClick={handleSave}>
                <Save className="size-4" /> Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
