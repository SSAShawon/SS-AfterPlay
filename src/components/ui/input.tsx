import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-none border border-white/12 bg-white/[0.02] px-3.5 py-2 text-sm text-soft transition-colors",
        "placeholder:text-silver/40 hover:border-white/20 focus:border-blood/70 focus:bg-white/[0.03] focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:mr-3 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-silver",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
