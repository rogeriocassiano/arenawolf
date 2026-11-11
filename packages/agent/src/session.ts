import { createClient, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import WebSocket from "ws";
import { getConfig, setConfig } from "./config";

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
  instanceId?: string;
}

type SessionChangeHandler = (session: SessionState | null) => void;
type EndResult = { ok: boolean; error?: string };
let channel: RealtimeChannel | null = null;
let currentSession: SessionState | null = null;
let credentialClient: SupabaseClient | null = null;
let agentInstanceId = randomUUID();
let endingSession: Promise<EndResult> | null = null;

async function sessionHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json", "x-agent-key": getConfig().agentKey };
  if (credentialClient) {
    const { data: { session } } = await credentialClient.auth.getSession();
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

export function getCurrentSession(): SessionState | null {
  return currentSession;
}

export function resetAgentInstance(): void {
  agentInstanceId = randomUUID();
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
      body: JSON.stringify({ pin, machine_id: cfg.machineId, instance_id: agentInstanceId }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    if (!res.ok || data.error) return { ok: false, error: data.error ?? "PIN inválido" };
    if (data.agent_update_token) setConfig({ updateToken: data.agent_update_token });

    const session: SessionState = {
      sessionId: data.session_id,
      userId: data.user_id,
      nickname: data.nickname ?? data.user,
      creditsMinutes: data.credits_minutes,
      endsAt: new Date(data.ends_at),
      machineId: cfg.machineId,
      instanceId: agentInstanceId,
    };
    credentialClient = null;
    currentSession = session;
    return { ok: true, session };
  } catch (err) {
    return { ok: false, error: "Erro de conexão com o servidor" };
  }
}

export async function endCurrentSession(reason: "user" | "system" = "system"): Promise<EndResult> {
  if (endingSession) return endingSession;
  const session = currentSession;
  if (!session) return { ok: true };
  const cfg = getConfig();
  endingSession = (async (): Promise<EndResult> => {
    try {
      const res = await fetch(`${cfg.apiBaseUrl}/api/session/end`, {
        method: "POST",
        headers: await sessionHeaders(),
        body: JSON.stringify({ session_id: session.sessionId, ended_by: reason }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok || data.success !== true) return { ok: false, error: data.error ?? "O servidor não confirmou o encerramento. Tente novamente." };
      if (currentSession?.sessionId === session.sessionId) currentSession = null;
      return { ok: true };
    } catch {
      return { ok: false, error: "Não foi possível confirmar o encerramento no servidor. Verifique a conexão e tente novamente." };
    }
  })();
  try {
    return await endingSession;
  } finally {
    endingSession = null;
  }
}

export async function confirmSessionHeartbeat(): Promise<{ ok: boolean; ended?: boolean }> {
  const session = currentSession;
  if (!session?.instanceId) return { ok: true };
  try {
    const res = await fetch(`${getConfig().apiBaseUrl}/api/session/heartbeat`, {
      method: "POST",
      headers: await sessionHeaders(),
      body: JSON.stringify({ session_id: session.sessionId, machine_id: session.machineId, instance_id: session.instanceId }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (!res.ok || data.error) return { ok: false };
    if (currentSession?.sessionId !== session.sessionId) return { ok: true };
    if (data.active === false) {
      currentSession = null;
      return { ok: true, ended: true };
    }
    const endsAt = new Date(data.ends_at);
    if (data.active !== true || !Number.isFinite(endsAt.getTime())) return { ok: false };
    currentSession.endsAt = endsAt;
    currentSession.creditsMinutes = data.credits_minutes;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function subscribeToSession(machineId: string, onChange: SessionChangeHandler): () => void {
  const cfg = getConfig();
  const supabase = createClient(cfg.supabaseUrl, cfg.supabaseKey, { realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket } });

  channel = supabase
    .channel(`machine-${machineId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sessions", filter: `machine_id=eq.${machineId}` },
      async (payload) => {
        const row = payload.new as { status?: string; ends_at?: string; id?: string; user_id?: string } | null;

        // Operador iniciou sessão pelo painel → INSERT com status active
        if (payload.eventType === "INSERT" && row?.status === "active" && row.ends_at && row.id && row.user_id) {
          if (currentSession?.sessionId === row.id) return;
          const cfg = getConfig();
          const supabase = createClient(cfg.supabaseUrl, cfg.supabaseKey, { realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket } });
          const { data: profile } = await supabase
            .from("profiles")
            .select("nickname, credits_minutes")
            .eq("id", row.user_id)
            .single();

          if (currentSession?.sessionId === row.id) return;
          const attached = await fetch(`${cfg.apiBaseUrl}/api/session/heartbeat`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-agent-key": cfg.agentKey },
            body: JSON.stringify({ session_id: row.id, machine_id: machineId, instance_id: agentInstanceId, attach: true }),
            signal: AbortSignal.timeout(5000),
          }).then(async res => res.ok ? res.json() : null).catch(() => null);
          if (attached?.agent_update_token) setConfig({ updateToken: attached.agent_update_token });
          if (!attached?.active || currentSession?.sessionId === row.id) return;
          const session: SessionState = {
            sessionId: row.id,
            userId: row.user_id,
            nickname: profile?.nickname ?? "Usuário",
            creditsMinutes: attached.credits_minutes,
            endsAt: new Date(attached.ends_at),
            machineId: machineId,
            instanceId: agentInstanceId,
          };
          currentSession = session;
          credentialClient = null;
          onChange(session);
          return;
        }

        if (payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
          const changedId = row?.id ?? (payload.old as { id?: string } | null)?.id;
          if (currentSession && changedId && changedId !== currentSession.sessionId) return;
          if (!row || row.status !== "active") {
            currentSession = null;
            onChange(null);
          } else if (row.ends_at && currentSession && new Date(row.ends_at).getTime() !== currentSession.endsAt.getTime()) {
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

let machineChannel: RealtimeChannel | null = null;

export function subscribeToMachineControl(machineId: string, onShutdown: () => void): () => void {
  const cfg = getConfig();
  const supabase = createClient(cfg.supabaseUrl, cfg.supabaseKey, { realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket } });

  machineChannel = supabase
    .channel(`machine-control-${machineId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "machines", filter: `id=eq.${machineId}` },
      async (payload) => {
        const row = payload.new as { shutdown_requested?: boolean } | null;
        if (row?.shutdown_requested === true) {
          // Limpar a flag no banco antes de desligar
          const admin = createClient(cfg.supabaseUrl, cfg.supabaseKey, { realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket } });
          await admin.from("machines").update({ shutdown_requested: false }).eq("id", machineId);
          onShutdown();
          if (process.platform === "win32") {
            exec("shutdown /s /t 10", () => {});
          }
        }
      }
    )
    .subscribe();

  return () => {
    if (machineChannel) supabase.removeChannel(machineChannel);
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
  const supabase = createClient(cfg.supabaseUrl, cfg.supabaseKey, { realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket } });

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
        minutes: Math.min(profile.credits_minutes, 240), // máx 4h por sessão
        use_balance: true,
        instance_id: agentInstanceId,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    if (!res.ok || data.error) return { ok: false, error: data.error ?? "Falha ao iniciar sessão" };
    if (data.agent_update_token) setConfig({ updateToken: data.agent_update_token });

    const session: SessionState = {
      sessionId: data.session_id,
      userId,
      nickname: profile.nickname ?? email.split("@")[0],
      creditsMinutes: data.credits_minutes,
      endsAt: new Date(data.ends_at),
      machineId: cfg.machineId,
      instanceId: agentInstanceId,
    };
    credentialClient = supabase;
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
