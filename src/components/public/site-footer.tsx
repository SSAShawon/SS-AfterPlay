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
    <footer className="border-t border-line bg-void">
      <div className="shell py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-baseline gap-2.5">
              <span className="font-serif text-[1.7rem] leading-none text-soft">SS</span>
              <span className="text-[9.5px] font-medium uppercase tracking-[0.34em] text-silver">
                Afterplay
              </span>
            </Link>

            <p className="mt-5 max-w-sm font-serif text-[1.35rem] italic leading-snug text-soft/90">
              {settings.tagline}
            </p>

            {settings.footer_note && (
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted">
                {settings.footer_note}
              </p>
            )}
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <h2 className="kicker">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12.5px] text-silver transition-colors duration-200 hover:text-soft"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-3">
            <h2 className="kicker">Elsewhere</h2>
            <SocialLinks links={settings.social_links} className="mt-4" />
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
                className="mt-5 inline-block text-[12px] text-silver transition-colors hover:text-soft"
              >
                {settings.contact_email}
              </a>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            © {year} SS Afterplay · Fourteen years of games, written down
          </p>
          <div className="flex items-center gap-6">
            <ReplayIntroButton />
            <Link
              href="/admin/login"
              className="text-[10px] uppercase tracking-[0.16em] text-muted/70 transition-colors hover:text-silver"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
