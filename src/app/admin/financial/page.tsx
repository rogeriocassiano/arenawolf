import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinutes, formatDate } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFinancialPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, profile:profiles(nickname)")
    .order("created_at", { ascending: false })
    .limit(100);

  const list = transactions ?? [];

  const purchases = list.filter((t) => t.type === "credit_purchase");
  const reservations = list.filter((t) => t.type === "reservation");
  const refunds = list.filter((t) => t.type === "refund");

  const totalCredits = purchases.reduce((s: number, t: { amount: number }) => s + Math.abs(t.amount), 0);
  const totalUsed = reservations.reduce((s: number, t: { amount: number }) => s + Math.abs(t.amount), 0);
  const totalRefunded = refunds.reduce((s: number, t: { amount: number }) => s + Math.abs(t.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Financeiro
        </h1>
        <p className="text-wolf-muted text-sm mt-1">Histórico de créditos e transações</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Créditos Vendidos", value: formatMinutes(totalCredits), color: "text-emerald-400", border: "border-emerald-500/20" },
          { icon: Clock, label: "Créditos Usados", value: formatMinutes(totalUsed), color: "text-wolf-blue-light", border: "border-wolf-blue/20" },
          { icon: TrendingUp, label: "Estornos", value: formatMinutes(totalRefunded), color: "text-wolf-amber", border: "border-wolf-amber/20" },
          { icon: CreditCard, label: "Transações", value: list.length, color: "text-purple-400", border: "border-purple-500/20" },
        ].map(({ icon: Icon, label, value, color, border }) => (
          <Card key={label} className={border}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-wolf-muted font-[family-name:var(--font-rajdhani)] uppercase tracking-wide">{label}</span>
                <Icon className={`size-4 ${color}`} />
              </div>
              <p className={`font-[family-name:var(--font-orbitron)] text-xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-wolf-blue/15 bg-wolf-surface-2">
                  {["Usuário", "Tipo", "Descrição", "Valor", "Data"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((tx) => (
                  <tr key={tx.id} className="border-b border-wolf-blue/10 last:border-0 bg-wolf-surface hover:bg-wolf-surface-2 transition-colors">
                    <td className="px-4 py-3 font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white">
                      {tx.profile?.nickname ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-[family-name:var(--font-rajdhani)] font-bold tracking-wide uppercase ${
                        tx.type === "credit_purchase" ? "text-emerald-400" :
                        tx.type === "refund" ? "text-wolf-amber" : "text-wolf-blue-light"
                      }`}>{tx.type.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3 text-wolf-muted text-xs max-w-[200px] truncate">{tx.description}</td>
                    <td className="px-4 py-3">
                      <span className={`font-[family-name:var(--font-orbitron)] text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-wolf-red"}`}>
                        {tx.amount > 0 ? "+" : ""}{formatMinutes(Math.abs(tx.amount))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-wolf-muted text-xs">{formatDate(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length === 0 && (
            <p className="text-center text-wolf-muted text-sm py-10">Nenhuma transação ainda</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
