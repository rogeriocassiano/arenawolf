"use client";

import { useActionState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Machine } from "@/lib/types";
import { createReservation } from "@/app/actions/reservations";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMinutes } from "@/lib/utils";
import { Monitor, Gamepad2, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, addHours } from "date-fns";

interface ReserveModalProps {
  machine: Machine;
  onClose: () => void;
}

const durationOptions = [30, 60, 90, 120, 180, 240];

const initialState = { error: "", success: "" };

export function ReserveModal({ machine, onClose }: ReserveModalProps) {
  const [state, formAction, isPending] = useActionState(createReservation, initialState);

  const Icon = machine.type === "pc" ? Monitor : Gamepad2;
  const defaultStart = format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onClose();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onClose]);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass rounded-2xl p-6 shadow-2xl shadow-wolf-blue/10 border border-wolf-blue/20 focus:outline-none">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-wolf-blue/20 text-wolf-blue-light">
                <Icon className="size-5" />
              </div>
              <div>
                <Dialog.Title className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-base tracking-wide">
                  {machine.name}
                </Dialog.Title>
                <p className="text-xs text-wolf-muted">
                  {machine.type === "pc" ? "PC Gamer" : "PlayStation 5"} · {formatCurrency(machine.price_per_hour * 100)}/h
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2 transition-colors">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="machine_id" value={machine.id} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide">
                Data e hora de início
              </label>
              <input
                type="datetime-local"
                name="start_at"
                defaultValue={defaultStart}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="flex h-10 w-full rounded-md bg-wolf-surface-2 border border-wolf-blue/20 px-3 py-2 text-sm text-wolf-white focus:outline-none focus:border-wolf-blue focus:ring-1 focus:ring-wolf-blue/40 transition-all [color-scheme:dark]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide">
                Duração
              </label>
              <div className="grid grid-cols-3 gap-2">
                {durationOptions.map((min, i) => (
                  <label key={min} className="cursor-pointer">
                    <input
                      type="radio"
                      name="duration_min"
                      value={min}
                      defaultChecked={i === 1}
                      className="sr-only peer"
                    />
                    <div className="flex flex-col items-center gap-0.5 p-2.5 rounded-lg border border-wolf-blue/20 bg-wolf-surface-2 peer-checked:border-wolf-blue peer-checked:bg-wolf-blue/15 peer-checked:text-wolf-blue-light transition-all text-wolf-muted hover:border-wolf-blue/40">
                      <span className="font-[family-name:var(--font-orbitron)] text-sm font-bold">
                        {formatMinutes(min)}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatCurrency((machine.price_per_hour / 60) * min * 100)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-wolf-surface-2 border border-wolf-blue/10">
              <Clock className="size-4 text-wolf-muted shrink-0" />
              <p className="text-xs text-wolf-muted">
                O pagamento será descontado dos seus créditos de tempo.
              </p>
            </div>

            <Button type="submit" loading={isPending} className="w-full" size="lg">
              Confirmar Reserva
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
