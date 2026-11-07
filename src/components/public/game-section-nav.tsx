"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface NavSection {
  id: string;
  label: string;
}

export function GameSectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = React.useState(sections[0]?.id ?? "");

  React.useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0.01, 0.3] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="sticky top-[62px] z-40 border-y border-line bg-void md:top-[72px]">
      <div className="shell">
        <nav
          className="scrollbar-none flex items-center gap-6 overflow-x-auto py-3"
          aria-label="On this page"
        >
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "flex shrink-0 items-baseline gap-1.5 border-b py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-200",
                active === section.id
                  ? "border-blood text-soft"
                  : "border-transparent text-muted hover:text-soft",
              )}
            >
              <span className="tabular-nums text-blood/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
