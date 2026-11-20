import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors border",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border-[var(--brand-primary)]/40",
        secondary:
          "bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border-light)]",
        destructive:
          "bg-[var(--status-error)]/20 text-[var(--status-error)] border-[var(--status-error)]/40",
        success:
          "bg-[var(--status-success)]/20 text-[var(--status-success)] border-[var(--status-success)]/40",
        warning:
          "bg-[var(--status-warning)]/20 text-[var(--status-warning)] border-[var(--status-warning)]/40",
        accent:
          "bg-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] border-[var(--brand-secondary)]/40",
        outline: "bg-transparent text-[var(--text-primary)] border-[var(--border-light)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
