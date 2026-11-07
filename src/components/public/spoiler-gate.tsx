"use client";

import * as React from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export function SpoilerGate({
  children,
  label = "Full storyline, endings and character fates",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  const [revealed, setRevealed] = React.useState(false);

  if (revealed) {
    return (
      <div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
          <p className="flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[0.2em] text-blood">
            <LockKeyhole className="size-3.5" /> Spoilers revealed
          </p>
          <button
            type="button"
            onClick={() => setRevealed(false)}
            className="flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[0.18em] text-silver transition-colors hover:text-soft"
          >
            <EyeOff className="size-3.5" /> Hide again
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="border-y border-line py-12 md:py-14">
      <div className="max-w-xl">
        <LockKeyhole className="size-4 text-blood" />
        <p className="mt-5 font-serif text-[1.9rem] leading-tight text-soft">
          This section gives away everything.
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-silver">
          {label} are discussed here without warning. The storyline is kept in full because the record
          matters — but it is your choice when to read it.
        </p>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="btn-ghost group mt-6"
        >
          <Eye className="size-3.5" />
          Reveal spoilers
        </button>
      </div>
    </div>
  );
}
