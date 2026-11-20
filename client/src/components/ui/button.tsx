import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 cursor-pointer tracking-tight",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--brand-primary)] text-[var(--bg-main)] hover:bg-[var(--brand-primary-hover)] font-semibold rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.3)] active:scale-[0.98]",
        secondary:
          "bg-[var(--brand-secondary)] text-[var(--bg-main)] hover:opacity-95 font-semibold rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.3)] active:scale-[0.98]",
        dark: "bg-[var(--bg-overlay)] text-[var(--text-primary)] border border-[var(--border-light)] hover:border-white/20 hover:bg-[var(--bg-overlay)]/90 font-medium rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.2)] active:scale-[0.98]",
        sand: "bg-[var(--status-warning)] text-[var(--bg-main)] hover:opacity-95 font-semibold rounded-lg shadow-sm active:scale-[0.98]",
        outline:
          "bg-transparent text-[var(--brand-primary)] border border-[var(--brand-primary)]/80 hover:bg-[var(--brand-primary)]/10 font-medium rounded-lg active:scale-[0.98]",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] font-medium rounded-lg",
        danger:
          "bg-[var(--status-error)] text-[var(--bg-main)] hover:opacity-95 font-semibold rounded-lg shadow-sm active:scale-[0.98]",
        success:
          "bg-[var(--status-success)] text-[var(--bg-main)] hover:opacity-95 font-semibold rounded-lg shadow-sm active:scale-[0.98]",
      },
      size: {
        sm: "px-2.5 py-1.5 text-xs font-medium rounded-md",
        md: "px-3.5 py-2 text-sm font-medium rounded-lg",
        lg: "px-5 py-2.5 text-sm font-semibold rounded-lg",
        xl: "px-6 py-3 text-base font-semibold rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
