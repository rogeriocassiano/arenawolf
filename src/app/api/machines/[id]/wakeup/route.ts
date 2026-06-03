import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const { data: machine } = await supabase
      .from("machines").select("name, mac_address").eq("id", id).single();

    if (!machine) return NextResponse.json({ error: "Máquina não encontrada" }, { status: 404 });
    if (!machine.mac_address) {
      return NextResponse.json({
        error: `MAC address não cadastrado para ${machine.name}. Configure-o na página de Máquinas.`
      }, { status: 400 });
    }

    // Encaminhar para o servidor WoL local (rodando na lan house)
    const wolServerUrl = process.env.WOL_SERVER_URL;
    if (!wolServerUrl) {
      return NextResponse.json({
        error: "Servidor WoL não configurado. Defina WOL_SERVER_URL no .env"
      }, { status: 500 });
    }

    const res = await fetch(`${wolServerUrl}/wake`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wol-key": process.env.WOL_SERVER_KEY ?? "",
      },
      body: JSON.stringify({ mac: machine.mac_address }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ error: data.error ?? "Falha ao enviar magic packet" }, { status: 502 });
    }

    return NextResponse.json({ success: true, mac: machine.mac_address });
  } catch (err) {
    console.error("[machines/wakeup]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
