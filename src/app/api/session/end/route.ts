import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { session_id, ended_by } = await request.json();
    if (!session_id) return NextResponse.json({ error: "session_id é obrigatório" }, { status: 400 });

    // Autenticação via agent key (agente Electron — sem cookie)
    const agentKey = request.headers.get("x-agent-key");
    if (agentKey && agentKey === process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = await createAdminClient();
      const { error: rpcError } = await admin.rpc("end_session", {
        p_session_id: session_id,
        p_ended_by: ended_by ?? "system",
      });
      if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // Autenticação via cookie (usuário web ou admin)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();

    const isAdmin = profile?.role === "admin" || profile?.role === "staff";

    // Usuário só pode encerrar a própria sessão
    if (!isAdmin) {
      const { data: session } = await supabase
        .from("sessions").select("user_id").eq("id", session_id).single();
      if (!session || session.user_id !== user.id) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    const { error: rpcError } = await supabase.rpc("end_session", {
      p_session_id: session_id,
      p_ended_by: ended_by ?? (isAdmin ? "admin" : "user"),
    });

    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[session/end]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
