"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatMinutes } from "@/lib/utils";
import { Clock, ShoppingBag, Star, Zap, Check, Package } from "lucide-react";
import { purchaseCreditPackage, purchaseProduct } from "@/app/actions/store";
import { CreditPackage } from "@/lib/types";
import { cn } from "@/lib/utils";

const creditPackages: CreditPackage[] = [
  { id: "1h",      name: "1 Hora",                 minutes: 60,  price_cents: 1000, bonus_minutes: 0,   popular: false },
  { id: "2h",      name: "2 Horas",                minutes: 120, price_cents: 2000, bonus_minutes: 0,   popular: false },
  { id: "3h",      name: "3 Horas + 1h bônus",     minutes: 180, price_cents: 3000, bonus_minutes: 60,  popular: true  },
  { id: "5h",      name: "5 Horas",                minutes: 300, price_cents: 5000, bonus_minutes: 0,   popular: false },
  { id: "corujao", name: "Corujão",                minutes: 480, price_cents: 7000, bonus_minutes: 0,   popular: false },
  { id: "10h",     name: "10 Horas",               minutes: 600, price_cents: 9000, bonus_minutes: 120, popular: false },
];

type Product = { id: string; name: string; price: number; stock: number; category?: string; image_url?: string; description?: string };

interface StoreClientProps {
  initialCredits: number;
  products: Product[];
}

export function StoreClient({ initialCredits, products }: StoreClientProps) {
  const [credits, setCredits] = useState(initialCredits);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [buyingPkg, setBuyingPkg] = useState<string | null>(null);
  const [buyingProduct, setBuyingProduct] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function showFeedback(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  function handleBuyPackage(pkg: CreditPackage) {
    setBuyingPkg(pkg.id);
    startTransition(async () => {
      const res = await purchaseCreditPackage(pkg.id);
      setBuyingPkg(null);
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        setCredits(credits);
        showFeedback("success", `✅ Solicitação enviada! Dirija-se ao balcão para pagar e liberar +${formatMinutes(pkg.minutes + pkg.bonus_minutes)}.`);
      }
    });
  }

  function handleBuyProduct(product: Product) {
    setBuyingProduct(product.id);
    startTransition(async () => {
      const res = await purchaseProduct(product.id);
      setBuyingProduct(null);
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", `✅ ${product.name} solicitado! Retire no balcão.`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Feedback */}
      {feedback && (
        <div className={cn("flex items-center gap-3 p-4 rounded-xl border text-sm font-[family-name:var(--font-rajdhani)] font-semibold",
          feedback.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-wolf-red/10 border-wolf-red/30 text-wolf-red"
        )}>
          {feedback.msg}
        </div>
      )}

      {/* Saldo */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-wolf-blue/10 border border-wolf-blue/30">
        <Clock className="size-5 text-wolf-blue-light" />
        <div>
          <p className="text-xs text-wolf-muted">Seu saldo atual</p>
          <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-blue-light text-lg">{formatMinutes(credits)}</p>
        </div>
      </div>

      {/* Pacotes de crédito */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-wolf-blue-light" />
          <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-wolf-white tracking-wide">Pacotes de Tempo</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {creditPackages.map((pkg) => (
            <div key={pkg.id} className={cn(
              "relative flex flex-col gap-3 p-4 rounded-xl bg-wolf-surface border transition-all",
              pkg.popular ? "border-wolf-blue/50 shadow-lg shadow-wolf-blue/20" : "border-wolf-blue/15 hover:border-wolf-blue/30"
            )}>
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-wolf-blue px-2 py-0.5 rounded-full text-white text-xs font-[family-name:var(--font-rajdhani)] font-bold whitespace-nowrap">
                    <Star className="size-2.5" /> Popular
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white">
                  {formatMinutes(pkg.minutes + pkg.bonus_minutes)}
                </p>
                <p className="text-xs text-wolf-muted">{pkg.name}</p>
                {pkg.bonus_minutes > 0 && (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Zap className="size-3" />
                    <span className="text-xs font-semibold">+{formatMinutes(pkg.bonus_minutes)} bônus</span>
                  </div>
                )}
              </div>
              <p className="font-[family-name:var(--font-rajdhani)] text-lg font-bold text-wolf-white">{formatCurrency(pkg.price_cents)}</p>
              <Button
                size="sm"
                variant={pkg.popular ? "default" : "outline"}
                className="w-full"
                loading={buyingPkg === pkg.id}
                onClick={() => handleBuyPackage(pkg)}
              >
                {buyingPkg === pkg.id ? "..." : "Comprar"}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-wolf-muted">* Os créditos são adicionados imediatamente após a confirmação no balcão.</p>
      </div>

      {/* Produtos */}
      {products.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-wolf-blue-light" />
            <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-wolf-white tracking-wide">Produtos</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <Card key={product.id} className="hover:border-wolf-blue/30 transition-all">
                <CardContent className="p-4 flex flex-col gap-3">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-24 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-20 bg-wolf-surface-2 rounded-lg flex items-center justify-center">
                      <Package className="size-8 text-wolf-muted/40" />
                    </div>
                  )}
                  <div>
                    <p className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white text-sm">{product.name}</p>
                    {product.category && <p className="text-xs text-wolf-muted">{product.category}</p>}
                    {product.description && <p className="text-xs text-wolf-muted/70 mt-0.5 line-clamp-2">{product.description}</p>}
                  </div>
                  <p className="font-[family-name:var(--font-rajdhani)] text-lg font-bold text-wolf-blue-light">{formatCurrency(product.price * 100)}</p>
                  {product.stock === 0 ? (
                    <Button size="sm" disabled className="w-full">Esgotado</Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      loading={buyingProduct === product.id}
                      onClick={() => handleBuyProduct(product)}
                    >
                      {buyingProduct === product.id ? "..." : "Pedir"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
