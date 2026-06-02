import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/session/pin — gerar PIN para login no PC
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { machine_id } = await request.json();
    if (!machine_id) return NextResponse.json({ error: "machine_id é obrigatório" }, { status: 400 });

    // Verificar créditos
    const { data: profile } = await supabase
      .from("profiles").select("credits_minutes, nickname").eq("id", user.id).single();
    if (!profile || profile.credits_minutes <= 0) {
      return NextResponse.json({ error: "Sem créditos disponíveis. Adquira créditos na loja." }, { status: 400 });
    }

    // Verificar se máquina está disponível
    const { data: machine } = await supabase
      .from("machines").select("id, name, status").eq("id", machine_id).single();
    if (!machine) return NextResponse.json({ error: "Máquina não encontrada" }, { status: 404 });
    if (machine.status === "busy") {
      return NextResponse.json({ error: "Máquina ocupada no momento" }, { status: 400 });
    }
    if (machine.status === "maintenance") {
      return NextResponse.json({ error: "Máquina em manutenção" }, { status: 400 });
    }

    // Invalidar PINs anteriores do usuário para esta máquina
    await supabase
      .from("machine_pins")
      .update({ used: true })
      .eq("user_id", user.id)
      .eq("machine_id", machine_id)
      .eq("used", false);

    // Gerar PIN único
    let pin = generatePin();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from("machine_pins")
        .select("id")
        .eq("pin", pin)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();
      if (!existing) break;
      pin = generatePin();
      attempts++;
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: pinRecord, error } = await supabase
      .from("machine_pins")
      .insert({ user_id: user.id, machine_id, pin, expires_at: expiresAt })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      pin,
      machine: machine.name,
      expires_at: expiresAt,
      credits_minutes: profile.credits_minutes,
    });
  } catch (err) {
    console.error("[session/pin]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/session/pin/validate — usado pelo agente Windows
export async function PUT(request: NextRequest) {
  try {
    // Agente usa service role key no header
    const authHeader = request.headers.get("x-agent-key");
    if (authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { pin, machine_id } = await request.json();
    if (!pin || !machine_id) {
      return NextResponse.json({ error: "pin e machine_id são obrigatórios" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("validate_pin_and_start", {
      p_pin: pin,
      p_machine_id: machine_id,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data?.error) return NextResponse.json({ error: data.error }, { status: 400 });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[session/pin/validate]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
