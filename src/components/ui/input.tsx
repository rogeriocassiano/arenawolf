import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-wolf-muted font-[family-name:var(--font-rajdhani)] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wolf-muted">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md bg-wolf-surface-2 border border-wolf-blue/20 px-3 py-2 text-sm text-wolf-white",
              "placeholder:text-wolf-muted/60",
              "focus:outline-none focus:border-wolf-blue focus:ring-1 focus:ring-wolf-blue/40",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              leftIcon && "pl-10",
              error && "border-wolf-red focus:border-wolf-red focus:ring-wolf-red/40",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-wolf-red">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
