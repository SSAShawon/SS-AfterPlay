"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus, X } from "lucide-react";

import { updateSettingsAction } from "@/lib/actions/settings";
import { IDLE_STATE } from "@/lib/action-state";
import {
  FormAlert,
  MarkdownField,
  SectionCard,
  SubmitButton,
  TextField,
  TextareaField,
} from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SiteSettings, SocialLink } from "@/lib/types";

function SocialEditor({ initial }: { initial: SocialLink[] }) {
  const [links, setLinks] = React.useState<SocialLink[]>(
    initial.length ? initial : [{ label: "", url: "" }],
  );

  const json = JSON.stringify(links.filter((link) => link.label.trim() && link.url.trim()));

  return (
    <div className="space-y-3">
      <Label>Social links</Label>
      <input type="hidden" name="social_links" value={json} />

      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={link.label}
              onChange={(event) =>
                setLinks((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, label: event.target.value } : item,
                  ),
                )
              }
              placeholder="Label (X, Instagram, YouTube…)"
              className="sm:w-40"
              aria-label="Social label"
            />
            <Input
              value={link.url}
              onChange={(event) =>
                setLinks((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, url: event.target.value } : item,
                  ),
                )
              }
              placeholder="https://…"
              aria-label="Social URL"
            />
            <button
              type="button"
              onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove link"
              className="flex size-11 shrink-0 items-center justify-center border border-line text-silver/50 transition-colors hover:border-blood/50 hover:text-blood"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setLinks((current) => [...current, { label: "", url: "" }])}
        className="inline-flex h-9 items-center gap-1.5 border border-line-strong px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-soft transition-colors hover:border-blood/50"
      >
        <Plus className="size-3" /> Add link
      </button>
      <p className="text-[11px] text-silver/40">
        Only full https:// links are stored. Known labels get a matching icon in the footer.
      </p>
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(updateSettingsAction, IDLE_STATE);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />

      <SectionCard title="Identity" description="The name, tagline and contact address used across the site.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="site_name" label="Site name" defaultValue={settings.site_name} required error={errors.site_name} />
          <TextField name="tagline" label="Tagline" defaultValue={settings.tagline} required error={errors.tagline} />
          <TextField
            name="contact_email"
            label="Contact email"
            type="email"
            defaultValue={settings.contact_email}
            error={errors.contact_email}
            className="md:col-span-2"
          />
        </div>
      </SectionCard>

      <SectionCard title="Homepage hero" description="Defaults for the homepage headline block. A hero game can override the headline from the Homepage tab.">
        <div className="space-y-5">
          <TextField name="hero_kicker" label="Hero kicker" defaultValue={settings.hero_kicker} placeholder="Archive 001 — Est. 2018" />
          <TextField name="hero_headline" label="Hero headline" defaultValue={settings.hero_headline} />
          <TextareaField name="hero_subline" label="Hero subline" rows={3} defaultValue={settings.hero_subline} />
        </div>
      </SectionCard>

      <SectionCard title="About page" description="Markdown content for the About page.">
        <MarkdownField name="about_content" label="About content" defaultValue={settings.about_content} rows={16} />
      </SectionCard>

      <SectionCard title="Footer & social" description="Footer note and the links shown in the footer and About page.">
        <div className="space-y-6">
          <TextareaField name="footer_note" label="Footer note" rows={2} defaultValue={settings.footer_note} />
          <SocialEditor initial={settings.social_links} />
        </div>
      </SectionCard>

      <div className="flex justify-end border-t border-line pt-5">
        <SubmitButton label="Save settings" />
      </div>
    </form>
  );
}
