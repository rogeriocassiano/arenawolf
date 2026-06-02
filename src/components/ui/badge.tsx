import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold font-[family-name:var(--font-rajdhani)] tracking-wider uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "bg-wolf-blue/20 text-wolf-blue-light border border-wolf-blue/30",
        free: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        busy: "bg-wolf-red/15 text-red-400 border border-wolf-red/30",
        reserved: "bg-wolf-amber/15 text-amber-400 border border-wolf-amber/30",
        maintenance: "bg-wolf-muted/15 text-wolf-muted border border-wolf-muted/30",
        admin: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
        staff: "bg-wolf-blue/15 text-wolf-blue-light border border-wolf-blue/30",
        user: "bg-wolf-surface-2 text-wolf-muted border border-wolf-blue/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

function Badge({ className, variant, pulse, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {pulse && (
        <span className="size-1.5 rounded-full bg-current pulse-dot" />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
