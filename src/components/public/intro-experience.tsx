"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export const INTRO_STORAGE_KEY = "ssap:intro-seen";

type Phase = "hidden" | "loading" | "ready" | "leaving";

/**
 * A typographic title card, not an animation sequence: wordmark, tagline, a
 * short load rule, then the door. Total time under two seconds, no particles,
 * no canvas, no continuous motion, and it can be skipped at any moment.
 */
export function IntroExperience() {
  const pathname = usePathname();
  const [phase, setPhase] = React.useState<Phase>("hidden");

  React.useEffect(() => {
    if (pathname !== "/") return;
    if (typeof window === "undefined") return;

    let seen = false;
    try {
      seen = window.localStorage.getItem(INTRO_STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setPhase("loading");
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => setPhase("ready"), reduced ? 150 : 850);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [pathname]);

  const dismiss = React.useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // storage may be blocked — the card simply shows again next visit
    }
    setPhase("leaving");
    document.body.style.overflow = "";
    window.setTimeout(() => setPhase("hidden"), 260);
  }, []);

  React.useEffect(() => {
    if (phase !== "loading" && phase !== "ready") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, dismiss]);

  if (phase === "hidden") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[120] flex flex-col bg-void transition-opacity duration-200",
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="SS Afterplay"
    >
      <div className="shell flex h-[62px] shrink-0 items-center justify-between border-b border-line">
        <span className="text-[9.5px] font-medium uppercase tracking-[0.3em] text-muted">
          Archive 001
        </span>
        <button
          type="button"
          onClick={dismiss}
          className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-silver transition-colors hover:text-soft"
        >
          Skip
        </button>
      </div>

      <div className="shell flex flex-1 flex-col justify-center">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[2.6rem] leading-none text-soft md:text-[3.4rem]">SS</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.42em] text-silver">
            Afterplay
          </span>
        </div>

        <h1 className="display mt-8 max-w-[16ch] text-[clamp(2.4rem,7vw,5.4rem)] text-soft">
          The game ends.
          <br />
          <span className="italic text-silver">The memories don&apos;t.</span>
        </h1>

        <div className="mt-10 flex w-full max-w-sm items-baseline gap-4">
          <div className="h-px flex-1 bg-line">
            <div
              className={cn(
                "h-px bg-blood transition-[width] duration-700 ease-out",
                phase === "loading" ? "w-1/4" : "w-full",
              )}
            />
          </div>
          <span className="text-[9px] font-medium uppercase tracking-[0.24em] text-muted">
            {phase === "loading" ? "Opening" : "Ready"}
          </span>
        </div>

        <div className="mt-8 h-10">
          <button
            type="button"
            onClick={dismiss}
            className={cn(
              "btn group transition-opacity duration-300",
              phase === "ready" || phase === "leaving"
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            Enter archive
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="shell flex h-[62px] shrink-0 items-center justify-between border-t border-line">
        <span className="text-[9px] uppercase tracking-[0.24em] text-muted/70">
          A personal gaming archive
        </span>
        <span className="text-[9px] uppercase tracking-[0.24em] text-muted/70">
          Press Esc to skip
        </span>
      </div>
    </div>
  );
}
