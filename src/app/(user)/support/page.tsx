import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, MessageCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { SupportTicket } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusConfig = {
  open: { label: "Aberto", icon: AlertCircle, color: "text-wolf-amber" },
  in_progress: { label: "Em andamento", icon: Clock, color: "text-wolf-blue-light" },
  closed: { label: "Encerrado", icon: CheckCircle2, color: "text-emerald-400" },
};

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ticketsList: SupportTicket[] = (tickets as SupportTicket[]) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
            Suporte
          </h1>
          <p className="text-wolf-muted text-sm mt-1">Fale com nossa equipe</p>
        </div>
        <Link href="/support/new">
          <Button className="gap-2 shrink-0">
            <MessageCircle className="size-4" />
            Novo ticket
          </Button>
        </Link>
      </div>

      {/* Info cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Clock, title: "Horário", desc: "Seg–Dom · 08h às 22h" },
          { icon: MessageCircle, title: "Resposta", desc: "Em até 2 horas" },
          { icon: CheckCircle2, title: "WhatsApp", desc: "(31) 9xxxx-xxxx" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 p-3 rounded-xl bg-wolf-surface border border-wolf-blue/15">
            <Icon className="size-4 text-wolf-blue-light shrink-0" />
            <div>
              <p className="text-xs text-wolf-muted">{title}</p>
              <p className="text-sm font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets */}
      <div className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide">
          Meus Tickets
        </h2>
        {ticketsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Ticket className="size-10 text-wolf-muted/30" />
            <p className="text-wolf-muted text-sm">Nenhum ticket ainda</p>
          </div>
        ) : (
          ticketsList.map((ticket) => {
            const config = statusConfig[ticket.status];
            const Icon = config.icon;
            return (
              <Link key={ticket.id} href={`/support/${ticket.id}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all cursor-pointer">
                  <Ticket className="size-5 text-wolf-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white text-sm truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-wolf-muted">{formatDateTime(ticket.created_at)}</p>
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-[family-name:var(--font-rajdhani)] font-semibold shrink-0", config.color)}>
                    <Icon className="size-3.5" />
                    {config.label}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
