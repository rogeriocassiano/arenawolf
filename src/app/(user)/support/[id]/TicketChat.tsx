"use client";

import { useActionState, useRef, useEffect } from "react";
import { sendSupportMessage } from "@/app/actions/support";
import { SupportMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TicketChatProps {
  ticketId: string;
  messages: SupportMessage[];
  currentUserId: string;
  ticketStatus: string;
}

const initialState = { error: "", success: "" };

export function TicketChat({ ticketId, messages, currentUserId, ticketStatus }: TicketChatProps) {
  const [state, formAction, isPending] = useActionState(sendSupportMessage, initialState);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  const isClosed = ticketStatus === "closed";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-y-auto p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
        {messages.map((msg) => {
          const isMe = msg.author_id === currentUserId;
          const isStaff = (msg.author as { role?: string })?.role === "admin" || (msg.author as { role?: string })?.role === "staff";

          return (
            <div key={msg.id} className={cn("flex gap-2.5", isMe ? "flex-row-reverse" : "")}>
              <div className={cn(
                "size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                isStaff ? "bg-wolf-blue/20 border border-wolf-blue/30" : "bg-wolf-surface-2 border border-wolf-blue/15"
              )}>
                {isStaff ? <Bot className="size-3.5 text-wolf-blue-light" /> : <User className="size-3.5 text-wolf-muted" />}
              </div>
              <div className={cn(
                "flex flex-col gap-1 max-w-[80%]",
                isMe ? "items-end" : "items-start"
              )}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] font-semibold">
                    {isStaff ? "Arena Wolf Support" : (msg.author as { nickname?: string })?.nickname ?? "Você"}
                  </span>
                  <span className="text-[10px] text-wolf-muted/50">{formatDateTime(msg.created_at)}</span>
                </div>
                <div className={cn(
                  "rounded-xl px-3 py-2 text-sm",
                  isMe ? "bg-wolf-blue/20 border border-wolf-blue/30 text-wolf-white" : "bg-wolf-surface-2 border border-wolf-blue/10 text-wolf-white"
                )}>
                  {msg.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!isClosed ? (
        <form ref={formRef} action={formAction} className="flex gap-2 items-end">
          <input type="hidden" name="ticket_id" value={ticketId} />
          <textarea
            name="body"
            placeholder="Digite sua mensagem..."
            rows={2}
            required
            className="flex-1 bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-wolf-blue resize-none placeholder:text-wolf-muted/50"
          />
          <Button type="submit" loading={isPending} size="icon">
            <Send className="size-4" />
          </Button>
        </form>
      ) : (
        <div className="text-center py-3 text-sm text-wolf-muted bg-wolf-surface rounded-xl border border-wolf-blue/10">
          Este ticket está encerrado
        </div>
      )}
    </div>
  );
}
