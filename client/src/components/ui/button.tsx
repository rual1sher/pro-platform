import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#BB86FC] text-[#121212] hover:bg-[#a871ea] shadow-sm active:scale-[0.98] font-black rounded-xl",
        secondary:
          "bg-[#03DAC6] text-[#121212] hover:bg-[#02c0ae] shadow-sm active:scale-[0.98] font-black rounded-xl",
        dark: "bg-[#252525] text-[#E3E3E3] border border-[#2C2C2C] hover:bg-[#2f2f2f] hover:border-[#BB86FC]/50 active:scale-[0.98] rounded-xl",
        sand: "bg-[#FFB74D] text-[#121212] hover:bg-[#ffa726] active:scale-[0.98] font-black rounded-xl",
        outline:
          "bg-transparent text-[#BB86FC] border border-[#BB86FC] hover:bg-[#BB86FC]/10 active:scale-[0.98] rounded-xl",
        ghost:
          "bg-transparent text-[#9E9E9E] hover:text-[#E3E3E3] hover:bg-[#252525] rounded-xl",
        danger:
          "bg-[#CF6679] text-[#121212] hover:bg-[#c45367] font-black shadow-sm active:scale-[0.98] rounded-xl",
        success:
          "bg-[#4CAF50] text-[#121212] hover:bg-[#43a047] font-black shadow-sm active:scale-[0.98] rounded-xl",
      },
      size: {
        sm: "px-3 py-1.5 text-xs font-semibold rounded-lg",
        md: "px-4 py-2.5 text-sm font-semibold",
        lg: "px-6 py-3.5 text-base font-bold rounded-2xl",
        xl: "px-8 py-4 text-lg font-bold rounded-2xl",
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
