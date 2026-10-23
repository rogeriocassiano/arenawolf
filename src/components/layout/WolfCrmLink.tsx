"use client";

import { useState } from "react";
import { Kanban } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CRM_URL = process.env.NEXT_PUBLIC_WOLF_CRM_URL || "http://localhost:5173";

export function WolfCrmLink() {
  const [loading, setLoading] = useState(false);

  async function openCrm() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada — faça login novamente.");
        return;
      }
      const url = `${CRM_URL}/#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`;
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openCrm}
      disabled={loading}
      className="flex w-full items-center gap-2.5 px-4 py-2 mx-2 rounded-lg transition-all duration-200 text-sm text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2 disabled:opacity-50"
    >
      <Kanban className="size-3.5 shrink-0" />
      <span className="font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide flex-1 text-left">
        {loading ? "Abrindo…" : "Wolf CRM"}
      </span>
    </button>
  );
}
