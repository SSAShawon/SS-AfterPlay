"use client";

import * as React from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";

export function SpoilerGate({
  children,
  label = "Major plot details",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  const [revealed, setRevealed] = React.useState(false);

  if (revealed) {
    return (
      <div className="relative">
        <div className="mb-6 flex items-center justify-between border border-blood/25 bg-blood/[0.04] px-4 py-3">
          <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-blood/90">
            <ShieldAlert className="size-3.5" /> Spoilers revealed
          </p>
          <button
            type="button"
            onClick={() => setRevealed(false)}
            className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-silver/60 transition-colors hover:text-soft"
          >
            <EyeOff className="size-3.5" /> Hide
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#0c0e12]">
      <div className="pointer-events-none select-none blur-md" aria-hidden>
        <div className="space-y-4 p-6 opacity-40">
          <div className="h-4 w-11/12 bg-white/20" />
          <div className="h-4 w-10/12 bg-white/15" />
          <div className="h-4 w-9/12 bg-white/10" />
          <div className="h-4 w-11/12 bg-white/10" />
          <div className="h-4 w-7/12 bg-white/10" />
          <div className="mt-8 h-4 w-10/12 bg-white/10" />
          <div className="h-4 w-8/12 bg-white/10" />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void/70 px-6 text-center backdrop-blur-[2px]">
        <ShieldAlert className="size-5 text-blood" />
        <div>
          <p className="font-serif text-2xl text-soft">This section gives away everything.</p>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-silver/70">
            {label} — full storyline, endings and character fates are discussed without warning.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="group mt-2 inline-flex items-center gap-3 border border-soft/25 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-soft transition-all duration-500 hover:border-blood hover:bg-blood/10"
        >
          <Eye className="size-3.5" />
          Reveal spoilers
        </button>
      </div>
    </div>
  );
}
