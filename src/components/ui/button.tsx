"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold font-[family-name:var(--font-rajdhani)] tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wolf-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-wolf-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-wolf-blue to-wolf-blue-deep text-white shadow-lg shadow-wolf-blue/20 hover:shadow-wolf-blue/40 hover:brightness-110",
        destructive:
          "bg-wolf-red text-white shadow-wolf-red/20 hover:bg-wolf-red/90",
        outline:
          "border border-wolf-blue/40 bg-transparent text-wolf-blue-light hover:bg-wolf-blue/10 hover:border-wolf-blue",
        ghost:
          "text-wolf-muted hover:text-wolf-white hover:bg-wolf-surface-2",
        secondary:
          "bg-wolf-surface-2 text-wolf-white border border-wolf-blue/20 hover:border-wolf-blue/50",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-500",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
