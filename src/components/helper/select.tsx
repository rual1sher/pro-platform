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
        "w-full px-2 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-100"
      }
    >
      {props.children}
    </select>
  );
}
