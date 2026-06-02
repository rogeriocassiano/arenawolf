"use client";

import { useActionState } from "react";
import { createSupportTicket } from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

const initialState = { error: "", success: "" };

export default function NewTicketPage() {
  const [state, formAction, isPending] = useActionState(createSupportTicket, initialState);

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/support">
          <button className="p-2 rounded-lg text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2 transition-colors">
            <ArrowLeft className="size-4" />
          </button>
        </Link>
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
            Novo Ticket
          </h1>
          <p className="text-wolf-muted text-sm mt-0.5">Descreva seu problema ou dúvida</p>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-wolf-red/10 border border-wolf-red/30 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400">
          {state.success}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4 p-6 rounded-xl bg-wolf-surface border border-wolf-blue/15">
        <Input
          name="subject"
          label="Assunto"
          placeholder="Ex: Problema com a reserva, Créditos não creditados..."
          required
          maxLength={100}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide">
            Descrição
          </label>
          <textarea
            name="body"
            placeholder="Descreva detalhadamente seu problema..."
            required
            rows={5}
            className="flex w-full rounded-md bg-wolf-surface-2 border border-wolf-blue/20 px-3 py-2 text-sm text-wolf-white placeholder:text-wolf-muted/60 focus:outline-none focus:border-wolf-blue focus:ring-1 focus:ring-wolf-blue/40 resize-none transition-all"
          />
        </div>

        <Button type="submit" loading={isPending} className="w-full" size="lg">
          <Send className="size-4" />
          Enviar Ticket
        </Button>
      </form>
    </div>
  );
}
