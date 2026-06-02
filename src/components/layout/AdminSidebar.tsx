"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  CalendarClock,
  Users,
  ShoppingBag,
  Tag,
  Sword,
  Trophy,
  DollarSign,
  Ticket,
  Settings,
  Megaphone,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";
import Image from "next/image";

const navGroups = [
  {
    label: "Operacional",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/machines", label: "Máquinas", icon: Monitor },
      { href: "/admin/reservations", label: "Reservas", icon: CalendarClock },
      { href: "/admin/users", label: "Usuários", icon: Users },
    ],
  },
  {
    label: "Negócio",
    items: [
      { href: "/admin/products", label: "Produtos", icon: ShoppingBag },
      { href: "/admin/marketing/promotions", label: "Promoções", icon: Tag },
      { href: "/admin/events", label: "Eventos", icon: Sword },
      { href: "/admin/tournaments", label: "Campeonatos", icon: Trophy },
      { href: "/admin/financial", label: "Financeiro", icon: DollarSign },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/marketing", label: "Marketing Hub", icon: Megaphone },
    ],
  },
  {
    label: "Suporte",
    items: [
      { href: "/admin/support", label: "Tickets", icon: Ticket },
      { href: "/admin/settings", label: "Configurações", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 h-16 border-b border-wolf-blue/15 shrink-0">
        <Image src="/images/logo-dark-bg.jpg" alt="Arena Wolf" width={28} height={28} className="rounded-md" />
        <div>
          <p className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-wolf-white tracking-wide">Arena Wolf</p>
          <p className="text-[10px] text-wolf-blue-light font-[family-name:var(--font-rajdhani)] tracking-widest uppercase">Admin</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-4 mb-1 text-[10px] font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted/60 tracking-widest uppercase">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href) && !(exact === false && pathname === "/admin");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 mx-2 rounded-lg transition-all duration-200 group text-sm",
                    active
                      ? "bg-wolf-blue/20 text-wolf-blue-light border border-wolf-blue/25"
                      : "text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide flex-1">
                    {label}
                  </span>
                  {active && <ChevronRight className="size-3 opacity-50" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="px-2 pb-4 border-t border-wolf-blue/10 pt-3 shrink-0">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 px-4 py-2 rounded-lg text-wolf-muted hover:text-wolf-red hover:bg-wolf-red/10 transition-all text-sm"
          >
            <LogOut className="size-3.5" />
            <span className="font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide">Sair</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
