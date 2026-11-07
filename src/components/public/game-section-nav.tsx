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
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.01, 0.25, 0.5] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="sticky top-[68px] z-40 border-y border-white/10 bg-void/92 backdrop-blur-xl md:top-[78px]">
      <div className="shell">
        <nav
          className="scrollbar-none flex items-center gap-1 overflow-x-auto py-2"
          aria-label="On this page"
        >
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "shrink-0 border-b px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
                active === section.id
                  ? "border-blood text-soft"
                  : "border-transparent text-silver/50 hover:text-soft",
              )}
            >
              <span className="mr-1.5 text-blood/50">{String(index + 1).padStart(2, "0")}</span>
              {section.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
