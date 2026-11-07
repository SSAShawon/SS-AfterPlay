import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/15 text-silver",
        blood: "border-blood/40 bg-blood/[0.07] text-blood",
        solid: "border-soft bg-soft text-void",
        muted: "border-transparent bg-white/[0.04] text-silver",
        success: "border-[#4fa87a]/40 bg-[#4fa87a]/[0.08] text-[#77c79c]",
        warning: "border-[#c99a4b]/40 bg-[#c99a4b]/[0.08] text-[#dcb069]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
