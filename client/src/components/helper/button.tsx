interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success"
    | "dark"
    | "sand";
  size?: "sm" | "md" | "lg" | "xl";
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-bold transition-all flex items-center gap-2 justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed rounded-xl";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-[#BB86FC] text-[#121212] hover:bg-[#a871ea] shadow-sm active:scale-98 font-black",
    secondary:
      "bg-[#03DAC6] text-[#121212] hover:bg-[#02c0ae] shadow-sm active:scale-98 font-black",
    dark:
      "bg-[#252525] text-[#E3E3E3] border border-[#2C2C2C] hover:bg-[#2f2f2f] hover:border-[#BB86FC]/50 active:scale-98",
    sand:
      "bg-[#FFB74D] text-[#121212] hover:bg-[#ffa726] active:scale-98 font-black",
    outline:
      "bg-transparent text-[#BB86FC] border border-[#BB86FC] hover:bg-[#BB86FC]/10 active:scale-98",
    ghost:
      "bg-transparent text-[#9E9E9E] hover:text-[#E3E3E3] hover:bg-[#252525] rounded-xl",
    danger:
      "bg-[#CF6679] text-[#121212] hover:bg-[#c45367] font-black shadow-sm active:scale-98",
    success:
      "bg-[#4CAF50] text-[#121212] hover:bg-[#43a047] font-black shadow-sm active:scale-98",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-3 py-1.5 text-xs font-semibold rounded-lg",
    md: "px-4 py-2.5 text-sm font-semibold rounded-xl",
    lg: "px-6 py-3.5 text-base font-bold rounded-2xl",
    xl: "px-8 py-4 text-lg font-bold rounded-2xl",
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
