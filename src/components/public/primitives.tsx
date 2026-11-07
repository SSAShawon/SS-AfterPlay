import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <div className={cn("flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-start md:justify-between", className)}>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          {index !== undefined && (
            <span className="text-[11px] font-medium tabular-nums tracking-[0.1em] text-blood">
              {typeof index === "number" ? pad(index) : index}
            </span>
          )}
          <span className="kicker">{label}</span>
        </div>
        {title && (
          <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)] text-soft">{title}</h2>
        )}
        {description && (
          <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-silver">{description}</p>
        )}
      </div>
      {action && (
        <Link href={action.href} className="link-quiet group shrink-0 pt-1">
          {action.label}
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
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
    <header className="border-b border-line pb-10 pt-32 md:pb-14 md:pt-40">
      <div className="shell">
        <div className="flex items-center gap-3">
          <span className="archivedot" aria-hidden />
          <p className="kicker">{kicker}</p>
        </div>

        <h1 className="display mt-6 max-w-[18ch] text-[clamp(2.5rem,6vw,4.9rem)] text-soft">
          {title}
        </h1>

        {intro && <p className="lede mt-7 max-w-2xl">{intro}</p>}

        {meta && meta.length > 0 && (
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-5">
            {meta.map((item) => (
              <div key={item.label} className="min-w-[6rem]">
                <dt className="kicker">{item.label}</dt>
                <dd className="mt-1.5 font-serif text-xl leading-none text-soft">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}

const STATUS_TONE: Record<GameStatus, { dot: string; text: string }> = {
  completed: { dot: "bg-silver/70", text: "text-silver" },
  playing: { dot: "bg-blood", text: "text-[#e58383]" },
  on_hold: { dot: "bg-[#c9a15a]", text: "text-[#cfa972]" },
  dropped: { dot: "bg-muted", text: "text-muted" },
  backlog: { dot: "bg-muted", text: "text-muted" },
};

export function StatusBadge({ status, className }: { status: GameStatus; className?: string }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.16em]",
        tone.text,
        className,
      )}
    >
      <span className={cn("size-[5px] rounded-full", tone.dot)} aria-hidden />
      {GAME_STATUS_LABELS[status]}
    </span>
  );
}

export function Rating({ value, className }: { value: number | null; className?: string }) {
  if (value === null || value === undefined) {
    return <span className={cn("text-xs text-muted", className)}>—</span>;
  }
  return (
    <span className={cn("inline-flex items-baseline gap-[3px]", className)}>
      <span className="font-serif text-[1.35rem] leading-none text-soft">{formatRating(value)}</span>
      <span className="text-[9px] font-medium tracking-[0.1em] text-muted">/10</span>
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
    <div className="border-t border-line py-12">
      <p className="kicker">Nothing here yet</p>
      <p className="mt-3 font-serif text-2xl text-soft">{title}</p>
      {description && <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-silver">{description}</p>}
      {action && (
        <Link href={action.href} className="link-quiet mt-5">
          {action.label}
          <ArrowRight className="size-3.5" />
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
  const filtered = items
    .filter((item) => item !== null && item !== undefined && item !== "")
    .map(String);

  return (
    <p className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted", className)}>
      {filtered.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-2.5">
          {index > 0 && <span className="h-px w-3 bg-line-strong" aria-hidden />}
          {item}
        </span>
      ))}
    </p>
  );
}
