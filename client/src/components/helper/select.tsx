import type React from "react";

export function Selector(
  props: React.PropsWithChildren<{
    name: string;
    value: string;
    setValue: (e: string) => void;
    className?: string;
    loader?: boolean;
  }>,
) {
  return (
    <select
      name={props.name}
      disabled={props.loader}
      id={props.name}
      value={props.value}
      onChange={(e) => props.setValue(e.target.value)}
      className={
        "w-full px-3 py-2 text-sm bg-[#252525] border border-[#2C2C2C] rounded-xl focus:border-[#BB86FC] outline-none transition-all text-[#E3E3E3]"
      }
    >
      {props.children}
    </select>
  );
}
