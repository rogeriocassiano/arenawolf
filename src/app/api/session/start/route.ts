import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { machine_id, user_id, minutes } = await request.json();
    if (!machine_id || !user_id || !minutes) {
      return NextResponse.json({ error: "machine_id, user_id e minutes são obrigatórios" }, { status: 400 });
    }

    // Verificar se a máquina existe e está livre
    const { data: machine } = await supabase
      .from("machines").select("id, name, status").eq("id", machine_id).single();
    if (!machine) return NextResponse.json({ error: "Máquina não encontrada" }, { status: 404 });
    if (machine.status === "maintenance") {
      return NextResponse.json({ error: "Máquina em manutenção" }, { status: 400 });
    }

    // Verificar créditos do usuário alvo
    const { data: targetProfile } = await supabase
      .from("profiles").select("credits_minutes, nickname").eq("id", user_id).single();
    if (!targetProfile) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (targetProfile.credits_minutes < minutes) {
      return NextResponse.json({
        error: `Créditos insuficientes. Disponível: ${targetProfile.credits_minutes}min, necessário: ${minutes}min`
      }, { status: 400 });
    }

    // Chamar RPC atômica
    const { data: sessionId, error: rpcError } = await supabase
      .rpc("start_session", { p_machine_id: machine_id, p_user_id: user_id, p_minutes: minutes });

    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

    return NextResponse.json({
      session_id: sessionId,
      machine: machine.name,
      user: targetProfile.nickname,
      minutes,
      ends_at: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error("[session/start]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
