import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Native select styled to match the archive system.
 * Native is deliberate: it is keyboard accessible, mobile friendly and
 * needs no extra JavaScript on long admin forms.
 */
const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none border border-white/12 bg-white/[0.02] px-3.5 pr-10 text-sm text-soft transition-colors",
          "hover:border-white/20 focus:border-blood/70 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-silver/60" />
    </div>
  ),
);
Select.displayName = "Select";

export { Select };
