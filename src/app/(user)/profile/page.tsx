import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatMinutes, formatDate } from "@/lib/utils";
import { Clock, User, Mail, Calendar, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const roleVariant = { admin: "admin", staff: "staff", user: "user" } as const;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
          Perfil
        </h1>
        <p className="text-wolf-muted text-sm mt-1">Gerencie sua conta</p>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <Avatar className="size-20 border-2 border-wolf-blue/40">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">
                {profile?.nickname?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col gap-3 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-wolf-white">
                {profile?.nickname}
              </h2>
              <Badge variant={roleVariant[profile?.role as keyof typeof roleVariant] ?? "user"}>
                <ShieldCheck className="size-3" />
                {profile?.role}
              </Badge>
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-wolf-muted">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="size-3.5" />
                {user.email}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar className="size-3.5" />
                Membro desde {formatDate(profile?.created_at ?? "")}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <Clock className="size-3.5 text-wolf-blue-light" />
                <span className="text-wolf-blue-light font-semibold">
                  {formatMinutes(profile?.credits_minutes ?? 0)} de créditos
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-5 pt-0">
          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-wolf-muted py-4 text-center">Nenhuma transação ainda</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-wolf-blue/10 last:border-0">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-wolf-white font-[family-name:var(--font-rajdhani)] font-semibold">
                    {tx.description}
                  </p>
                  <p className="text-xs text-wolf-muted">
                    {new Date(tx.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className={`font-[family-name:var(--font-orbitron)] text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-wolf-red"}`}>
                  {tx.amount > 0 ? "+" : ""}{formatMinutes(Math.abs(tx.amount))}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
