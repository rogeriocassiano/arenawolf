"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Profile } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
}

export function MobileSidebar({ open, onClose, profile }: MobileSidebarProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 z-50 bg-wolf-surface border-r border-wolf-blue/15 transition-transform duration-300 lg:hidden flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-wolf-blue/15">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {profile.nickname.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white text-sm">
              {profile.nickname}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar onClose={onClose} />
        </div>
      </aside>
    </>
  );
}
