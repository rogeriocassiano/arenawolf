"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";

const initialState = { error: "", success: "" };

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Recuperar Senha
        </h1>
        <p className="text-sm text-wolf-muted">
          Enviaremos um link para redefinir sua senha
        </p>
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

      {!state?.success && (
        <form action={formAction} className="flex flex-col gap-4">
          <Input
            name="email"
            type="email"
            label="E-mail cadastrado"
            placeholder="seu@email.com"
            leftIcon={<Mail className="size-4" />}
            required
          />
          <Button type="submit" loading={isPending} className="w-full" size="lg">
            Enviar link
          </Button>
        </form>
      )}

      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-wolf-muted hover:text-wolf-white transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Voltar para o login
      </Link>
    </div>
  );
}
