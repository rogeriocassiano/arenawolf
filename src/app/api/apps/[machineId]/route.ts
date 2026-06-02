import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    // Agente usa x-agent-key header
    const agentKey = request.headers.get("x-agent-key");
    const supabase = await createClient();

    // Validar: agente com service role key OU usuário autenticado
    if (!agentKey) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    } else if (agentKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Chave inválida" }, { status: 401 });
    }

    const { machineId } = await params;

    // Buscar apps habilitados para esta máquina
    const { data: machineApps, error } = await supabase
      .from("machine_apps")
      .select("enabled, app:apps(id, name, description, category, exe_path, exe_args, icon_url, banner_url, sort_order)")
      .eq("machine_id", machineId)
      .eq("enabled", true);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Se não houver apps configurados para esta máquina, retornar todos os apps ativos
    if (!machineApps || machineApps.length === 0) {
      const { data: allApps } = await supabase
        .from("apps")
        .select("id, name, description, category, exe_path, exe_args, icon_url, banner_url, sort_order")
        .eq("active", true)
        .order("sort_order");
      return NextResponse.json({ apps: allApps ?? [], source: "global" });
    }

    const apps = machineApps
      .map(ma => ma.app)
      .filter(Boolean)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0));
    return NextResponse.json({ apps, source: "machine" });
  } catch (err) {
    console.error("[api/apps]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
