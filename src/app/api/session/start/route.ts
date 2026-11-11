import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { issueAgentUpdateToken } from "@/lib/agent-updates";

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const authorization = request.headers.get("authorization");
    const bearer = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (authorization && !bearer) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const { data: { user }, error: authError } = bearer
      ? await authClient.auth.getUser(bearer)
      : await authClient.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const supabase = await createAdminClient();
    const { data: profile } = await supabase
      .from("profiles").select("role, banned").eq("id", user.id).single();
    if (!profile || profile.banned) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    const isOperator = profile.role === "admin" || profile.role === "staff";

    const { machine_id, user_id, minutes, resume_only = false, use_balance = false, instance_id } = await request.json();
    if (typeof resume_only !== "boolean" || typeof use_balance !== "boolean") return NextResponse.json({ error: "Opções de sessão inválidas" }, { status: 400 });
    if (use_balance) {
      if (!bearer || user_id !== user.id) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuid.test(machine_id ?? "") || !uuid.test(instance_id ?? "")) return NextResponse.json({ error: "Máquina ou instância inválida" }, { status: 400 });
      const { data, error } = await supabase.rpc("start_agent_session", {
        p_machine_id: machine_id, p_user_id: user.id, p_instance_id: instance_id, p_resume_only: resume_only,
      });
      if (error || !data) return NextResponse.json({ error: "Não foi possível preparar a sessão" }, { status: 500 });
      return NextResponse.json(data.error ? data : { ...data, agent_update_token: issueAgentUpdateToken(machine_id) }, { status: data.error ? 409 : 200 });
    }
    if ((!bearer && !isOperator) || (user_id && user_id !== user.id && (!isOperator || bearer))) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (!machine_id || !user_id || !minutes) {
      return NextResponse.json({ error: "machine_id, user_id e minutes são obrigatórios" }, { status: 400 });
    }
    if (typeof minutes !== "number" || !Number.isInteger(minutes) || minutes < 1 || minutes > 480) {
      return NextResponse.json({ error: "minutes deve estar entre 1 e 480" }, { status: 400 });
    }
    if (typeof resume_only !== "boolean") return NextResponse.json({ error: "resume_only deve ser booleano" }, { status: 400 });

    // Verificar se a máquina existe e está livre
    const { data: machine } = await supabase
      .from("machines").select("id, name, status").eq("id", machine_id).single();
    if (!machine) return NextResponse.json({ error: "Máquina não encontrada" }, { status: 404 });
    if (machine.status === "maintenance") {
      return NextResponse.json({ error: "Máquina em manutenção" }, { status: 400 });
    }

    // Verificar créditos do usuário alvo
    const { data: targetProfile } = await supabase
      .from("profiles").select("credits_minutes, nickname, banned").eq("id", user_id).single();
    if (!targetProfile) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (targetProfile.banned) return NextResponse.json({ error: "Conta banida" }, { status: 403 });

    if (machine.status === "busy") {
      const { data: activeSession, error: sessionError } = await supabase
        .from("sessions")
        .select("id, user_id, ends_at")
        .eq("machine_id", machine_id)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sessionError) return NextResponse.json({ error: "Não foi possível verificar a sessão anterior" }, { status: 500 });
      if (!activeSession || activeSession.user_id !== user_id) {
        return NextResponse.json({ error: "Máquina indisponível: há outra sessão ou o estado precisa ser verificado pelo atendente" }, { status: 409 });
      }
      const remaining = new Date(activeSession.ends_at).getTime() - Date.now();
      if (!Number.isFinite(remaining) || remaining <= 0) {
        return NextResponse.json({ error: "A sessão anterior expirou. Peça ao atendente para encerrá-la antes de iniciar outra." }, { status: 409 });
      }
      return NextResponse.json({
        session_id: activeSession.id,
        machine: machine.name,
        user: targetProfile.nickname,
        minutes: Math.ceil(remaining / 60000),
        ends_at: activeSession.ends_at,
        resumed: true,
      });
    }
    if (machine.status !== "free") return NextResponse.json({ error: "Máquina indisponível" }, { status: 409 });
    if (resume_only) return NextResponse.json({ error: "Nenhuma sessão ativa para retomar" }, { status: 409 });
    if (targetProfile.credits_minutes < minutes) {
      return NextResponse.json({
        error: `Créditos insuficientes. Disponível: ${targetProfile.credits_minutes}min, necessário: ${minutes}min`
      }, { status: 400 });
    }

    // Chamar RPC atômica
    const { data: sessionId, error: rpcError } = await supabase
      .rpc("start_session", { p_machine_id: machine_id, p_user_id: user_id, p_minutes: minutes });

    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

    // Buscar ends_at real do banco (evita clock skew entre Node.js e Postgres)
    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("ends_at")
      .eq("id", sessionId)
      .single();

    return NextResponse.json({
      session_id: sessionId,
      machine: machine.name,
      user: targetProfile.nickname,
      minutes,
      ends_at: sessionRow?.ends_at ?? new Date(Date.now() + minutes * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error("[session/start]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
