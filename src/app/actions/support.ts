"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActionState } from "@/lib/types";

export async function createSupportTicket(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();

  if (!subject || subject.length < 5) return { error: "Assunto muito curto (mín. 5 caracteres)." };
  if (!body || body.length < 10) return { error: "Descrição muito curta (mín. 10 caracteres)." };

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({ user_id: user.id, subject })
    .select("id")
    .single();

  if (error || !ticket) return { error: "Erro ao criar ticket. Tente novamente." };

  await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    author_id: user.id,
    body,
  });

  revalidatePath("/support");
  redirect(`/support/${ticket.id}`);
}

export async function sendSupportMessage(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const ticket_id = formData.get("ticket_id") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!body || body.length < 1) return { error: "Mensagem vazia." };

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("user_id, status")
    .eq("id", ticket_id)
    .single();

  if (!ticket) return { error: "Ticket não encontrado." };
  if (ticket.status === "closed") return { error: "Este ticket está encerrado." };

  const isOwner = ticket.user_id === user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isStaff = profile?.role === "admin" || profile?.role === "staff";

  if (!isOwner && !isStaff) return { error: "Acesso negado." };

  await supabase.from("support_messages").insert({
    ticket_id,
    author_id: user.id,
    body,
  });

  await supabase
    .from("support_tickets")
    .update({ status: isStaff ? "in_progress" : "open", updated_at: new Date().toISOString() })
    .eq("id", ticket_id);

  revalidatePath(`/support/${ticket_id}`);

  return { success: "Mensagem enviada." };
}

export async function closeTicket(ticketId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const [{ data: ticket }, { data: profile }] = await Promise.all([
    supabase.from("support_tickets").select("user_id").eq("id", ticketId).single(),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
  ]);

  if (!ticket) return { error: "Ticket não encontrado." };

  const isStaff = profile?.role === "admin" || profile?.role === "staff";
  const isOwner = ticket.user_id === user.id;
  if (!isStaff && !isOwner) return { error: "Acesso negado." };

  await supabase
    .from("support_tickets")
    .update({ status: "closed" })
    .eq("id", ticketId);

  revalidatePath(`/support/${ticketId}`);
  revalidatePath("/admin/support");

  return { success: "Ticket encerrado." };
}
