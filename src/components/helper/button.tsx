interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
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
    "group font-bold transition-all flex items-center gap-2 justify-center disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed rounded-lg";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-102",
    secondary:
      "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30 hover:border-white/50 hover:scale-102",
    outline:
      "bg-transparent text-purple-400 hover:text-purple-300 border-2 border-purple-500 hover:bg-purple-500/20 hover:scale-102",
    ghost:
      "bg-transparent text-slate-300 hover:text-white hover:bg-white/5 rounded-xl hover:scale-102",
    danger:
      "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-red-500/50 hover:scale-102",
    success:
      "bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-102",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm",
    md: "px-6 py-2.5 text-sm md:px-6 md:py-3 md:text-lg",
    lg: "px-10 py-5 text-xl",
    xl: "px-12 py-6 text-2xl",
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
