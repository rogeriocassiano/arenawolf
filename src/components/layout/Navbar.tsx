"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";
import { Clock, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";

interface NavbarProps {
  profile: Profile;
}

export function Navbar({ profile }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-16 glass border-b border-wolf-blue/15 flex items-center px-4 gap-4">
        <button
          className="lg:hidden p-2 text-wolf-muted hover:text-wolf-white rounded-lg hover:bg-wolf-surface-2 transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/logo-dark-bg.jpg"
            alt="Arena Wolf"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-wolf-white hidden sm:block tracking-wider">
            Arena Wolf
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2 bg-wolf-surface-2 rounded-full px-3 py-1.5 border border-wolf-blue/20">
          <Clock className="size-3.5 text-wolf-blue-light" />
          <span className="text-xs font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-blue-light tracking-wide">
            {formatMinutes(profile.credits_minutes)}
          </span>
          <span className="text-xs text-wolf-muted hidden sm:block">créditos</span>
        </div>

        <Link href="/profile">
          <Avatar className="size-9 cursor-pointer hover:ring-2 hover:ring-wolf-blue/50 transition-all">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback>
              {profile.nickname.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        profile={profile}
      />
    </>
  );
}
