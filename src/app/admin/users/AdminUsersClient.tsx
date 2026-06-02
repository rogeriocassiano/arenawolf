"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMinutes, formatDate } from "@/lib/utils";
import {
  ShieldCheck, Ban, Trash2, Key, Plus, Search,
  ChevronDown, Check, X, UserCog, Clock
} from "lucide-react";
import { banUser, unbanUser, deleteUser, updateUserRole, addCredits, resetPassword } from "@/app/actions/users";

type User = {
  id: string;
  nickname: string;
  email?: string;
  role: string;
  credits_minutes: number;
  created_at: string;
  banned?: boolean;
  banned_reason?: string;
};

type Props = { users: User[]; authUsers: { id: string; email: string; last_sign_in_at?: string }[] };

export function AdminUsersClient({ users, authUsers }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [action, setAction] = useState<"ban" | "delete" | "role" | "password" | "credits" | null>(null);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const emailMap = Object.fromEntries(authUsers.map(u => [u.id, u.email]));
  const lastSignInMap = Object.fromEntries(authUsers.map(u => [u.id, u.last_sign_in_at]));

  const filtered = users.filter(u =>
    u.nickname.toLowerCase().includes(search.toLowerCase()) ||
    (emailMap[u.id] ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    admin: "text-wolf-red", staff: "text-wolf-amber", user: "text-wolf-blue-light"
  };

  function openAction(user: User, type: typeof action) {
    setSelected(user);
    setAction(type);
    setInput("");
    setMsg(null);
  }

  function closeModal() {
    setSelected(null);
    setAction(null);
    setInput("");
    setMsg(null);
  }

  async function handleConfirm() {
    if (!selected) return;
    startTransition(async () => {
      let res: { error?: string; success?: boolean } = {};
      if (action === "ban") res = await banUser(selected.id, input || "Banido pelo admin");
      if (action === "delete") res = await deleteUser(selected.id);
      if (action === "role") res = await updateUserRole(selected.id, input);
      if (action === "password") res = await resetPassword(selected.id, input);
      if (action === "credits") res = await addCredits(selected.id, Number(input) * 60);

      if (res.error) setMsg({ type: "err", text: res.error });
      else { setMsg({ type: "ok", text: "Concluído!" }); setTimeout(closeModal, 1000); }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Usuários</h1>
          <p className="text-wolf-muted text-sm mt-1">{users.length} cadastrados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-wolf-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nickname ou email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-wolf-surface border border-wolf-blue/20 text-wolf-white text-sm placeholder:text-wolf-muted focus:outline-none focus:border-wolf-blue/50"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-x-auto border border-wolf-blue/15">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-wolf-blue/15 bg-wolf-surface-2">
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Usuário</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Créditos</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Último login</th>
              <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className={`border-b border-wolf-blue/10 last:border-0 transition-colors ${u.banned ? "bg-wolf-red/5" : "bg-wolf-surface hover:bg-wolf-surface-2"}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">{u.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white">{u.nickname}</p>
                      {u.banned && <p className="text-xs text-wolf-red">Banido</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-wolf-muted text-xs">{emailMap[u.id] ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`font-[family-name:var(--font-rajdhani)] font-bold text-xs ${roleColors[u.role] ?? "text-wolf-muted"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-wolf-blue-light font-[family-name:var(--font-rajdhani)] font-semibold text-xs">
                  {formatMinutes(u.credits_minutes ?? 0)}
                </td>
                <td className="px-4 py-3 text-wolf-muted text-xs">
                  {lastSignInMap[u.id] ? formatDate(lastSignInMap[u.id]!) : "Nunca"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openAction(u, "role")} title="Alterar role" className="p-1.5 rounded-lg hover:bg-wolf-blue/20 text-wolf-muted hover:text-wolf-blue-light transition-colors">
                      <UserCog className="size-3.5" />
                    </button>
                    <button onClick={() => openAction(u, "credits")} title="Adicionar créditos" className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-wolf-muted hover:text-emerald-400 transition-colors">
                      <Clock className="size-3.5" />
                    </button>
                    <button onClick={() => openAction(u, "password")} title="Resetar senha" className="p-1.5 rounded-lg hover:bg-wolf-amber/20 text-wolf-muted hover:text-wolf-amber transition-colors">
                      <Key className="size-3.5" />
                    </button>
                    {u.banned ? (
                      <button onClick={() => { startTransition(async () => { await unbanUser(u.id); }); }} title="Desbanir" className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-wolf-red hover:text-emerald-400 transition-colors">
                        <Check className="size-3.5" />
                      </button>
                    ) : (
                      <button onClick={() => openAction(u, "ban")} title="Banir" className="p-1.5 rounded-lg hover:bg-wolf-red/20 text-wolf-muted hover:text-wolf-red transition-colors">
                        <Ban className="size-3.5" />
                      </button>
                    )}
                    <button onClick={() => openAction(u, "delete")} title="Excluir" className="p-1.5 rounded-lg hover:bg-wolf-red/20 text-wolf-muted hover:text-wolf-red transition-colors">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-wolf-muted text-sm">Nenhum usuário encontrado</div>
        )}
      </div>

      {/* Modal */}
      {selected && action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeModal}>
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-base">
                  {action === "ban" && "Banir usuário"}
                  {action === "delete" && "Excluir usuário"}
                  {action === "role" && "Alterar role"}
                  {action === "password" && "Resetar senha"}
                  {action === "credits" && "Adicionar créditos"}
                </h2>
                <p className="text-wolf-muted text-xs mt-1">{selected.nickname}</p>
              </div>
              <button onClick={closeModal} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>

            {action === "delete" && (
              <p className="text-sm text-wolf-muted">Esta ação é irreversível. O usuário e todos os seus dados serão removidos.</p>
            )}
            {action === "ban" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-wolf-muted">Motivo (opcional)</label>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ex: Comportamento inadequado"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
            )}
            {action === "role" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-wolf-muted">Novo role</label>
                <select value={input} onChange={e => setInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                  <option value="">Selecionar...</option>
                  <option value="user">user</option>
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            )}
            {action === "password" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-wolf-muted">Nova senha</label>
                <input type="password" value={input} onChange={e => setInput(e.target.value)} placeholder="Min. 8 caracteres"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
            )}
            {action === "credits" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-wolf-muted">Horas a adicionar</label>
                <input type="number" value={input} onChange={e => setInput(e.target.value)} placeholder="Ex: 2"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                <p className="text-xs text-wolf-muted">Saldo atual: {formatMinutes(selected.credits_minutes)}</p>
              </div>
            )}

            {msg && (
              <p className={`text-xs text-center font-semibold ${msg.type === "ok" ? "text-emerald-400" : "text-wolf-red"}`}>{msg.text}</p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
              <Button
                className={`flex-1 ${action === "delete" || action === "ban" ? "bg-wolf-red hover:bg-wolf-red/80" : ""}`}
                onClick={handleConfirm}
                loading={isPending}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
