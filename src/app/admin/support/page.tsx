import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { Ticket, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusConfig = {
  open:        { label: "Aberto",       icon: AlertCircle,   color: "text-wolf-amber  bg-wolf-amber/10  border-wolf-amber/20" },
  in_progress: { label: "Em andamento", icon: Clock,         color: "text-wolf-blue-light bg-wolf-blue/10 border-wolf-blue/20" },
  closed:      { label: "Encerrado",    icon: CheckCircle2,  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export default async function AdminSupportPage() {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*, profile:profiles(nickname)")
    .order("updated_at", { ascending: false })
    .limit(100);

  const list = tickets ?? [];
  const open = list.filter((t) => t.status === "open").length;
  const inProgress = list.filter((t) => t.status === "in_progress").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Tickets de Suporte
        </h1>
        <p className="text-wolf-muted text-sm mt-1">
          {open} aberto{open !== 1 ? "s" : ""} · {inProgress} em andamento
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Abertos", count: open, color: "text-wolf-amber border-wolf-amber/20" },
          { label: "Em andamento", count: inProgress, color: "text-wolf-blue-light border-wolf-blue/20" },
          { label: "Total", count: list.length, color: "text-wolf-white border-wolf-blue/15" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`flex flex-col items-center p-4 rounded-xl bg-wolf-surface border ${color.split(" ")[1]}`}>
            <p className={`font-[family-name:var(--font-orbitron)] text-2xl font-black ${color.split(" ")[0]}`}>{count}</p>
            <p className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {list.map((ticket) => {
          const config = statusConfig[ticket.status as keyof typeof statusConfig] ?? statusConfig.open;
          const Icon = config.icon;
          return (
            <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all cursor-pointer">
                <Ticket className="size-4 text-wolf-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white text-sm truncate">
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-wolf-muted">
                    {ticket.profile?.nickname ?? "—"} · {formatDateTime(ticket.updated_at)}
                  </p>
                </div>
                <div className={cn("flex items-center gap-1.5 text-xs font-[family-name:var(--font-rajdhani)] font-bold px-2.5 py-1 rounded-full border shrink-0", config.color)}>
                  <Icon className="size-3" />
                  {config.label}
                </div>
              </div>
            </Link>
          );
        })}
        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Ticket className="size-10 text-wolf-muted/30" />
            <p className="text-wolf-muted text-sm">Nenhum ticket ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
