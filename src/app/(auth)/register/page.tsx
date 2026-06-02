"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, UserPlus } from "lucide-react";

const initialState = { error: "", success: "" };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Criar Conta
        </h1>
        <p className="text-sm text-wolf-muted">Junte-se à Arena Wolf</p>
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
          name="nickname"
          type="text"
          label="Nickname"
          placeholder="WolfPlayer123"
          leftIcon={<User className="size-4" />}
          autoComplete="username"
          required
        />
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
          placeholder="Mín. 8 caracteres"
          leftIcon={<Lock className="size-4" />}
          autoComplete="new-password"
          required
        />

        <p className="text-xs text-wolf-muted">
          Ao criar conta você concorda com os{" "}
          <span className="text-wolf-blue-light cursor-pointer hover:underline">Termos de Uso</span>.
        </p>

        <Button type="submit" loading={isPending} className="w-full mt-1" size="lg">
          <UserPlus className="size-4" />
          Criar Conta
        </Button>
      </form>

      <p className="text-center text-sm text-wolf-muted">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-wolf-blue-light hover:text-wolf-white font-medium transition-colors"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
