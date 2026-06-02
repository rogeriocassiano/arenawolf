"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  CalendarClock,
  ShoppingBag,
  Trophy,
  Ticket,
  User,
  LogOut,
  Sword,
  Tag,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/session", label: "Usar PC", icon: Gamepad2 },
  { href: "/machines", label: "Máquinas", icon: Monitor },
  { href: "/reservations", label: "Reservas", icon: CalendarClock },
  { href: "/store", label: "Loja", icon: ShoppingBag },
  { href: "/events", label: "Eventos", icon: Sword },
  { href: "/promotions", label: "Promoções", icon: Tag },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/support", label: "Suporte", icon: Ticket },
  { href: "/profile", label: "Perfil", icon: User },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full py-4 gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all duration-200 group",
              active
                ? "bg-wolf-blue/20 text-wolf-blue-light border border-wolf-blue/30 shadow-lg shadow-wolf-blue/10"
                : "text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2"
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-wolf-blue-light")} />
            <span className="font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide text-sm">
              {label}
            </span>
            {active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-wolf-blue-light" />
            )}
          </Link>
        );
      })}

      <div className="mt-auto mx-2">
        <div className="h-px bg-wolf-blue/10 mb-2" />
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-wolf-muted hover:text-wolf-red hover:bg-wolf-red/10 transition-all duration-200 group"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="font-[family-name:var(--font-rajdhani)] font-semibold tracking-wide text-sm">
              Sair
            </span>
          </button>
        </form>
      </div>
    </nav>
  );
}
