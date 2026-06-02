"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, LogIn } from "lucide-react";

const initialState = { error: "", success: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Entrar
        </h1>
        <p className="text-sm text-wolf-muted">Acesse sua conta na Arena Wolf</p>
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

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          name="email"
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
          leftIcon={<Mail className="size-4" />}
          autoComplete="email"
          required
        />
        <Input
          name="password"
          type="password"
          label="Senha"
          placeholder="••••••••"
          leftIcon={<Lock className="size-4" />}
          autoComplete="current-password"
          required
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-wolf-blue-light hover:text-wolf-white transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" loading={isPending} className="w-full mt-1" size="lg">
          <LogIn className="size-4" />
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-wolf-muted">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="text-wolf-blue-light hover:text-wolf-white font-medium transition-colors"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
