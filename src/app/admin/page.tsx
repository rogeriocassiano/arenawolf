import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Monitor, CalendarClock, DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [
    { count: totalUsers },
    { data: machines },
    { count: todayReservations },
    { data: todayTransactions },
    { data: activeReservations },
    { count: openTicketsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("machines").select("*"),
    supabase.from("reservations").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("transactions").select("amount, type").gte("created_at", todayISO).eq("type", "credit_purchase"),
    supabase.from("sessions").select("*, machine:machines(name), profile:profiles(nickname)").eq("status", "active").order("started_at").limit(10),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const openTickets: number = openTicketsCount ?? 0;

  const machineList = machines ?? [];
  const freeMachines = machineList.filter((m) => m.status === "free").length;
  const busyMachines = machineList.filter((m) => m.status === "busy").length;
  const maintenanceMachines = machineList.filter((m) => m.status === "maintenance").length;

  const todayRevenue = (todayTransactions ?? []).reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0);

  const stats = [
    { icon: Users, label: "Usuários", value: totalUsers ?? 0, color: "text-wolf-blue-light", borderColor: "border-wolf-blue/20" },
    { icon: Monitor, label: "Livres / Total", value: `${freeMachines}/${machineList.length}`, color: "text-emerald-400", borderColor: "border-emerald-500/20" },
    { icon: CalendarClock, label: "Reservas Hoje", value: todayReservations ?? 0, color: "text-wolf-amber", borderColor: "border-wolf-amber/20" },
    { icon: DollarSign, label: "Créditos Vendidos Hoje", value: formatMinutes(todayRevenue), color: "text-purple-400", borderColor: "border-purple-500/20" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Painel Admin
        </h1>
        <p className="text-wolf-muted text-sm mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, borderColor }) => (
          <Card key={label} className={borderColor}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide uppercase">{label}</span>
                <Icon className={`size-4 ${color}`} />
              </div>
              <p className={`font-[family-name:var(--font-orbitron)] text-xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status das máquinas */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Status das Máquinas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-5 pt-0">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Livres", count: freeMachines, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  { label: "Ocupadas", count: busyMachines, color: "text-wolf-red bg-wolf-red/10 border-wolf-red/20" },
                  { label: "Manutenção", count: maintenanceMachines, color: "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20" },
                ].map(({ label, count, color }) => (
                  <div key={label} className={`flex flex-col items-center p-3 rounded-xl border ${color}`}>
                    <p className={`font-[family-name:var(--font-orbitron)] text-2xl font-black`}>{count}</p>
                    <p className="text-xs font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {machineList.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/10">
                    <span className="text-sm font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white">{m.name}</span>
                    <span className={`text-xs font-[family-name:var(--font-rajdhani)] font-bold tracking-wide uppercase ${
                      m.status === "free" ? "text-emerald-400" :
                      m.status === "busy" ? "text-wolf-red" :
                      m.status === "reserved" ? "text-wolf-amber" : "text-wolf-muted"
                    }`}>
                      {m.status === "free" ? "Livre" : m.status === "busy" ? "Ocupada" : m.status === "reserved" ? "Reservada" : "Manutenção"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sessões ativas */}
          <Card>
            <CardHeader>
              <CardTitle>Sessões Ativas</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {!activeReservations || activeReservations.length === 0 ? (
                <p className="text-sm text-wolf-muted py-3">Nenhuma sessão ativa no momento.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeReservations.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-wolf-blue/10 border border-wolf-blue/20">
                      <Monitor className="size-4 text-wolf-blue-light shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white">
                          {r.machine?.name}
                        </p>
                        <p className="text-xs text-wolf-muted">{(r as {profile?: {nickname: string}}).profile?.nickname ?? "Usuário"}</p>
                      </div>
                      <span className="text-xs text-emerald-400 font-[family-name:var(--font-rajdhani)] font-bold">ATIVA</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-5 pt-0">
              {maintenanceMachines > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-wolf-muted/10 border border-wolf-muted/20">
                  <AlertTriangle className="size-4 text-wolf-muted shrink-0 mt-0.5" />
                  <p className="text-xs text-wolf-muted">
                    {maintenanceMachines} máquina{maintenanceMachines > 1 ? "s" : ""} em manutenção
                  </p>
                </div>
              )}
              {(openTickets ?? 0) > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-wolf-amber/10 border border-wolf-amber/20">
                  <AlertTriangle className="size-4 text-wolf-amber shrink-0 mt-0.5" />
                  <p className="text-xs text-wolf-amber">
                    {openTickets} ticket{(openTickets ?? 0) > 1 ? "s" : ""} de suporte aberto{(openTickets ?? 0) > 1 ? "s" : ""}
                  </p>
                </div>
              )}
              {maintenanceMachines === 0 && (openTickets ?? 0) === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <p className="text-xs text-emerald-400">Tudo operando normalmente</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-5 pt-0">
              {[
                { href: "/admin/machines", label: "Gerenciar Máquinas", icon: Monitor },
                { href: "/admin/reservations", label: "Ver Reservas", icon: CalendarClock },
                { href: "/admin/users", label: "Usuários", icon: Users },
                { href: "/admin/products", label: "Produtos", icon: TrendingUp },
                { href: "/admin/events", label: "Eventos", icon: CalendarClock },
                { href: "/admin/tournaments", label: "Campeonatos", icon: TrendingUp },
                { href: "/admin/support", label: "Suporte", icon: AlertTriangle },
                { href: "/admin/marketing", label: "Marketing Hub", icon: TrendingUp },
              ].map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2 transition-all text-sm"
                >
                  <Icon className="size-3.5" />
                  <span className="font-[family-name:var(--font-rajdhani)] font-semibold">{label}</span>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
