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

    const { session_id, minutes } = await request.json();
    if (!session_id || !minutes) {
      return NextResponse.json({ error: "session_id e minutes são obrigatórios" }, { status: 400 });
    }

    const { error } = await supabase.rpc("add_session_time", {
      p_session_id: session_id,
      p_minutes: minutes,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[session/add-time]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
