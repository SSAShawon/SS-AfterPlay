import Link from "next/link";

import { getSiteSettings } from "@/lib/queries/settings";
import { SocialLinks } from "@/components/public/social-links";
import { ReplayIntroButton } from "@/components/public/replay-intro-button";

const COLUMNS = [
  {
    title: "Archive",
    links: [
      { href: "/collection", label: "Collection" },
      { href: "/rankings", label: "Rankings" },
      { href: "/memories", label: "Memories" },
      { href: "/timeline", label: "Timeline" },
    ],
  },
  {
    title: "Reading",
    links: [
      { href: "/journal", label: "Journal" },
      { href: "/about", label: "About the archive" },
      { href: "/search", label: "Search" },
    ],
  },
];

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a0b0e]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blood/40 to-transparent"
      />
      <div className="shell relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex flex-col">
              <span className="display text-4xl tracking-[0.16em] text-soft">SS AFTERPLAY</span>
              <span className="mt-2 h-px w-16 bg-blood" />
            </Link>
            <p className="mt-6 max-w-sm font-serif text-lg italic leading-relaxed text-silver/80">
              {settings.tagline}
            </p>
            {settings.footer_note && (
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-silver/50">
                {settings.footer_note}
              </p>
            )}
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <h2 className="eyebrow">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-silver/70 transition-colors hover:text-soft"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-3">
            <h2 className="eyebrow">Elsewhere</h2>
            <SocialLinks links={settings.social_links} className="mt-4" />
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
                className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-silver/60 transition-colors hover:text-soft"
              >
                {settings.contact_email}
              </a>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-silver/40">
            © {year} SS Afterplay · All words are personal opinion
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <ReplayIntroButton />
            <Link
              href="/admin/login"
              className="font-mono text-[9px] uppercase tracking-[0.22em] text-silver/30 transition-colors hover:text-silver/70"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
