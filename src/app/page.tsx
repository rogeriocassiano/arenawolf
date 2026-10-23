import Image from "next/image";
import Link from "next/link";
import {
  Monitor, Gamepad2, Clock, MapPin, Calendar, Zap, Trophy,
  BrainCircuit, Clapperboard, Wrench, GraduationCap, Tv, Store,
  ArrowRight, Building2, Megaphone, Bot, Radio, Shield,
} from "lucide-react";

export const dynamic = "force-dynamic";

function isOpenNow() {
  const now = new Date();
  const bh = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const h = bh.getHours();
  return h >= 8 && h < 22;
}

const companies = [
  {
    icon: Gamepad2,
    name: "Wolf Arena",
    tag: "Ativa",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    desc: "Lan house premium: 10 PCs gamer + 3 PS5. Sistema próprio de reservas, créditos e sessões — o primeiro produto vivo do grupo.",
    href: "/register",
    cta: "Criar conta",
    color: "text-wolf-blue-light",
    border: "hover:border-wolf-blue/50",
  },
  {
    icon: BrainCircuit,
    name: "Wolf Tech",
    tag: "Núcleo",
    tagColor: "text-wolf-blue-light bg-wolf-blue/10 border-wolf-blue/25",
    desc: "Engenharia de software, IA, fine-tuning, automações de vendas e CRM. A receita high-ticket que financia o grupo.",
    color: "text-wolf-blue-light",
    border: "hover:border-wolf-blue/50",
  },
  {
    icon: Tv,
    name: "Wolf TV",
    tag: "Em produção",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/25",
    desc: "Canal de conteúdo do conglomerado: podcast semanal, transmissões ao vivo, cobertura das empresas e cotas de patrocínio.",
    color: "text-purple-400",
    border: "hover:border-purple-500/50",
  },
  {
    icon: Clapperboard,
    name: "Wolf Audiovisual",
    tag: "Ativa",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    desc: "Estúdio completo de gravação e produção. Produtora oficial do grupo e fornecedora de conteúdo B2B.",
    color: "text-wolf-chrome",
    border: "hover:border-wolf-chrome/50",
  },
  {
    icon: GraduationCap,
    name: "Wolf Academy",
    tag: "Em breve",
    tagColor: "text-wolf-amber bg-wolf-amber/10 border-wolf-amber/25",
    desc: "Academia de vendas: treina o comercial interno do grupo e vira produto para empresas clientes.",
    color: "text-wolf-amber",
    border: "hover:border-wolf-amber/50",
  },
  {
    icon: Wrench,
    name: "Wolf Engineering",
    tag: "Ativa",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    desc: "Projetos de engenharia, AutoCAD e soluções de máquinas. Receita técnica complementar ao núcleo de software.",
    color: "text-wolf-chrome",
    border: "hover:border-wolf-chrome/50",
  },
  {
    icon: Store,
    name: "Turbo Açaí",
    tag: "Ativa",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    desc: "Varejo alimentar do grupo — receita recorrente e ponto de encontro da comunidade dentro da sede.",
    color: "text-pink-400",
    border: "hover:border-pink-500/50",
  },
];

const flywheel = [
  {
    icon: Bot,
    title: "Tech financia",
    desc: "Projetos high-ticket de IA, automação e engenharia pagam a estrutura do grupo.",
  },
  {
    icon: Radio,
    title: "Conteúdo gera audiência",
    desc: "Wolf TV, podcast e audiovisual transformam a operação em mídia — e mídia em leads.",
  },
  {
    icon: Building2,
    title: "Subsidiárias viram cases",
    desc: "Cada empresa do grupo usa os serviços da Wolf Arena — vitrine e laboratório do que vendemos.",
  },
  {
    icon: Megaphone,
    title: "Academia escala vendas",
    desc: "O comercial treinado internamente vende os serviços do grupo e o método para fora.",
  },
];

export default function Home() {
  const open = isOpenNow();
  return (
    <div className="min-h-screen bg-wolf-bg bg-grid">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-wolf-blue/15 h-16 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
          <Image src="/images/logo-dark-bg.jpg" alt="Wolf Tech" width={36} height={36} className="rounded-lg" />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm tracking-wider">
              Wolf Tech
            </span>
            <span className="text-[10px] text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-widest uppercase">
              Grupo de tecnologia e mídia
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-wolf-muted hover:text-wolf-white transition-colors font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-wolf-blue to-wolf-blue-deep text-white text-sm font-[family-name:var(--font-rajdhani)] font-bold tracking-wide hover:brightness-110 transition-all"
          >
            Criar Conta
          </Link>
        </div>
      </header>

      {/* Hero — o grupo */}
      <section className="pt-32 pb-16 px-6 flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/logo-dark-bg.jpg"
            alt="Wolf Tech"
            width={140}
            height={140}
            className="rounded-3xl shadow-2xl shadow-wolf-blue/30 glow-blue"
            priority
          />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border bg-wolf-blue/10 border-wolf-blue/30">
            <Building2 className="size-3.5 text-wolf-blue-light" />
            <span className="text-xs font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide text-wolf-blue-light">
              Conglomerado · Tecnologia · Mídia · Games
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 className="font-[family-name:var(--font-orbitron)] text-4xl sm:text-5xl font-black text-wolf-white tracking-wide leading-tight">
            Um grupo. Sete empresas.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-wolf-blue to-wolf-blue-light">
              Uma matriz de tecnologia.
            </span>
          </h1>
          <p className="text-wolf-muted text-lg leading-relaxed">
            A Wolf Tech é uma holding de tecnologia com pegada gamer: engenharia de software e IA,
            produção audiovisual, mídia, vendas e publicidade — tudo operando da mesma sede em Belo Horizonte.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="#grupo"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-wolf-blue to-wolf-blue-deep text-white font-[family-name:var(--font-orbitron)] font-bold tracking-wide hover:brightness-110 hover:shadow-lg hover:shadow-wolf-blue/30 transition-all text-sm"
          >
            Conhecer o grupo
          </a>
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl border border-wolf-blue/40 text-wolf-blue-light font-[family-name:var(--font-rajdhani)] font-bold tracking-wide hover:bg-wolf-blue/10 transition-all text-sm"
          >
            Entrar na Wolf Arena
          </Link>
        </div>
      </section>

      {/* Flywheel */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flywheel.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15">
              <div className="p-2.5 rounded-xl bg-wolf-blue/15 w-fit">
                <Icon className="size-5 text-wolf-blue-light" />
              </div>
              <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white tracking-wide">{title}</h3>
              <p className="text-sm text-wolf-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* As empresas */}
      <section id="grupo" className="px-6 pb-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2">
            <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">
              As empresas do grupo
            </h2>
            <p className="text-wolf-muted text-sm max-w-xl mx-auto">
              Cada unidade opera dentro da sede da Wolf Arena — cliente interna, vitrine e laboratório do que vendemos para fora.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(({ icon: Icon, name, tag, tagColor, desc, href, cta, color, border }) => (
              <div key={name} className={`flex flex-col gap-3 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15 transition-all ${border}`}>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-wolf-surface-2 w-fit">
                    <Icon className={`size-5 ${color}`} />
                  </div>
                  <span className={`text-[10px] font-[family-name:var(--font-rajdhani)] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${tagColor}`}>
                    {tag}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white tracking-wide">{name}</h3>
                <p className="text-sm text-wolf-muted leading-relaxed flex-1">{desc}</p>
                {href && (
                  <Link href={href} className="flex items-center gap-1.5 text-sm font-[family-name:var(--font-rajdhani)] font-bold text-wolf-blue-light hover:text-wolf-white transition-colors">
                    {cta} <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wolf Arena — o produto vivo */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-wolf-blue-deep/30 to-wolf-surface border border-wolf-blue/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-black text-wolf-white tracking-wide">
                  Wolf Arena
                </h2>
                <span className={`flex items-center gap-1.5 text-xs font-[family-name:var(--font-rajdhani)] font-bold px-3 py-1 rounded-full border ${open ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20"}`}>
                  <span className={`size-1.5 rounded-full ${open ? "bg-emerald-400 pulse-dot" : "bg-wolf-muted"}`} />
                  {open ? "Aberto agora" : "Fechado"}
                </span>
              </div>
              <p className="text-wolf-muted leading-relaxed">
                A lan house do grupo — e o primeiro produto de tecnologia feito aqui dentro.
                Reserve online, acompanhe as máquinas em tempo real e jogue com créditos de tempo.
              </p>
            </div>
            <Link
              href="/register"
              className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-wolf-blue to-wolf-blue-deep text-white font-[family-name:var(--font-orbitron)] font-bold tracking-wide hover:brightness-110 transition-all text-sm text-center"
            >
              Criar Conta Grátis
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Monitor, value: "10", label: "PCs Gamer", color: "text-wolf-blue-light" },
              { icon: Gamepad2, value: "3", label: "PlayStation 5", color: "text-purple-400" },
              { icon: Clock, value: "180Hz", label: "Monitores", color: "text-emerald-400" },
              { icon: Calendar, value: "7/7", label: "Dias/semana", color: "text-wolf-amber" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-wolf-bg/60 border border-wolf-blue/15">
                <Icon className={`size-5 ${color}`} />
                <p className={`font-[family-name:var(--font-orbitron)] text-xl font-black ${color}`}>{value}</p>
                <p className="text-[11px] text-wolf-muted text-center font-[family-name:var(--font-rajdhani)] tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "Status ao vivo", desc: "Veja em tempo real quais máquinas estão livres, ocupadas ou reservadas." },
              { icon: Shield, title: "PIN de acesso", desc: "Gere um PIN no app, digite no PC e sua sessão começa na hora." },
              { icon: Trophy, title: "Ranking e eventos", desc: "Ranking interno, campeonatos e corujão das 22h às 06h." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2 p-4 rounded-2xl bg-wolf-bg/60 border border-wolf-blue/10">
                <Icon className="size-5 text-wolf-blue-light" />
                <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white text-sm tracking-wide">{title}</h3>
                <p className="text-xs text-wolf-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sede / contato */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5 p-10 rounded-3xl bg-wolf-surface border border-wolf-blue/20">
          <MapPin className="size-8 text-wolf-blue-light" />
          <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-black text-wolf-white tracking-wide">
            A sede é a casa de todas
          </h2>
          <p className="text-wolf-muted leading-relaxed">
            Av. Ivaí, 1178 · Dom Bosco · Belo Horizonte/MG.
            Arena, estúdio, escritório de engenharia e operações — um único endereço para todo o grupo.
            Aberto todos os dias, 08h às 22h.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-wolf-blue/10 px-6 py-8 text-center text-xs text-wolf-muted flex flex-col gap-1">
        <p className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white tracking-wider">Wolf Tech</p>
        <p>© {new Date().getFullYear()} · Grupo de tecnologia, mídia e games · Av. Ivaí, 1178 · Dom Bosco · BH/MG</p>
      </footer>
    </div>
  );
}
