import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col justify-between border-t-2 border-blood">
      <div className="shell flex h-[62px] items-center justify-between border-b border-line">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-serif text-[1.5rem] leading-none text-soft">SS</span>
          <span className="text-[9.5px] font-medium uppercase tracking-[0.34em] text-silver">
            Afterplay
          </span>
        </Link>
        <span className="kicker">Error 404</span>
      </div>

      <div className="shell flex flex-1 flex-col justify-center py-16">
        <p className="font-serif text-[clamp(4rem,14vw,9rem)] leading-[0.8] text-soft/25">404</p>

        <h1 className="display mt-6 max-w-[18ch] text-[clamp(2rem,5vw,3.6rem)] text-soft">
          This file is not in the archive.
        </h1>

        <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-silver">
          The entry may have been unpublished, renamed, or never finished — like most backlogs.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/" className="btn group">
            <ArrowLeft className="size-3.5" />
            Return to the archive
          </Link>
          <Link href="/collection" className="btn-ghost group">
            Browse the collection
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="shell flex h-[62px] items-center border-t border-line">
        <p className="text-[9px] uppercase tracking-[0.24em] text-muted/70">
          The game ends. The memories don&apos;t.
        </p>
      </div>
    </main>
  );
}
