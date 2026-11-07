"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export const INTRO_STORAGE_KEY = "ssap:intro-seen";

type Phase = "hidden" | "logo" | "tagline" | "preparing" | "ready" | "leaving";

const TIMELINE: { phase: Phase; at: number }[] = [
  { phase: "logo", at: 250 },
  { phase: "tagline", at: 1900 },
  { phase: "preparing", at: 3400 },
  { phase: "ready", at: 4600 },
];

export function IntroExperience() {
  const pathname = usePathname();
  const [phase, setPhase] = React.useState<Phase>("hidden");
  const [reduced, setReduced] = React.useState(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = React.useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  React.useEffect(() => {
    if (pathname !== "/") return;
    if (typeof window === "undefined") return;

    let seen = false;
    try {
      seen = window.localStorage.getItem(INTRO_STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);

    if (seen) return;

    if (prefersReduced) {
      setPhase("ready");
      document.body.style.overflow = "hidden";
      return;
    }

    setPhase("logo");
    document.body.style.overflow = "hidden";

    TIMELINE.forEach(({ phase: next, at }) => {
      timers.current.push(setTimeout(() => setPhase(next), at));
    });

    return () => {
      clearTimers();
      document.body.style.overflow = "";
    };
  }, [pathname, clearTimers]);

  const dismiss = React.useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // storage may be unavailable — the intro simply shows again next visit
    }
    setPhase("leaving");
    document.body.style.overflow = "";
    clearTimers();
    setTimeout(() => setPhase("hidden"), 650);
  }, [clearTimers]);

  React.useEffect(() => {
    if (phase === "hidden") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, dismiss]);

  if (phase === "hidden") return null;

  const active = phase === "leaving" ? false : true;

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="SS Afterplay intro"
      className={cn(
        "fixed inset-0 z-[120] flex flex-col justify-between overflow-hidden bg-void px-6 py-6 transition-opacity duration-[650ms] md:px-10 md:py-8",
        active && "opacity-100",
        phase === "leaving" && "pointer-events-none opacity-0",
      )}
    >
      {/* atmospheric layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 48%, rgba(217,71,71,0.14), transparent 70%), radial-gradient(90% 60% at 50% 110%, rgba(217,71,71,0.08), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-drift opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(244,244,245,0.35), transparent), radial-gradient(1px 1px at 70% 60%, rgba(244,244,245,0.25), transparent), radial-gradient(1px 1px at 40% 80%, rgba(244,244,245,0.2), transparent), radial-gradient(1px 1px at 85% 20%, rgba(244,244,245,0.3), transparent), radial-gradient(1px 1px at 12% 70%, rgba(244,244,245,0.18), transparent)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

      {/* letterbox bars */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />

      <div className="relative flex items-center justify-between">
        <span className="eyebrow opacity-60">SS / Archive system</span>
        <button
          type="button"
          onClick={dismiss}
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-silver/70 transition-colors hover:text-soft"
        >
          Skip intro
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <div
          className={cn(
            "relative transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            phase === "logo" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          <div className="relative inline-block overflow-hidden px-3">
            <h1 className="display text-[clamp(2.6rem,9vw,7rem)] tracking-[0.16em] text-soft">
              SS<span className="mx-3 text-blood/70">·</span>AFTERPLAY
            </h1>
            {(phase === "logo" || phase === "tagline" || phase === "preparing") && !reduced && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-24 animate-sweep bg-gradient-to-r from-transparent via-soft/45 to-transparent"
              />
            )}
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-blood/70 to-transparent" />
        </div>

        <p
          className={cn(
            "mt-8 font-serif text-[clamp(1rem,2.4vw,1.5rem)] italic text-silver transition-all duration-1000",
            phase === "logo" ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          The game ends. The memories don&apos;t.
        </p>

        <div
          className={cn(
            "mt-14 flex flex-col items-center gap-4 transition-opacity duration-700",
            phase === "preparing" || phase === "ready" || phase === "leaving"
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-1 w-24 overflow-hidden bg-white/10">
              <span
                className={cn(
                  "h-full bg-blood transition-[width] duration-[1400ms] ease-out",
                  phase === "preparing" ? "w-2/3" : "w-full",
                )}
              />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-silver/60">
              {phase === "ready" || phase === "leaving" ? "Archive ready" : "Preparing your archive"}
            </span>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className={cn(
              "group mt-4 inline-flex items-center gap-3 border border-soft/25 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.26em] text-soft transition-all duration-500",
              "hover:border-blood hover:bg-blood/10 hover:tracking-[0.3em]",
              phase === "ready" || phase === "leaving"
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0",
            )}
          >
            Enter archive
            <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-silver/40">
          No sound · Press Esc to skip
        </span>
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.26em] text-silver/40 sm:block">
          Personal archive · 001
        </span>
      </div>
    </div>
  );
}
