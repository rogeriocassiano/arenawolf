import { createClient } from "@/lib/supabase/server";
import { MachinesGrid } from "./MachinesGrid";
import { Machine } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MachinesPage() {
  const supabase = await createClient();

  const { data: machines } = await supabase
    .from("machines")
    .select("*")
    .order("type")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Máquinas
        </h1>
        <p className="text-wolf-muted text-sm mt-1">
          Veja a disponibilidade em tempo real e faça sua reserva
        </p>
      </div>
      <MachinesGrid initialMachines={(machines as Machine[]) ?? []} />
    </div>
  );
}
