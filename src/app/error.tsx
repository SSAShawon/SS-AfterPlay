"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ss-afterplay] runtime error:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="kicker text-blood">Signal lost</p>
      <h1 className="display mt-5 text-[clamp(2.4rem,6vw,4.4rem)] text-soft">
        The archive could not load.
      </h1>
      <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-silver">
        Something interrupted the connection to the archive database. Try again — if it keeps
        happening, the database may be unreachable.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="btn-ghost"
        >
          <RotateCcw className="size-3.5" /> Try again
        </button>
        <Link
          href="/"
          className="link-quiet"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
