import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="shell flex h-[62px] items-center justify-between border-b border-line">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-serif text-[1.5rem] leading-none text-soft">SS</span>
          <span className="text-[9.5px] font-medium uppercase tracking-[0.34em] text-silver">
            Afterplay
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-soft"
        >
          <ArrowLeft className="size-3" />
          Back to the archive
        </Link>
      </div>

      <div className="shell flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <span className="archivedot" aria-hidden />
            <p className="kicker">Control room</p>
          </div>

          <h1 className="display mt-4 text-[2.1rem] leading-tight text-soft">
            Sign in to the archive
          </h1>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
            Single-administrator access. No registration, no social login, no guest entry.
          </p>

          <div className="mt-8 border-t border-line pt-7">
            <LoginForm />
          </div>

          <p className="mt-7 flex items-center gap-2 border-t border-line pt-4 text-[9px] uppercase tracking-[0.16em] text-muted">
            <ShieldCheck className="size-3.5" />
            Unauthorised attempts are rejected server-side
          </p>
        </div>
      </div>

      <div className="shell flex h-[62px] items-center border-t border-line">
        <p className="text-[9px] uppercase tracking-[0.24em] text-muted/70">
          The game ends. The memories don&apos;t.
        </p>
      </div>
    </div>
  );
}
