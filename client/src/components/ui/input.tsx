import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-3.5 py-2.5 bg-[#252525] border border-[#2C2C2C] rounded-2xl text-[#E3E3E3] placeholder-[#616161] text-sm font-medium focus:outline-none focus:border-[#BB86FC] focus:ring-1 focus:ring-[#BB86FC] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

