import { createClient } from "@/lib/supabase/server";
import { PromotionsClient } from "./PromotionsClient";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const supabase = await createClient();
  const { data: promotions } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
  return <PromotionsClient promotions={promotions ?? []} />;
}
