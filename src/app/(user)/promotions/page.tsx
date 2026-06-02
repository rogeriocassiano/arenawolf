import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Target, Tag, Percent, Clock, Gift, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const typeConfig = {
  discount_percent: { label: "Desconto", icon: Percent, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  discount_fixed: { label: "Desconto fixo", icon: Tag, color: "text-wolf-blue-light bg-wolf-blue/10 border-wolf-blue/30" },
  bonus_time: { label: "Tempo bônus", icon: Clock, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  free_item: { label: "Item grátis", icon: Gift, color: "text-wolf-amber bg-wolf-amber/10 border-wolf-amber/30" },
};

export default async function PromotionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date().toISOString();
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("active", true)
    .or(`valid_until.is.null,valid_until.gte.${now}`)
    .or(`valid_from.is.null,valid_from.lte.${now}`)
    .order("created_at", { ascending: false });

  const promoList = promotions ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Promoções
        </h1>
        <p className="text-wolf-muted text-sm mt-1">Ofertas e descontos especiais da Arena Wolf</p>
      </div>

      {promoList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Target className="size-12 text-wolf-muted/30" />
          <p className="text-wolf-muted text-sm">Nenhuma promoção ativa no momento</p>
          <p className="text-xs text-wolf-muted/60">Fique de olho! Novas promoções aparecem aqui.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promoList.map(promo => {
            const cfg = typeConfig[promo.type as keyof typeof typeConfig] ?? typeConfig.discount_percent;
            const Icon = cfg.icon;
            const daysLeft = promo.valid_until
              ? Math.ceil((new Date(promo.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            const isUrgent = daysLeft !== null && daysLeft <= 3;

            return (
              <div key={promo.id}
                className={cn("flex flex-col gap-4 p-5 rounded-2xl border transition-all",
                  isUrgent
                    ? "bg-wolf-amber/5 border-wolf-amber/30 shadow-lg shadow-wolf-amber/5"
                    : "bg-wolf-surface border-wolf-blue/15 hover:border-wolf-blue/30"
                )}>
                <div className="flex items-start justify-between gap-2">
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-[family-name:var(--font-rajdhani)] font-bold", cfg.color)}>
                    <Icon className="size-3" /> {cfg.label}
                  </div>
                  {isUrgent && daysLeft !== null && (
                    <span className="text-xs text-wolf-amber bg-wolf-amber/10 border border-wolf-amber/30 px-2 py-0.5 rounded-full font-semibold">
                      {daysLeft === 0 ? "Último dia!" : `${daysLeft}d restantes`}
                    </span>
                  )}
                </div>

                {/* Destaque do valor */}
                {promo.discount_value && promo.discount_value > 0 && (
                  <div className="flex items-center justify-center py-4 bg-wolf-surface-2 rounded-xl border border-wolf-blue/10">
                    <p className={cn("font-[family-name:var(--font-orbitron)] font-black text-4xl", cfg.color.split(" ")[0])}>
                      {promo.type === "discount_percent" && `${promo.discount_value}%`}
                      {promo.type === "discount_fixed" && `R$${promo.discount_value}`}
                      {promo.type === "bonus_time" && `+${promo.discount_value}min`}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm leading-snug">
                    {promo.title}
                  </h3>
                  {promo.description && (
                    <p className="text-xs text-wolf-muted mt-1 leading-relaxed">{promo.description}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-wolf-muted">
                  {promo.min_purchase > 0 && (
                    <p>Compra mínima: <span className="text-wolf-white">R$ {promo.min_purchase.toFixed(2)}</span></p>
                  )}
                  {promo.max_uses && (
                    <p>Usos disponíveis: <span className="text-wolf-white">{Math.max(0, promo.max_uses - (promo.uses_count ?? 0))}</span></p>
                  )}
                  {promo.valid_until && (
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      Válido até {formatDate(promo.valid_until)}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-wolf-blue/10">
                  <p className="text-xs text-wolf-muted/60 text-center">
                    Apresente esta promoção no balcão da Arena Wolf para utilizar.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
