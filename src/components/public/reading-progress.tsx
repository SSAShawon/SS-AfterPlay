"use client";

import * as React from "react";

export function ReadingProgress() {
  const barRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / scrollable));
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[95] h-[2px] bg-white/[0.04]" aria-hidden>
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-blood"
        style={{ transform: "scaleX(0)", willChange: "transform" }}
      />
    </div>
  );
}
