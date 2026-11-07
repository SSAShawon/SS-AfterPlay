"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSearchOverlay } from "@/components/public/search-provider";

const NAV = [
  { href: "/collection", label: "Collection" },
  { href: "/journal", label: "Journal" },
  { href: "/memories", label: "Memories" },
  { href: "/rankings", label: "Rankings" },
  { href: "/timeline", label: "Timeline" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { open: openSearch } = useSearchOverlay();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[90] transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-void/85 backdrop-blur-xl"
            : "border-b border-transparent bg-gradient-to-b from-black/55 to-transparent",
        )}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-6 md:h-[78px]">
          <Link href="/" className="group flex items-center gap-3" aria-label="SS Afterplay — home">
            <span className="relative flex flex-col leading-none">
              <span className="display text-[1.4rem] tracking-[0.2em] text-soft transition-colors group-hover:text-white">
                SS
              </span>
              <span className="mt-0.5 h-px w-full bg-blood/70" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.34em] text-silver/80 transition-colors group-hover:text-silver md:text-[10px]">
              Afterplay
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "link-underline font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                  isActive(item.href) ? "text-soft" : "text-silver/70 hover:text-soft",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search the archive"
              className="group flex items-center gap-3 border border-white/12 px-3 py-2 transition-colors hover:border-blood/50"
            >
              <Search className="size-3.5 text-silver transition-colors group-hover:text-soft" />
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text Silver/60 text-silver/60 md:inline">
                Search
              </span>
              <kbd className="hidden border border-white/12 px-1.5 py-0.5 font-mono text-[9px] text-silver/50 md:inline">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center border border-white/12 text-silver transition-colors hover:border-blood/50 hover:text-soft lg:hidden"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-void transition-all duration-500 lg:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
      >
        <div className="grain absolute inset-0 opacity-60" />
        <div className="shell relative flex h-[68px] items-center justify-between">
          <span className="display text-[1.4rem] tracking-[0.2em]">SS</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center border border-white/12 text-silver"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="shell relative mt-6 flex flex-col" aria-label="Mobile">
          {NAV.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-baseline justify-between border-b border-white/10 py-5"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-[9px] text-blood/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="display text-4xl text-soft transition-transform duration-500 group-hover:translate-x-1">
                  {item.label}
                </span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-silver/40">
                Open
              </span>
            </Link>
          ))}
        </nav>

        <div className="shell relative mt-10 flex items-center justify-between">
          <p className="max-w-[60%] font-serif text-sm italic text-silver/60">
            The game ends. The memories don&apos;t.
          </p>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openSearch();
            }}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-silver"
          >
            <Search className="size-3.5" /> Search
          </button>
        </div>
      </div>
    </>
  );
}
