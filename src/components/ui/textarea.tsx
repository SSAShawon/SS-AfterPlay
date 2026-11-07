import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-28 w-full rounded-none border border-white/12 bg-white/[0.02] px-3.5 py-3 text-sm leading-relaxed text-soft transition-colors",
        "placeholder:text-silver/40 hover:border-white/20 focus:border-blood/70 focus:bg-white/[0.03] focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
