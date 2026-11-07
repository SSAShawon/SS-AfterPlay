export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="display text-2xl tracking-[0.3em] text-soft/70">SS</span>
        <span className="relative h-px w-28 overflow-hidden bg-white/10">
          <span className="absolute inset-y-0 left-0 w-1/3 animate-pulse-soft bg-blood" />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-silver/40">
          Loading archive
        </span>
      </div>
    </div>
  );
}
