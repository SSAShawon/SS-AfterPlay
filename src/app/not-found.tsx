import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 45%, rgba(217,71,71,0.12), transparent 65%), linear-gradient(to bottom, #08090C, #0a0b0e)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

      <div className="relative">
        <p className="eyebrow-blood">Error 404</p>
        <h1 className="display mt-6 text-[clamp(4rem,16vw,11rem)] leading-none text-soft/90">404</h1>
        <p className="mx-auto mt-6 max-w-md font-serif text-2xl italic text-silver/80">
          This file is not in the archive.
        </p>
        <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-silver/50">
          The entry may have been unpublished, renamed, or never finished — like most backlogs.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-soft/25 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-soft transition-colors hover:border-blood hover:bg-blood/10"
          >
            <ArrowLeft className="size-3.5" /> Return to the archive
          </Link>
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 px-4 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-silver/70 transition-colors hover:text-soft"
          >
            <Compass className="size-3.5" /> Browse the collection
          </Link>
        </div>
      </div>
    </main>
  );
}
