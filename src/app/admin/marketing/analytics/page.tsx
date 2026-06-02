import { createClient } from "@/lib/supabase/server";
import { BarChart3, TrendingUp, Eye, MousePointer, Heart, Users, Calendar, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MarketingAnalyticsPage() {
  const supabase = await createClient();

  const [campaignsRes, calendarRes, assetsRes] = await Promise.all([
    supabase.from("marketing_campaigns").select("*").limit(100),
    supabase.from("marketing_calendar").select("*").limit(100),
    supabase.from("marketing_assets").select("*").limit(100),
  ]);

  const campaigns = campaignsRes.data ?? [];
  const posts = calendarRes.data ?? [];
  const assets = assetsRes.data ?? [];

  const activeCampaigns = campaigns.filter(c => c.status === "active");
  const publishedPosts = posts.filter(p => p.status === "published");
  const scheduledPosts = posts.filter(p => new Date(p.scheduled_at) > new Date());

  const platformCounts: Record<string, number> = {};
  posts.forEach(p => { platformCounts[p.platform] = (platformCounts[p.platform] ?? 0) + 1; });
  const topPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const campaignBudgetTotal = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Analytics de Marketing</h1>
        <p className="text-wolf-muted text-sm mt-1">Visão geral das ações de marketing da Arena Wolf</p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Campanhas Ativas", value: activeCampaigns.length, icon: Megaphone, color: "text-emerald-400" },
          { label: "Posts Publicados", value: publishedPosts.length, icon: Eye, color: "text-wolf-blue-light" },
          { label: "Posts Agendados", value: scheduledPosts.length, icon: Calendar, color: "text-wolf-amber" },
          { label: "Total de Assets", value: assets.length, icon: BarChart3, color: "text-pink-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex flex-col gap-3 p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
            <div className="flex items-center justify-between">
              <p className="text-xs text-wolf-muted">{label}</p>
              <Icon className={`size-4 ${color}`} />
            </div>
            <p className={`font-[family-name:var(--font-orbitron)] font-black text-3xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Distribuição por plataforma */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15">
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide">Posts por Plataforma</h2>
          {topPlatforms.length === 0 ? (
            <p className="text-wolf-muted text-xs">Nenhum post cadastrado ainda</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topPlatforms.map(([platform, count]) => (
                <div key={platform} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-wolf-white font-[family-name:var(--font-rajdhani)] font-semibold">{platform}</span>
                    <span className="text-wolf-muted">{count} posts</span>
                  </div>
                  <div className="h-2 rounded-full bg-wolf-surface-2 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-wolf-blue to-wolf-blue-light" style={{ width: `${(count / posts.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campanhas por status */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15">
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide">Campanhas por Status</h2>
          {campaigns.length === 0 ? (
            <p className="text-wolf-muted text-xs">Nenhuma campanha criada ainda</p>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: "Ativas", count: campaigns.filter(c => c.status === "active").length, color: "bg-emerald-400" },
                { label: "Rascunhos", count: campaigns.filter(c => c.status === "draft").length, color: "bg-wolf-muted" },
                { label: "Pausadas", count: campaigns.filter(c => c.status === "paused").length, color: "bg-wolf-amber" },
                { label: "Encerradas", count: campaigns.filter(c => c.status === "finished").length, color: "bg-wolf-chrome" },
              ].map(({ label, count, color }) => count > 0 && (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-wolf-white font-[family-name:var(--font-rajdhani)] font-semibold">{label}</span>
                    <span className="text-wolf-muted">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-wolf-surface-2 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${(count / campaigns.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {campaignBudgetTotal > 0 && (
            <div className="mt-2 pt-3 border-t border-wolf-blue/10">
              <p className="text-xs text-wolf-muted">Orçamento total alocado</p>
              <p className="font-[family-name:var(--font-orbitron)] font-bold text-emerald-400 text-lg">R$ {campaignBudgetTotal.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Assets por tipo */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15">
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide">Assets por Tipo</h2>
          {assets.length === 0 ? (
            <p className="text-wolf-muted text-xs">Nenhum asset cadastrado</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "image", label: "Imagens", color: "text-pink-400" },
                { type: "video", label: "Vídeos", color: "text-purple-400" },
                { type: "copy", label: "Copies", color: "text-wolf-amber" },
                { type: "template", label: "Templates", color: "text-wolf-blue-light" },
              ].map(({ type, label, color }) => (
                <div key={type} className="p-3 rounded-xl bg-wolf-surface-2 border border-wolf-blue/10 flex flex-col gap-1">
                  <p className="text-xs text-wolf-muted">{label}</p>
                  <p className={`font-[family-name:var(--font-orbitron)] font-black text-xl ${color}`}>
                    {assets.filter(a => a.type === type).length}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendário - próximo mês */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15">
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white tracking-wide">Próximas Publicações</h2>
          {scheduledPosts.length === 0 ? (
            <p className="text-wolf-muted text-xs">Nenhum post agendado</p>
          ) : (
            <div className="flex flex-col gap-2">
              {scheduledPosts.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-3 text-xs">
                  <div className="size-8 rounded-lg bg-wolf-surface-2 border border-wolf-blue/15 flex flex-col items-center justify-center shrink-0">
                    <span className="font-bold text-wolf-white">{new Date(p.scheduled_at).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-wolf-white font-[family-name:var(--font-rajdhani)] font-semibold truncate">{p.title}</p>
                    <p className="text-wolf-muted">{p.platform}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-wolf-blue/5 border border-wolf-blue/20">
        <p className="text-xs text-wolf-muted text-center">
          📊 Integração com Meta Ads e Google Ads disponível após configurar as conexões.
          Métricas reais (impressões, cliques, CTR, CPC, ROAS) serão exibidas aqui automaticamente.
        </p>
      </div>
    </div>
  );
}
