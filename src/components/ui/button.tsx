import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-blood [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-soft text-void hover:bg-white hover:tracking-[0.22em] shadow-[0_0_0_0_rgba(244,244,245,0)] hover:shadow-[0_10px_40px_-18px_rgba(244,244,245,0.55)]",
        accent:
          "bg-blood text-white hover:bg-[#e25757] hover:tracking-[0.22em] shadow-[0_12px_40px_-22px_rgba(217,71,71,0.9)]",
        outlet:
          "border border-white/15 text-soft hover:border-blood/70 hover:bg-blood/[0.06] hover:text-white",
        ghost: "text-silver hover:text-soft hover:bg-white/[0.04]",
        link: "text-soft underline-offset-4 hover:text-blood px-0 h-auto",
        danger:
          "border border-blood/40 text-blood hover:bg-blood hover:text-white",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-11 px-6",
        lg: "h-13 px-8 text-[12px]",
        icon: "h-9 w-9 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
