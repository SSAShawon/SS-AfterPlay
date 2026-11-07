export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-[1.6rem] leading-none text-soft">SS</span>
        <span className="h-px w-8 bg-blood" aria-hidden />
        <span className="text-[9px] font-medium uppercase tracking-[0.26em] text-muted">
          Opening the archive
        </span>
      </div>
    </div>
  );
}
