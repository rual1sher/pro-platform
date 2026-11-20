import type React from "react";
import { cn } from "../../lib/utils";

interface ContainerProps extends React.PropsWithChildren {
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 py-4", className)}>
      {children}
    </div>
  );
}
