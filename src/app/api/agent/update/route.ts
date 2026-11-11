import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyAgentUpdateToken } from "@/lib/agent-updates";

export async function POST(request: NextRequest) {
  try {
    const { machine_id, instance_id, action } = await request.json();
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (![machine_id, instance_id].every(value => typeof value === "string" && uuid.test(value)) || !["claim", "release"].includes(action)) {
      return NextResponse.json({ error: "Solicitação inválida" }, { status: 400 });
    }
    const token = request.headers.get("x-agent-update-token");
    const key = request.headers.get("x-agent-key");
    const legacyKeyValid = !!key && !!process.env.SUPABASE_SERVICE_ROLE_KEY && key === process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!legacyKeyValid && (!token || !verifyAgentUpdateToken(token, machine_id))) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const admin = await createAdminClient();
    const { data, error } = await admin.rpc(action === "claim" ? "claim_agent_update" : "release_agent_update", {
      p_machine_id: machine_id, p_instance_id: instance_id,
    });
    if (error) return NextResponse.json({ error: "Não foi possível confirmar a atualização" }, { status: 500 });
    if (action === "claim" && data !== true) return NextResponse.json({ error: "Máquina indisponível para atualização" }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível confirmar a atualização" }, { status: 500 });
  }
}
