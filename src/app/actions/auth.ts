"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ActionState } from "@/lib/types";

const LoginSchema = z.object({
  email: z.email({ error: "E-mail inválido." }),
  password: z.string().min(6, { error: "Senha deve ter ao menos 6 caracteres." }),
});

const RegisterSchema = z.object({
  nickname: z.string().min(3, { error: "Nickname deve ter ao menos 3 caracteres." }).max(20, { error: "Nickname muito longo." }).regex(/^[a-zA-Z0-9_]+$/, { error: "Use apenas letras, números e _" }),
  email: z.email({ error: "E-mail inválido." }),
  password: z.string().min(8, { error: "Senha deve ter ao menos 8 caracteres." }),
});

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { error: firstError };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "E-mail ou senha incorretos." };
    }
    return { error: "Erro ao entrar. Tente novamente." };
  }

  console.log("[LOGIN] session created:", !!data.session, "user:", data.user?.id, "email:", data.user?.email);

  redirect("/dashboard");
}

export async function register(_state: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    nickname: formData.get("nickname") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { error: firstError };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { nickname: parsed.data.nickname },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "E-mail já cadastrado." };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      nickname: parsed.data.nickname,
      role: "user",
      credits_minutes: 0,
    });
  }

  return { success: "Conta criada! Verifique seu e-mail para confirmar o cadastro." };
}

export async function forgotPassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string;

  if (!email || !z.email().safeParse(email).success) {
    return { error: "Informe um e-mail válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: "Erro ao enviar e-mail. Tente novamente." };

  return { success: "E-mail de recuperação enviado! Verifique sua caixa de entrada." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password !== confirm) return { error: "As senhas não coincidem." };
  if (password.length < 8) return { error: "Senha deve ter ao menos 8 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: "Erro ao atualizar senha." };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
