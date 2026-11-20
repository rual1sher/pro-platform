import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-3.5 py-2 bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-disabled)] text-sm font-normal focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/40 shadow-[inset_0_1px_1px_rgba(0,0,0,0.25)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
