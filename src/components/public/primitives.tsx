import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn, formatRating, pad } from "@/lib/utils";
import { GAME_STATUS_LABELS, type GameStatus } from "@/lib/types";

export function SectionHeading({
  index,
  label,
  title,
  description,
  action,
  className,
}: {
  index?: number | string;
  label: string;
  title?: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          {index !== undefined && (
            <span className="font-mono text-[10px] text-blood/80">
              {typeof index === "number" ? pad(index) : index}
            </span>
          )}
          <span className="h-px w-8 bg-white/20" />
          <span className="eyebrow">{label}</span>
        </div>
        {title && (
          <h2 className="display mt-4 text-[clamp(2rem,4.4vw,3.4rem)] text-soft">{title}</h2>
        )}
        {description && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-silver/80">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-silver transition-colors hover:text-soft"
        >
          {action.label}
          <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  intro,
  meta,
}: {
  kicker: string;
  title: string;
  intro?: string;
  meta?: { label: string; value: string }[];
}) {
  return (
    <header className="relative overflow-hidden border-b border-white/10 pb-12 pt-32 md:pb-16 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(60% 60% at 15% 0%, rgba(217,71,71,0.10), transparent 65%), linear-gradient(to bottom, #0a0b0e, #08090C)",
        }}
      />
      <div className="shell relative">
        <p className="eyebrow-blood">{kicker}</p>
        <h1 className="display mt-6 max-w-4xl text-[clamp(2.6rem,6.5vw,5.2rem)] text-soft">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-silver/80 md:text-base">
            {intro}
          </p>
        )}
        {meta && meta.length > 0 && (
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/10 pt-6">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="eyebrow">{item.label}</dt>
                <dd className="mt-1.5 font-serif text-2xl text-soft">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}

const STATUS_STYLES: Record<GameStatus, string> = {
  completed: "border-[#4fa87a]/35 bg-[#4fa87a]/[0.08] text-[#7cc9a1]",
  playing: "border-blood/45 bg-blood/[0.08] text-[#e77c7c]",
  on_hold: "border-[#c99a4b]/35 bg-[#c99a4b]/[0.08] text-[#d9b273]",
  dropped: "border-white/15 bg-white/[0.03] text-silver/70",
  backlog: "border-white/15 bg-white/[0.02] text-silver/60",
};

export function StatusBadge({ status, className }: { status: GameStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.2em]",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status === "playing" && (
        <span className="size-1 animate-pulse-soft rounded-full bg-blood" aria-hidden />
      )}
      {GAME_STATUS_LABELS[status]}
    </span>
  );
}

export function Rating({ value, className }: { value: number | null; className?: string }) {
  if (value === null || value === undefined) {
    return <span className={cn("font-mono text-xs text-silver/40", className)}>—</span>;
  }
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span className="font-serif text-xl leading-none text-soft">{formatRating(value)}</span>
      <span className="font-mono text-[9px] text-silver/40">/10</span>
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-white/12 bg-white/[0.015] p-10">
      <span className="eyebrow-blood">No entries</span>
      <p className="font-serif text-2xl text-soft">{title}</p>
      {description && <p className="max-w-md text-sm leading-relaxed text-silver/70">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-soft underline-offset-4 hover:underline"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function MetaRow({
  items,
  className,
}: {
  items: (string | number | null | undefined)[];
  className?: string;
}) {
  const filtered = items.filter((item) => item !== null && item !== undefined && item !== "").map(String);
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.2em] text-silver/55",
        className,
      )}
    >
      {filtered.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-3">
          {index > 0 && <span className="text-blood/60">/</span>}
          {item}
        </span>
      ))}
    </p>
  );
}
