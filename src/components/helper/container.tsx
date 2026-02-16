import type React from "react";

export function Container(
  props: React.PropsWithChildren<{ className?: string }>,
) {
  return (
    <div
      className={`max-w-400 mx-auto px-2 md:px-2 py-3 ${props.className ? props.className : ""}`}
    >
      {props.children}
    </div>
  );
}
