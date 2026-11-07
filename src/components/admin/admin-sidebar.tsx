"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  ExternalLink,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/games", label: "Games", icon: Gamepad2 },
  { href: "/admin/journal", label: "Journal", icon: BookOpen },
  { href: "/admin/memories", label: "Memories", icon: Sparkles },
  { href: "/admin/rankings", label: "Rankings", icon: Trophy },
  { href: "/admin/timeline", label: "Timeline", icon: CalendarClock },
  { href: "/admin/homepage", label: "Homepage", icon: Menu },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const nav = (
    <nav className="space-y-0.5" aria-label="Admin">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 border-l px-4 py-2.5 text-[12px] transition-colors",
              isActive(item)
                ? "border-blood bg-ink text-soft"
                : "border-transparent text-silver/60 hover:border-line-strong hover:text-soft",
            )}
          >
            <Icon className="size-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-void px-4 py-3 lg:hidden">
        <Link href="/admin" className="display text-lg tracking-[0.2em]">
          SS · Admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="flex size-9 items-center justify-center border border-line text-silver"
        >
          <Menu className="size-4" />
        </button>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-[#0a0b0e] lg:flex">
        <div className="border-b border-line px-5 py-5">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="display text-xl tracking-[0.2em] text-soft">SS</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-silver/50">
              Control room
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">{nav}</div>

        <div className="border-t border-line p-4">
          <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-silver/40">
            {email}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex flex-1 items-center justify-center gap-1.5 border border-line py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/70 transition-colors hover:border-white/25 hover:text-soft"
            >
              <ExternalLink className="size-3" /> Site
            </Link>
            <form action={signOutAction} className="flex-1">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 border border-line py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/70 transition-colors hover:border-blood/50 hover:text-blood"
              >
                <LogOut className="size-3" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-void transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="display text-lg tracking-[0.2em]">SS · Admin</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
            className="flex size-9 items-center justify-center border border-line text-silver"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="py-4">{nav}</div>
        <div className="border-t border-line p-4">
          <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-silver/40">
            {email}
          </p>
          <form action={signOutAction} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 border border-line py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/70"
            >
              <LogOut className="size-3" /> Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
