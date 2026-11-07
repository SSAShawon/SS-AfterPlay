"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { INTRO_STORAGE_KEY } from "@/components/public/intro-experience";

export function ReplayIntroButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        try {
          window.localStorage.removeItem(INTRO_STORAGE_KEY);
        } catch {
          // ignore storage failures
        }
        router.push("/");
        router.refresh();
        window.scrollTo({ top: 0 });
        window.setTimeout(() => window.location.assign("/"), 120);
      }}
      className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-silver/50 transition-colors hover:text-soft"
    >
      <RotateCcw className="size-3 transition-transform duration-500 group-hover:-rotate-90" />
      Replay intro
    </button>
  );
}
