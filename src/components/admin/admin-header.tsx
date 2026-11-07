import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function AdminHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-blood/80">{kicker}</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,4vw,2.9rem)] text-soft">{title}</h1>
          {description && (
            <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-silver/55">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      </div>
    </header>
  );
}

export function AdminLinkButton({
  href,
  children,
  variant = "outlet",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "outlet" | "primary";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "inline-flex h-10 items-center gap-2 bg-soft px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-void transition-colors hover:bg-white"
          : "inline-flex h-10 items-center gap-2 border border-white/15 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-soft transition-colors hover:border-blood/50 hover:bg-blood/[0.06]"
      }
    >
      {children}
      <ArrowUpRight className="size-3" />
    </Link>
  );
}
