"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ActionState } from "@/lib/types";
import { z } from "zod";
import { addMinutes } from "date-fns";

const CreateReservationSchema = z.object({
  machine_id: z.string().uuid(),
  start_at: z.string().datetime({ offset: true }),
  duration_min: z.coerce.number().int().min(30).max(480),
});

export async function createReservation(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const raw = {
    machine_id: formData.get("machine_id") as string,
    start_at: formData.get("start_at") as string,
    duration_min: formData.get("duration_min"),
  };

  const parsed = CreateReservationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { machine_id, start_at, duration_min } = parsed.data;
  const end_at = addMinutes(new Date(start_at), duration_min).toISOString();

  // Busca máquina e perfil
  const [{ data: machine }, { data: profile }] = await Promise.all([
    supabase.from("machines").select("*").eq("id", machine_id).single(),
    supabase.from("profiles").select("credits_minutes").eq("id", user.id).single(),
  ]);

  if (!machine) return { error: "Máquina não encontrada." };
  if (machine.status !== "free") return { error: "Máquina não está disponível." };

  const total_price = (machine.price_per_hour / 60) * duration_min;
  const cost_minutes = duration_min;

  if (!profile || profile.credits_minutes < cost_minutes) {
    return { error: `Créditos insuficientes. Você tem ${profile?.credits_minutes ?? 0}min e precisa de ${cost_minutes}min.` };
  }

  // Verifica conflito de horário
  const { data: conflict } = await supabase
    .from("reservations")
    .select("id")
    .eq("machine_id", machine_id)
    .in("status", ["pending", "active"])
    .lt("start_at", end_at)
    .gt("end_at", start_at)
    .limit(1);

  if (conflict && conflict.length > 0) {
    return { error: "Já existe uma reserva nesse horário para esta máquina." };
  }

  // Cria reserva e debita créditos atomicamente
  const { error: reservationError } = await supabase.from("reservations").insert({
    user_id: user.id,
    machine_id,
    start_at,
    end_at,
    duration_min,
    status: "pending",
    total_price,
    paid_via: "credits",
  });

  if (reservationError) return { error: "Erro ao criar reserva." };

  await supabase
    .from("profiles")
    .update({ credits_minutes: profile.credits_minutes - cost_minutes })
    .eq("id", user.id);

  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "reservation",
    amount: -cost_minutes,
    description: `Reserva: ${machine.name} — ${duration_min}min`,
  });

  revalidatePath("/machines");
  revalidatePath("/dashboard");
  revalidatePath("/reservations");

  return { success: "Reserva criada com sucesso!" };
}

export async function cancelReservation(reservationId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: reservation } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .eq("user_id", user.id)
    .single();

  if (!reservation) return { error: "Reserva não encontrada." };
  if (reservation.status === "active") return { error: "Não é possível cancelar uma sessão ativa." };
  if (reservation.status === "cancelled") return { error: "Reserva já cancelada." };

  await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId);

  // Devolve créditos
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_minutes")
    .eq("id", user.id)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({ credits_minutes: profile.credits_minutes + reservation.duration_min })
      .eq("id", user.id);

    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "refund",
      amount: reservation.duration_min,
      description: `Estorno: cancelamento de reserva`,
    });
  }

  revalidatePath("/reservations");
  revalidatePath("/dashboard");

  return { success: "Reserva cancelada. Créditos devolvidos." };
}
