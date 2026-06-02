import { createClient, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "./config";

export interface AppInfo {
  id: string; name: string; description: string; category: string;
  exe_path: string; exe_args: string; icon_url: string; banner_url: string; sort_order: number;
}

export interface SessionState {
  sessionId: string;
  userId: string;
  nickname: string;
  creditsMinutes: number;
  endsAt: Date;
  machineId: string;
}

type SessionChangeHandler = (session: SessionState | null) => void;

let channel: RealtimeChannel | null = null;
let currentSession: SessionState | null = null;

export function getCurrentSession(): SessionState | null {
  return currentSession;
}

export async function validatePin(pin: string): Promise<{ ok: boolean; session?: SessionState; error?: string }> {
  const cfg = getConfig();
  try {
    const res = await fetch(`${cfg.apiBaseUrl}/api/session/pin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-agent-key": cfg.agentKey,
      },
      body: JSON.stringify({ pin, machine_id: cfg.machineId }),
    });
    const data = await res.json();
    if (!res.ok || data.error) return { ok: false, error: data.error ?? "PIN inválido" };

    const session: SessionState = {
      sessionId: data.session_id,
      userId: data.user_id,
      nickname: data.nickname,
      creditsMinutes: data.credits_minutes,
      endsAt: new Date(data.ends_at),
      machineId: cfg.machineId,
    };
    currentSession = session;
    return { ok: true, session };
  } catch (err) {
    return { ok: false, error: "Erro de conexão com o servidor" };
  }
}

export async function endCurrentSession(reason: "user" | "system" = "system"): Promise<void> {
  if (!currentSession) return;
  const cfg = getConfig();
  try {
    await fetch(`${cfg.apiBaseUrl}/api/session/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agent-key": cfg.agentKey,
      },
      body: JSON.stringify({ session_id: currentSession.sessionId, ended_by: reason }),
    });
  } catch (_) {}
  currentSession = null;
}

export function subscribeToSession(machineId: string, onChange: SessionChangeHandler): () => void {
  const cfg = getConfig();
  const supabase = createClient(cfg.supabaseUrl, cfg.supabaseKey);

  channel = supabase
    .channel(`machine-${machineId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sessions", filter: `machine_id=eq.${machineId}` },
      async (payload) => {
        const row = payload.new as { status?: string; ends_at?: string; id?: string } | null;
        if (payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
          if (!row || row.status !== "active") {
            currentSession = null;
            onChange(null);
          } else if (row.ends_at && currentSession) {
            currentSession.endsAt = new Date(row.ends_at);
            onChange({ ...currentSession });
          }
        }
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
}

export function getRemainingSeconds(): number {
  if (!currentSession) return 0;
  return Math.max(0, Math.floor((currentSession.endsAt.getTime() - Date.now()) / 1000));
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ ok: boolean; session?: SessionState; error?: string }> {
  const cfg = getConfig();
  const supabase = createClient(cfg.supabaseUrl, cfg.supabaseKey);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError || !authData.user) {
    return { ok: false, error: authError?.message ?? "Credenciais inválidas" };
  }

  const userId = authData.user.id;

  // Buscar perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, credits_minutes, banned")
    .eq("id", userId)
    .single();

  if (!profile) return { ok: false, error: "Perfil não encontrado" };
  if (profile.banned) return { ok: false, error: "Conta banida. Fale com o atendente." };
  if ((profile.credits_minutes ?? 0) <= 0) {
    return { ok: false, error: "Sem créditos disponíveis. Compre mais na loja." };
  }

  // Iniciar sessão via API
  try {
    const res = await fetch(`${cfg.apiBaseUrl}/api/session/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agent-key": cfg.agentKey,
        "Authorization": `Bearer ${authData.session?.access_token}`,
      },
      body: JSON.stringify({
        machine_id: cfg.machineId,
        user_id: userId,
        minutes: profile.credits_minutes,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) return { ok: false, error: data.error ?? "Falha ao iniciar sessão" };

    const session: SessionState = {
      sessionId: data.session_id,
      userId,
      nickname: profile.nickname ?? email.split("@")[0],
      creditsMinutes: profile.credits_minutes,
      endsAt: new Date(data.ends_at),
      machineId: cfg.machineId,
    };
    currentSession = session;
    return { ok: true, session };
  } catch {
    return { ok: false, error: "Erro de conexão com o servidor" };
  }
}

export async function fetchMachineApps(): Promise<AppInfo[]> {
  const cfg = getConfig();
  try {
    const res = await fetch(`${cfg.apiBaseUrl}/api/apps/${cfg.machineId}`, {
      headers: { "x-agent-key": cfg.agentKey },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.apps ?? [];
  } catch {
    return [];
  }
}
