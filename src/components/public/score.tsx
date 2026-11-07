import { formatRating } from "@/lib/utils";

export function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const value = score ?? 0;
  return (
    <div className="border-b border-white/[0.07] py-5">
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="font-serif text-xl text-soft">{label}</h4>
        <span className="font-mono text-[10px] text-silver/60">
          {score === null ? "—" : `${formatRating(score)}/10`}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="relative h-[3px] flex-1 bg-white/[0.08]">
          <span
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blood-deep/70 to-blood"
            style={{ width: `${Math.min(100, (value / 10) * 100)}%` }}
          />
        </span>
      </div>
    </div>
  );
}

export function RatingDial({ value, size = 132 }: { value: number | null; size?: number }) {
  const rating = value ?? 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (Math.min(10, Math.max(0, rating)) / 10) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(244,244,245,0.10)" strokeWidth="1.5" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#D94747"
          strokeWidth="1.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl leading-none text-soft">
          {value === null ? "—" : formatRating(value)}
        </span>
        <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.24em] text-silver/45">
          out of 10
        </span>
      </div>
    </div>
  );
}
