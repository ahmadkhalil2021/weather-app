import * as React from "react";
import { cn } from "../utils/cn";

export function Container(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        // Default translucent surface; consumers can override via className
        // (e.g. `<Container className="bg-yellow-300/80 ...">` — the Tailwind
        // bg-* utility still wins by cascade order).
        "w-full glass bg-white/65 dark:bg-gray-900/65 dark:text-gray-100 rounded-xl flex py-4",
        props.className
      )}
    />
  );
}
