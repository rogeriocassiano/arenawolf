import Image from "next/image";
import Link from "next/link";
import { Monitor, Gamepad2, Clock, MapPin, Calendar, Shield, Zap, Trophy } from "lucide-react";

function isOpenNow() {
  const now = new Date();
  const bh = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const h = bh.getHours();
  return h >= 8 && h < 22;
}

export default function Home() {
  const open = isOpenNow();
  return (
    <div className="min-h-screen bg-wolf-bg bg-grid">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-wolf-blue/15 h-16 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
          <Image src="/images/logo-dark-bg.jpg" alt="Arena Wolf" width={36} height={36} className="rounded-lg" />
          <span className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white text-sm tracking-wider hidden sm:block">
            Arena Wolf
          </span>
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

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/logo-dark-bg.jpg"
            alt="Arena Wolf"
            width={140}
            height={140}
            className="rounded-3xl shadow-2xl shadow-wolf-blue/30 glow-blue"
            priority
          />
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${open ? "bg-emerald-500/15 border-emerald-500/30" : "bg-wolf-muted/10 border-wolf-muted/20"}`}>
            <span className={`size-2 rounded-full ${open ? "bg-emerald-400 pulse-dot" : "bg-wolf-muted"}`} />
            <span className={`text-xs font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide ${open ? "text-emerald-400" : "text-wolf-muted"}`}>
              {open ? "Aberto agora · 08:00 às 22:00" : "Fechado · Abre às 08:00"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="font-[family-name:var(--font-orbitron)] text-4xl sm:text-5xl font-black text-wolf-white tracking-wide leading-tight">
            A Arena Gamer
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-wolf-blue to-wolf-blue-light">
              Premium de BH
            </span>
          </h1>
          <p className="text-wolf-muted text-lg leading-relaxed">
            10 PCs Gamer + 3 PlayStation 5. Reserve online, veja disponibilidade em tempo real e aproveite a melhor experiência gamer de Belo Horizonte.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-wolf-blue to-wolf-blue-deep text-white font-[family-name:var(--font-orbitron)] font-bold tracking-wide hover:brightness-110 hover:shadow-lg hover:shadow-wolf-blue/30 transition-all text-sm"
          >
            Criar Conta Grátis
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl border border-wolf-blue/40 text-wolf-blue-light font-[family-name:var(--font-rajdhani)] font-bold tracking-wide hover:bg-wolf-blue/10 transition-all text-sm"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Monitor, value: "10", label: "PCs Gamer", color: "text-wolf-blue-light" },
            { icon: Gamepad2, value: "3", label: "PlayStation 5", color: "text-purple-400" },
            { icon: Clock, value: "180Hz", label: "Monitores", color: "text-emerald-400" },
            { icon: Calendar, value: "7/7", label: "Dias/semana", color: "text-wolf-amber" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15">
              <Icon className={`size-6 ${color}`} />
              <p className={`font-[family-name:var(--font-orbitron)] text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-wolf-muted text-center font-[family-name:var(--font-rajdhani)] tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white text-center tracking-wide">
            O que você pode fazer
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "Status ao Vivo", desc: "Veja em tempo real quais máquinas estão livres, ocupadas ou reservadas — sem precisar ligar." },
              { icon: Calendar, title: "Reserva Online", desc: "Reserve seu PC ou PS5 com antecedência. Seus créditos são descontados automaticamente." },
              { icon: Clock, title: "Créditos de Tempo", desc: "Compre pacotes de horas e use quando quiser. Sem fila, sem espera." },
              { icon: Trophy, title: "Ranking Gamer", desc: "Compita no ranking interno da Arena Wolf em CS2, Valorant, FC25 e muito mais." },
              { icon: Shield, title: "Corujão", desc: "Sex→Sáb e Sáb→Dom das 22h às 06h. Reserve sua vaga com 50% antecipado." },
              { icon: MapPin, title: "Belo Horizonte", desc: "Av. Ivaí, 1178 · Dom Bosco · BH/MG. Todos os dias, 08h às 22h." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3 p-5 rounded-2xl bg-wolf-surface border border-wolf-blue/15 hover:border-wolf-blue/30 transition-all">
                <div className="p-2.5 rounded-xl bg-wolf-blue/15 w-fit">
                  <Icon className="size-5 text-wolf-blue-light" />
                </div>
                <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white tracking-wide">{title}</h3>
                <p className="text-sm text-wolf-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6 p-10 rounded-3xl bg-gradient-to-br from-wolf-blue-deep/40 to-wolf-surface border border-wolf-blue/30">
          <Image src="/images/logo-dark-bg.jpg" alt="Arena Wolf" width={80} height={80} className="rounded-2xl" />
          <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-black text-wolf-white tracking-wide">
            Pronto para jogar?
          </h2>
          <p className="text-wolf-muted">Crie sua conta grátis e comece a reservar agora mesmo.</p>
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-wolf-blue to-wolf-blue-deep text-white font-[family-name:var(--font-orbitron)] font-bold tracking-wide hover:brightness-110 hover:shadow-lg hover:shadow-wolf-blue/30 transition-all text-sm"
          >
            Criar Conta Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-wolf-blue/10 px-6 py-8 text-center text-xs text-wolf-muted">
        <p>Arena Wolf © {new Date().getFullYear()} · Av. Ivaí, 1178 · Dom Bosco · BH/MG · Todos os dias 08h–22h</p>
      </footer>
    </div>
  );
}
