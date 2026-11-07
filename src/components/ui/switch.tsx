"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border border-white/15 transition-colors",
        "data-[state=checked]:border-blood/60 data-[state=checked]:bg-blood/25",
        "data-[state=unchecked]:bg-white/[0.04] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-blood",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-3 translate-x-1 bg-silver transition-transform",
          "data-[state=checked]:translate-x-[1.15rem] data-[state=checked]:bg-blood",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
