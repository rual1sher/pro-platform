import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors border",
  {
    variants: {
      variant: {
        default: "bg-[#BB86FC]/20 text-[#BB86FC] border-[#BB86FC]/40",
        secondary: "bg-[#252525] text-[#E3E3E3] border-[#2C2C2C]",
        destructive: "bg-[#CF6679]/20 text-[#CF6679] border-[#CF6679]/40",
        success: "bg-[#4CAF50]/20 text-[#4CAF50] border-[#4CAF50]/40",
        warning: "bg-[#FFB74D]/20 text-[#FFB74D] border-[#FFB74D]/40",
        accent: "bg-[#03DAC6]/20 text-[#03DAC6] border-[#03DAC6]/40",
        outline: "bg-transparent text-[#E3E3E3] border-[#2C2C2C]",
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
