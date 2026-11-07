import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 20%, rgba(217,71,71,0.10), transparent 65%), linear-gradient(to bottom, #08090C, #0b0c10)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="group mb-10 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-silver/50 transition-colors hover:text-soft"
        >
          <ArrowLeft className="size-3 transition-transform duration-500 group-hover:-translate-x-1" />
          Back to the archive
        </Link>

        <div className="border border-white/10 bg-[#0b0c10]/90 p-7 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="display text-2xl tracking-[0.18em] text-soft">SS</span>
            <span className="h-px flex-1 bg-white/10" />
            <ShieldCheck className="size-4 text-blood/70" />
          </div>

          <h1 className="display mt-6 text-3xl text-soft">Archive control room</h1>
          <p className="mt-2 text-xs leading-relaxed text-silver/60">
            Single-administrator access. There is no registration, no social login and no guest
            entry.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>

          <p className="mt-6 border-t border-white/10 pt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-silver/35">
            Unauthorised access attempts are rejected server-side.
          </p>
        </div>

        <p className="mt-6 text-center font-serif text-sm italic text-silver/40">
          The game ends. The memories don&apos;t.
        </p>
      </div>
    </div>
  );
}
