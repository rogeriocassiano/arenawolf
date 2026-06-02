import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Megaphone, Brain, ImageIcon, BarChart3, Calendar,
  Link as LinkIcon, Sparkles, Globe, Search, TrendingUp,
  MessageSquare, Target, Palette, Hash, Mail
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const modules = [
  {
    href: "/admin/marketing/campaigns",
    icon: Megaphone,
    title: "Campanhas",
    desc: "Crie, gerencie e monitore campanhas de marketing. Defina público-alvo, orçamento e período.",
    color: "text-wolf-amber",
    bg: "bg-wolf-amber/10 border-wolf-amber/25",
    badge: "Core",
  },
  {
    href: "/admin/marketing/calendar",
    icon: Calendar,
    title: "Calendário Editorial",
    desc: "Planeje e agende posts com antecedência. Visão semanal e mensal dos conteúdos programados.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/25",
    badge: "Core",
  },
  {
    href: "/admin/marketing/creatives",
    icon: Palette,
    title: "Assets Criativos",
    desc: "Gerencie imagens, vídeos, copies e templates para posts e anúncios.",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/25",
    badge: "Core",
  },
  {
    href: "/admin/marketing/ai-agent",
    icon: Brain,
    title: "Agente IA",
    desc: "Assistente inteligente para estratégia de conteúdo, análise de métricas e geração de copies.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/25",
    badge: "IA",
  },
  {
    href: "/admin/marketing/analytics",
    icon: BarChart3,
    title: "Analytics",
    desc: "Métricas de alcance, engajamento, conversões e ROI de todas as ações de marketing.",
    color: "text-wolf-blue-light",
    bg: "bg-wolf-blue/10 border-wolf-blue/25",
    badge: "Analytics",
  },
  {
    href: "/admin/marketing/promotions",
    icon: Target,
    title: "Promoções",
    desc: "Crie promoções, cupons de desconto e ofertas especiais para atrair e reter clientes.",
    color: "text-wolf-red",
    bg: "bg-wolf-red/10 border-wolf-red/25",
    badge: "Core",
  },
];

export default async function AdminMarketingPage() {
  const supabase = await createClient();

  const [campaignsRes, assetsRes, calendarRes] = await Promise.all([
    supabase.from("marketing_campaigns").select("id, status").limit(100),
    supabase.from("marketing_assets").select("id").limit(100),
    supabase.from("marketing_calendar").select("id, scheduled_at").gte("scheduled_at", new Date().toISOString()).limit(10),
  ]);

  const campaigns = campaignsRes.data ?? [];
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalAssets = assetsRes.data?.length ?? 0;
  const upcomingPosts = calendarRes.data?.length ?? 0;

  const kpis = [
    { label: "Campanhas Ativas", value: activeCampaigns, color: "text-emerald-400", icon: Megaphone },
    { label: "Total Campanhas", value: campaigns.length, color: "text-wolf-amber", icon: Target },
    { label: "Assets", value: totalAssets, color: "text-pink-400", icon: Palette },
    { label: "Posts Agendados", value: upcomingPosts, color: "text-wolf-blue-light", icon: Calendar },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
            Marketing Hub
          </h1>
          <p className="text-wolf-muted text-sm mt-1">
            Central de marketing · Campanhas · Conteúdo · IA
          </p>
        </div>
        <Link href="/admin/marketing/ai-agent">
          <Button className="gap-2 shrink-0">
            <Sparkles className="size-4" />
            Agente IA
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="flex flex-col gap-3 p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
            <div className="flex items-center justify-between">
              <p className="text-xs text-wolf-muted">{label}</p>
              <Icon className={`size-4 ${color}`} />
            </div>
            <p className={`font-[family-name:var(--font-orbitron)] font-black text-3xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Módulos */}
      <div>
        <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-wolf-white mb-4 tracking-wide">
          Módulos
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ href, icon: Icon, title, desc, color, bg, badge }) => (
            <Link key={href} href={href}>
              <Card className="hover:border-wolf-blue/30 transition-all cursor-pointer h-full group">
                <CardContent className="p-5 flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-fit p-3 rounded-xl border ${bg}`}>
                      <Icon className={`size-5 ${color}`} />
                    </div>
                    <span className={`text-xs font-[family-name:var(--font-rajdhani)] font-bold px-2 py-0.5 rounded-full border ${bg} ${color}`}>
                      {badge}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm tracking-wide group-hover:text-wolf-blue-light transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-wolf-muted leading-relaxed">{desc}</p>
                  </div>
                  <div className="flex items-center justify-end pt-2 border-t border-wolf-blue/10">
                    <span className={`text-xs ${color} font-[family-name:var(--font-rajdhani)] font-semibold`}>
                      Acessar →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
