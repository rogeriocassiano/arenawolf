import { createClient } from "@/lib/supabase/server";
import { Machine } from "@/lib/types";
import { AdminMachinesClient } from "./AdminMachinesClient";

export const dynamic = "force-dynamic";

export default async function AdminMachinesPage() {
  const supabase = await createClient();
  const { data: machines } = await supabase.from("machines").select("*").order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Máquinas
        </h1>
        <p className="text-wolf-muted text-sm mt-1">Gerencie status e configurações das máquinas</p>
      </div>
      <AdminMachinesClient machines={(machines as Machine[]) ?? []} />
    </div>
  );
}
