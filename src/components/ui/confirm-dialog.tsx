"use client";

import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmLabel?: string;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmLabel = "Confirmar",
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className={`bg-wolf-surface border rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl ${
        variant === "danger" ? "border-wolf-red/30" : "border-wolf-amber/30"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${variant === "danger" ? "bg-wolf-red/10" : "bg-wolf-amber/10"}`}>
            <AlertTriangle className={`size-5 ${variant === "danger" ? "text-wolf-red" : "text-wolf-amber"}`} />
          </div>
          <p className="text-sm text-wolf-white font-[family-name:var(--font-rajdhani)] font-semibold">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className={`flex-1 gap-2 ${variant === "danger" ? "bg-wolf-red hover:bg-wolf-red/80 border-wolf-red/50" : "bg-wolf-amber hover:bg-wolf-amber/80 border-wolf-amber/50"}`}
            loading={loading}
            onClick={onConfirm}
          >
            <Trash2 className="size-4" /> {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
