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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { open: openSearch } = useSearchOverlay();

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
      <header className="sticky top-0 z-[90] border-b border-line bg-void">
        <div className="shell flex h-[62px] items-center justify-between gap-6 md:h-[72px]">
          <Link href="/" className="flex items-baseline gap-2.5" aria-label="SS Afterplay — home">
            <span className="font-serif text-[1.6rem] leading-none text-soft">SS</span>
            <span className="text-[9.5px] font-medium uppercase tracking-[0.34em] text-silver">
              Afterplay
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "border-b py-1.5 text-[10.5px] font-medium uppercase tracking-[0.18em] transition-colors duration-200",
                  isActive(item.href)
                    ? "border-blood text-soft"
                    : "border-transparent text-silver hover:text-soft",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search the archive"
              className="flex h-9 items-center gap-2 px-2 text-silver transition-colors duration-200 hover:text-soft"
            >
              <Search className="size-[15px]" />
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] md:inline">
                Search
              </span>
              <kbd className="hidden border border-line px-1.5 py-0.5 text-[9px] tabular-nums text-muted lg:inline">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center text-silver transition-colors hover:text-soft lg:hidden"
            >
              <Menu className="size-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* mobile navigation */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-void transition-opacity duration-200 lg:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
      >
        <div className="shell flex h-[62px] items-center justify-between border-b border-line">
          <span className="font-serif text-[1.6rem] leading-none">SS</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center text-silver"
          >
            <X className="size-[18px]" />
          </button>
        </div>

        <nav className="shell flex flex-col pt-2" aria-label="Mobile">
          {NAV.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-baseline justify-between border-b border-line py-4"
            >
              <span className="flex items-baseline gap-4">
                <span className="text-[10px] tabular-nums text-blood">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-[2rem] leading-none text-soft">{item.label}</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted">Open</span>
            </Link>
          ))}
        </nav>

        <div className="shell mt-8 flex items-center justify-between">
          <p className="max-w-[60%] font-serif text-base italic text-silver">
            The game ends. The memories don&apos;t.
          </p>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openSearch();
            }}
            className="link-quiet"
          >
            <Search className="size-3.5" /> Search
          </button>
        </div>
      </div>
    </>
  );
}
