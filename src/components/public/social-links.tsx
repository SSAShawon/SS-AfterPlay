import { Link2 } from "lucide-react";

import type { SocialLink } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  x: (
    <path d="M3 3l7.1 9.2L3.4 21h2.3l5.6-7.1 5.5 7.1H21l-7.4-9.6L20.4 3h-2.3l-5 6.5L8.2 3H3z" />
  ),
  twitter: (
    <path d="M3 3l7.1 9.2L3.4 21h2.3l5.6-7.1 5.5 7.1H21l-7.4-9.6L20.4 3h-2.3l-5 6.5L8.2 3H3z" />
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="7" r="1" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
    </>
  ),
  github: (
    <path d="M12 2.2a9.8 9.8 0 00-3.1 19.1c.5.1.7-.2.7-.5v-1.9c-2.7.6-3.3-1.2-3.3-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.8 9.8 0 0012 2.2z" />
  ),
  letterboxd: (
    <>
      <circle cx="7" cy="12" r="3.4" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="17" cy="12" r="3.4" />
    </>
  ),
  bluesky: <path d="M12 3c3 3.4 6.5 5 9 4.4-1 6.3-4.4 10-9 13.6C7.4 17.4 4 13.7 3 7.4 5.5 8 9 6.4 12 3z" />,
  threads: (
    <path d="M16 8.5c-1.2-1-2.5-1.3-3.7-1-1.6.4-2.5 1.7-2.2 3 .4 1.7 2.7 2 4.6 1 1.6-.9 1.4-3.2-.8-3.8-2.4-.7-4.6 1-4.5 3.5.1 2.7 3.4 3.6 5.6 2.3" />
  ),
};

export function SocialLinks({
  links,
  className,
  iconOnly = false,
}: {
  links: SocialLink[];
  className?: string;
  iconOnly?: boolean;
}) {
  if (!links?.length) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-4", className)}>
      {links.map((link) => {
        const key = link.label.trim().toLowerCase();
        const icon = ICONS[key];
        return (
          <li key={`${link.label}-${link.url}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-silver/70 transition-colors hover:text-soft"
              aria-label={link.label}
            >
              <span className="flex size-8 items-center justify-center border border-white/12 transition-colors group-hover:border-blood/60 group-hover:text-blood">
                {icon ? (
                  <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
                    {icon}
                  </svg>
                ) : (
                  <Link2 className="size-3.5" aria-hidden />
                )}
              </span>
              {!iconOnly && <span className="hidden sm:inline">{link.label}</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
