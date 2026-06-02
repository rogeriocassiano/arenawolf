import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoreClient } from "./StoreClient";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [productsRes, profileRes] = await Promise.all([
    supabase.from("products").select("id, name, price, stock, category, image_url, description").eq("active", true).order("category").order("price"),
    supabase.from("profiles").select("credits_minutes").eq("id", user.id).single(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Loja</h1>
        <p className="text-wolf-muted text-sm mt-1">Compre créditos de tempo e produtos</p>
      </div>
      <StoreClient
        initialCredits={profileRes.data?.credits_minutes ?? 0}
        products={productsRes.data ?? []}
      />
    </div>
  );
}
