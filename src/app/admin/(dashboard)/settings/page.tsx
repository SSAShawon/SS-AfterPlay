import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { SectionCard } from "@/components/admin/form-fields";
import { SettingsForm } from "@/components/admin/settings-form";
import { ADMIN_EMAIL, requireAdmin } from "@/lib/auth";
import { getAdminSettings } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [user, settings] = await Promise.all([requireAdmin(), getAdminSettings()]);

  return (
    <>
      <AdminHeader
        kicker="Configuration"
        title="Settings"
        description="Site identity, homepage defaults, About content, footer links and the administrator account."
      />

      {settings && <SettingsForm settings={settings} />}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Administrator account"
          description="Single-administrator model. There is no registration and no way to add another administrator from this interface."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 border border-white/10 p-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#7cc9a1]" />
              <div className="min-w-0">
                <p className="text-[12px] text-soft">{user.email}</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-silver/40">
                  Authorised administrator
                </p>
              </div>
            </div>

            <ChangePasswordForm />
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Environment" description="Where this deployment gets its data and secrets.">
            <dl className="space-y-3 text-[11px]">
              {[
                {
                  label: "Supabase project",
                  value: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").split(".")[0] ?? "not configured",
                },
                { label: "Authorised admin email", value: ADMIN_EMAIL },
                { label: "Site URL", value: process.env.NEXT_PUBLIC_SITE_URL ?? "not configured" },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] pb-2">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-silver/40">{item.label}</dt>
                  <dd className="truncate text-silver/70">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[11px] leading-relaxed text-silver/40">
              Service-role keys are never imported into any page or component. Public reads use the
              publishable key under row-level security; admin writes use the signed-in session.
            </p>
          </SectionCard>

          <SectionCard title="Quick links" description="Jump to the public version of the archive.">
            <ul className="space-y-2">
              {[
                { href: "/", label: "Homepage" },
                { href: "/collection", label: "Collection" },
                { href: "/journal", label: "Journal" },
                { href: "/about", label: "About" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target="_blank"
                    className="flex items-center justify-between border-b border-white/[0.06] py-2 text-[12px] text-silver/65 transition-colors hover:text-soft"
                  >
                    {link.label}
                    <ExternalLink className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
