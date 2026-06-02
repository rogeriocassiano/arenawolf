import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MachineCard } from "@/components/machines/MachineCard";
import { formatMinutes, formatCurrency, formatDateTime } from "@/lib/utils";
import { Clock, CalendarClock, ShoppingBag, Trophy, ArrowRight, Zap, Tag, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Machine, Reservation } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Admin/staff vai direto para o painel admin
  const { data: roleCheck } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (roleCheck?.role === "admin" || roleCheck?.role === "staff") {
    redirect("/admin");
  }

  const now = new Date().toISOString();
  const [profileRes, machinesRes, reservationsRes, transactionsRes, promotionsRes, eventsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("machines").select("*").order("name"),
    supabase.from("reservations")
      .select("*, machine:machines(*)")
      .eq("user_id", user.id)
      .in("status", ["pending", "active"])
      .order("start_at")
      .limit(3),
    supabase.from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("promotions")
      .select("id, title, type, discount_value")
      .eq("active", true)
      .limit(3),
    supabase.from("events")
      .select("id, title, type, start_at, price")
      .eq("active", true)
      .gte("start_at", now)
      .order("start_at")
      .limit(3),
  ]);

  const profile = profileRes.data;
  const machines: Machine[] = machinesRes.data ?? [];
  const reservations: Reservation[] = reservationsRes.data ?? [];
  const transactions = transactionsRes.data ?? [];
  const promotions = promotionsRes.data ?? [];
  const upcomingEvents = eventsRes.data ?? [];

  const freeMachines = machines.filter((m) => m.status === "free");
  const pcFree = freeMachines.filter((m) => m.type === "pc").length;
  const ps5Free = freeMachines.filter((m) => m.type === "ps5").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Olá, {profile?.nickname ?? "Gamer"} 👋
        </h1>
        <p className="text-wolf-muted text-sm mt-1">
          Bem-vindo de volta à Arena Wolf
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-wolf-blue/20">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide uppercase">Créditos</span>
              <Clock className="size-4 text-wolf-blue-light" />
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-wolf-blue-light">
              {formatMinutes(profile?.credits_minutes ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide uppercase">PCs Livres</span>
              <Zap className="size-4 text-emerald-400" />
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-emerald-400">
              {pcFree}<span className="text-wolf-muted text-sm font-normal">/10</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-wolf-blue/20">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide uppercase">PS5 Livres</span>
              <Zap className="size-4 text-wolf-blue-light" />
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-wolf-blue-light">
              {ps5Free}<span className="text-wolf-muted text-sm font-normal">/3</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-wolf-amber/20">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide uppercase">Reservas</span>
              <CalendarClock className="size-4 text-wolf-amber" />
            </div>
            <p className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-wolf-amber">
              {reservations.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Banner de promoções ativas */}
      {promotions.length > 0 && (
        <Link href="/promotions" className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-wolf-surface border border-emerald-500/25 hover:border-emerald-500/40 transition-all group">
          <div className="p-2 rounded-lg bg-emerald-500/20 shrink-0">
            <Tag className="size-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-400 font-[family-name:var(--font-rajdhani)] font-bold tracking-wider uppercase">
              {promotions.length} promoção{promotions.length > 1 ? "ões" : ""} ativa{promotions.length > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-wolf-white font-[family-name:var(--font-rajdhani)] font-semibold truncate">
              {promotions[0].title}
            </p>
          </div>
          <ArrowRight className="size-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Próximos eventos */}
      {upcomingEvents.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide flex items-center gap-2">
              <Sword className="size-4 text-wolf-blue-light" /> Próximos Eventos
            </h2>
            <Link href="/events">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">Ver todos <ArrowRight className="size-3" /></Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {upcomingEvents.map((ev) => (
              <Link key={ev.id} href="/events"
                className="flex flex-col gap-2 p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all">
                <span className={`text-xs font-[family-name:var(--font-rajdhani)] font-bold px-2 py-0.5 rounded-full border w-fit ${
                  ev.type === "campeonato" ? "text-wolf-red bg-wolf-red/10 border-wolf-red/20" :
                  ev.type === "corujao" ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
                  "text-wolf-blue-light bg-wolf-blue/10 border-wolf-blue/20"
                }`}>{ev.type === "campeonato" ? "Campeonato" : ev.type === "corujao" ? "Corujão" : "Evento"}</span>
                <p className="text-sm font-[family-name:var(--font-orbitron)] font-bold text-wolf-white leading-snug line-clamp-1">{ev.title}</p>
                <p className="text-xs text-wolf-muted">{formatDateTime(ev.start_at)}</p>
                {ev.price > 0 && <p className="text-xs text-emerald-400 font-semibold">{formatCurrency(ev.price * 100)}</p>}
                {ev.price === 0 && <p className="text-xs text-emerald-400 font-semibold">Gratuito</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Machines ao vivo */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-wolf-white tracking-wide">
              Máquinas ao Vivo
            </h2>
            <Link href="/machines">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todas <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {machines.slice(0, 6).map((machine) => (
              <MachineCard key={machine.id} machine={machine} compact />
            ))}
          </div>
        </div>

        {/* Próximas reservas + ações rápidas */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Próximas Reservas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {reservations.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-wolf-muted">Nenhuma reserva ativa</p>
                  <Link href="/machines">
                    <Button size="sm" className="mt-3">Reservar agora</Button>
                  </Link>
                </div>
              ) : (
                reservations.map((r) => (
                  <div key={r.id} className="flex flex-col gap-1 p-3 rounded-lg bg-wolf-surface-2 border border-wolf-blue/10">
                    <p className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white text-sm">
                      {r.machine?.name ?? "Máquina"}
                    </p>
                    <p className="text-xs text-wolf-muted">{formatDateTime(r.start_at)}</p>
                    <p className="text-xs text-wolf-blue-light">{formatMinutes(r.duration_min)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/machines">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <CalendarClock className="size-4" /> Reservar máquina
                </Button>
              </Link>
              <Link href="/store">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <ShoppingBag className="size-4" /> Comprar créditos
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Trophy className="size-4" /> Ver ranking
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
