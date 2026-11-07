import { formatRating } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Editorial score presentation: a hairline rule rather than a gauge.
 * Kept as a static element so review sections paint instantly.
 */
export function ScoreBar({
  value,
  label,
  className,
}: {
  value: number | null;
  label?: string;
  className?: string;
}) {
  const pct = value === null ? 0 : Math.min(100, Math.max(0, (value / 10) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-4">
        {label && (
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{label}</span>
        )}
        <span className="font-serif text-lg leading-none text-soft">
          {value === null ? "—" : formatRating(value)}
        </span>
      </div>
      <div className="mt-2 h-px w-full bg-line">
        <div className="h-px bg-soft/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function RatingDial({ value, size = 128 }: { value: number | null; size?: number }) {
  return (
    <div className="flex items-start gap-3" style={{ minHeight: size / 4 }}>
      <span className="font-serif text-[3.75rem] leading-[0.8] text-soft">
        {value === null ? "—" : formatRating(value)}
      </span>
      <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
        / 10
        <br />
        personal
      </span>
    </div>
  );
}
