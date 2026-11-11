import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { issueAgentUpdateToken } from "@/lib/agent-updates";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const bearer = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
    const agentKey = request.headers.get("x-agent-key");
    let userId: string | null = null;
    if (authorization) {
      if (!bearer) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      const client = await createClient();
      const { data: { user }, error } = await client.auth.getUser(bearer);
      if (error || !user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      userId = user.id;
    } else if (!agentKey || agentKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { session_id, machine_id, instance_id, attach = false } = await request.json();
    if (typeof attach !== "boolean") return NextResponse.json({ error: "Opção inválida" }, { status: 400 });
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (![session_id, machine_id, instance_id].every(value => typeof value === "string" && uuid.test(value))) {
      return NextResponse.json({ error: "Sessão, máquina ou instância inválida" }, { status: 400 });
    }
    const admin = await createAdminClient();
    if (userId) {
      const { data: session, error } = await admin.from("sessions").select("user_id").eq("id", session_id).single();
      if (error || !session || session.user_id !== userId) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    const { data, error } = await admin.rpc(attach ? "attach_agent_session" : "agent_session_heartbeat", {
      p_session_id: session_id, p_machine_id: machine_id, p_instance_id: instance_id,
    });
    if (error || !data) return NextResponse.json({ error: "Não foi possível confirmar a sessão" }, { status: 500 });
    return NextResponse.json(data.error ? data : { ...data, agent_update_token: attach && data.active ? issueAgentUpdateToken(machine_id) : undefined }, { status: data.error ? 409 : 200 });
  } catch {
    return NextResponse.json({ error: "Não foi possível confirmar a sessão" }, { status: 500 });
  }
}
