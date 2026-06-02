import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TicketChat } from "./TicketChat";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SupportMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (!ticket) notFound();
  if (ticket.user_id !== user.id) redirect("/support");

  const { data: messages } = await supabase
    .from("support_messages")
    .select("*, author:profiles(nickname, role)")
    .eq("ticket_id", id)
    .order("created_at");

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/support">
          <button className="p-2 rounded-lg text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2 transition-colors">
            <ArrowLeft className="size-4" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-wolf-white tracking-wide truncate">
            {ticket.subject}
          </h1>
          <p className="text-xs text-wolf-muted capitalize">Status: {ticket.status}</p>
        </div>
      </div>
      <TicketChat
        ticketId={id}
        messages={(messages as SupportMessage[]) ?? []}
        currentUserId={user.id}
        ticketStatus={ticket.status}
      />
    </div>
  );
}
