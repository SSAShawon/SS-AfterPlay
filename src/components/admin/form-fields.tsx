"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, Eye, ImageOff, Loader2, Pencil } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, slugify } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-[11px] leading-relaxed text-silver/45">{hint}</p>}
      {error && <p className="text-[11px] text-blood">{error}</p>}
    </div>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  error,
  type = "text",
  required,
  className,
  step,
  min,
  max,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  hint?: string;
  error?: string;
  type?: string;
  required?: boolean;
  className?: string;
  step?: string;
  min?: string | number;
  max?: string | number;
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} className={className}>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
      />
    </Field>
  );
}

export function TextareaField({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  error,
  rows = 4,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  hint?: string;
  error?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} className={className}>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
      />
    </Field>
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  hint,
  error,
  className,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  hint?: string;
  error?: string;
  className?: string;
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} className={className}>
      <div className="relative">
        <select
          id={name}
          name={name}
          defaultValue={defaultValue ?? ""}
          className="h-11 w-full appearance-none border border-white/12 bg-white/[0.02] px-3.5 pr-9 text-sm text-soft transition-colors hover:border-white/20 focus:border-blood/70 focus:outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0d0f13]">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-silver/40">
          ▾
        </span>
      </div>
    </Field>
  );
}

export function CheckboxField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-white/10 bg-white/[0.015] p-3.5 transition-colors hover:border-white/20">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center border border-white/20 transition-colors peer-checked:border-blood peer-checked:bg-blood/20 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blood"
      >
        <Check className="size-3 text-blood opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
      <span>
        <span className="block text-[12px] font-medium text-soft">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-relaxed text-silver/45">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function SlugField({
  name = "slug",
  label = "Slug",
  defaultValue,
  watchField = "title",
  error,
  hint,
}: {
  name?: string;
  label?: string;
  defaultValue?: string | null;
  watchField?: string;
  error?: string;
  hint?: string;
}) {
  const [value, setValue] = React.useState(defaultValue ?? "");
  const [touched, setTouched] = React.useState(Boolean(defaultValue));

  React.useEffect(() => {
    if (touched) return;

    const titleInput = document.querySelector<HTMLInputElement>(`[name="${watchField}"]`);
    if (!titleInput) return;

    const sync = () => setValue(slugify(titleInput.value));
    titleInput.addEventListener("input", sync);
    return () => titleInput.removeEventListener("input", sync);
  }, [touched, watchField]);

  return (
    <Field
      label={label}
      htmlFor={name}
      error={error}
      hint={hint ?? "Used in the public URL. Lowercase letters, numbers and hyphens only."}
    >
      <Input
        id={name}
        name={name}
        value={value}
        onChange={(event) => {
          setTouched(true);
          setValue(slugify(event.target.value));
        }}
        placeholder="my-entry-slug"
        aria-invalid={Boolean(error)}
      />
    </Field>
  );
}

export function ImageUrlField({
  name,
  label,
  defaultValue,
  hint,
  error,
  aspect = "cover",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  error?: string;
  aspect?: "cover" | "hero" | "square";
}) {
  const [value, setValue] = React.useState(defaultValue ?? "");
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "error">("idle");

  const trimmed = value.trim();
  const validShape = /^https?:\/\/\S+$/i.test(trimmed);

  React.useEffect(() => {
    if (!trimmed) {
      setStatus("idle");
      return;
    }
    if (!validShape) {
      setStatus("error");
      return;
    }
    setStatus("loading");
  }, [trimmed, validShape]);

  return (
    <Field
      label={label}
      htmlFor={name}
      hint={hint ?? "Paste the ImgBB direct image URL (https://i.ibb.co/…)."}
      error={error}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
        <div className="space-y-2">
          <Input
            id={name}
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="https://i.ibb.co/xxxx/artwork.jpg"
            aria-invalid={Boolean(error)}
            inputMode="url"
          />
          <div className="flex items-center gap-3 text-[11px]">
            {status === "error" && (
              <span className="flex items-center gap-1.5 text-blood">
                <AlertCircle className="size-3" /> Enter a full https image URL
              </span>
            )}
            {status === "ok" && (
              <span className="flex items-center gap-1.5 text-[#7cc9a1]">
                <Check className="size-3" /> Image loaded
              </span>
            )}
            {status === "loading" && (
              <span className="flex items-center gap-1.5 text-silver/50">
                <Loader2 className="size-3 animate-spin" /> Checking image…
              </span>
            )}
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="ml-auto text-silver/50 underline-offset-4 hover:text-soft hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div
          className={cn(
            "relative overflow-hidden border border-white/12 bg-charcoal",
            aspect === "cover" && "aspect-[3/4]",
            aspect === "hero" && "aspect-video",
            aspect === "square" && "aspect-square",
          )}
        >
          {validShape ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trimmed}
              alt="Artwork preview"
              className={cn(
                "size-full object-cover transition-opacity",
                status === "ok" ? "opacity-100" : "opacity-40",
              )}
              onLoad={() => setStatus("ok")}
              onError={() => setStatus("error")}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-silver/30">
              <ImageOff className="size-4" />
              <span className="font-mono text-[8px] uppercase tracking-[0.18em]">No image</span>
            </div>
          )}
        </div>
      </div>
    </Field>
  );
}

export function MarkdownField({
  name,
  label,
  defaultValue,
  rows = 12,
  hint,
  error,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
  error?: string;
  placeholder?: string;
}) {
  const [mode, setMode] = React.useState<"write" | "preview">("write");
  const [value, setValue] = React.useState(defaultValue ?? "");

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <Label htmlFor={name}>{label}</Label>
        <div className="flex items-center border border-white/10">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
              mode === "write" ? "bg-soft/[0.07] text-soft" : "text-silver/50 hover:text-soft",
            )}
          >
            <Pencil className="size-3" /> Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "flex items-center gap-1.5 border-l border-white/10 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
              mode === "preview" ? "bg-soft/[0.07] text-soft" : "text-silver/50 hover:text-soft",
            )}
          >
            <Eye className="size-3" /> Preview
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <Textarea
          id={name}
          name={name}
          rows={rows}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder ?? "Markdown supported: ## headings, **bold**, > quotes, - lists, [links](url)"}
          className="font-mono text-[13px] leading-relaxed"
          aria-invalid={Boolean(error)}
        />
      ) : (
        <>
          <input type="hidden" name={name} value={value} />
          <div className="min-h-32 max-w-none border border-white/12 bg-white/[0.015] p-5">
            {value.trim() ? (
              <div className="prose prose-archive max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-xs text-silver/40">Nothing to preview yet.</p>
            )}
          </div>
        </>
      )}

      {hint && !error && <p className="text-[11px] leading-relaxed text-silver/45">{hint}</p>}
      {error && <p className="text-[11px] text-blood">{error}</p>}
    </div>
  );
}

export function SubmitButton({
  label = "Save changes",
  pendingLabel = "Saving…",
  variant = "primary",
  className,
}: {
  label?: string;
  pendingLabel?: string;
  variant?: "primary" | "outlet" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();

  const styles = {
    primary: "bg-soft text-void hover:bg-white",
    outlet: "border border-white/20 text-soft hover:border-blood/60 hover:bg-blood/[0.06]",
    danger: "border border-blood/40 text-blood hover:bg-blood hover:text-white",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 px-5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all disabled:cursor-not-allowed disabled:opacity-50",
        styles,
        className,
      )}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function FormAlert({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 border px-3.5 py-2.5 text-[12px]",
        state.status === "success"
          ? "border-[#4fa872]/40 bg-[#4fa872]/[0.07] text-[#8fd0ac]"
          : "border-blood/40 bg-blood/[0.07] text-[#e58383]",
      )}
    >
      {state.status === "success" ? (
        <Check className="mt-0.5 size-3.5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      )}
      <span>{state.message ?? (state.status === "success" ? "Saved." : "Something went wrong.")}</span>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  actions,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 border border-white/10 bg-[#0b0c10]">
      <header className="flex flex-col gap-2 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl text-soft">{title}</h2>
          {description && <p className="mt-1 text-[11px] leading-relaxed text-silver/50">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
