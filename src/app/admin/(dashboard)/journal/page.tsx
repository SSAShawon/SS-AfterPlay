import Link from "next/link";
import { Pencil, Search, Tags } from "lucide-react";

import { AdminHeader, AdminLinkButton } from "@/components/admin/admin-header";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FlagToggle } from "@/components/admin/toggle-form";
import { deletePostAction, togglePostFlagAction } from "@/lib/actions/journal";
import { listAdminPosts } from "@/lib/queries/admin";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; state?: string }>;
}

export default async function AdminJournalPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { rows, error } = await listAdminPosts({ search: params.q, state: params.state });

  const filters = [
    { value: "all", label: "All", href: "/admin/journal" },
    { value: "published", label: "Published", href: "/admin/journal?state=published" },
    { value: "draft", label: "Drafts", href: "/admin/journal?state=draft" },
  ];

  return (
    <>
      <AdminHeader
        kicker="Content"
        title="Journal"
        description="Essays and field notes. Drafts are invisible to visitors until published."
        actions={
          <>
            <AdminLinkButton href="/admin/journal/categories">
              <Tags className="size-3" /> Categories
            </AdminLinkButton>
            <AdminLinkButton href="/admin/journal/new" variant="primary">
              New article
            </AdminLinkButton>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/admin/journal" className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-silver/40" />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search articles…"
            className="h-10 w-full border border-line bg-charcoal pl-9 pr-3 text-sm text-soft placeholder:text-silver/40 focus:border-blood/60 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-1">
          {filters.map((filter) => (
            <Link
              key={filter.value}
              href={filter.href}
              className={cn(
                "border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors",
                (params.state ?? "all") === filter.value
                  ? "border-white/25 bg-soft/[0.06] text-soft"
                  : "border-transparent text-silver/50 hover:text-soft",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 border border-blood/40 bg-blood/[0.06] px-3 py-2 text-[12px] text-[#e58383]">
          {error}
        </p>
      )}

      <div className="border border-line bg-charcoal">
        <div className="hidden grid-cols-[1fr_130px_110px_120px_130px] gap-3 border-b border-line px-4 py-2.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-silver/40 md:grid">
          <span>Title</span>
          <span>Category</span>
          <span>State</span>
          <span>Published</span>
          <span className="text-right">Actions</span>
        </div>

        {rows.length === 0 && (
          <div className="px-4 py-10 text-center text-[13px] text-silver/60">No articles found.</div>
        )}

        <ul className="divide-y divide-white/[0.06]">
          {rows.map((post) => (
            <li
              key={post.id}
              className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_130px_110px_120px_130px] md:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/journal/${post.id}`}
                  className="truncate text-[13px] text-soft transition-colors hover:text-white"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-silver/35">
                  /journal/{post.slug} · {post.reading_minutes ?? "—"} min
                </p>
              </div>

              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-silver/55">
                {post.journal_categories?.name ?? "—"}
              </span>

              <div>
                <FlagToggle
                  action={togglePostFlagAction}
                  id={post.id}
                  field="status"
                  value={post.status === "published"}
                  labelOn="Published"
                  labelOff="Draft"
                />
              </div>

              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-silver/35">
                {formatDate(post.published_at, "short") ?? "—"}
              </span>

              <div className="flex items-center gap-1 md:justify-end">
                <FlagToggle
                  action={togglePostFlagAction}
                  id={post.id}
                  field="featured"
                  value={post.featured}
                  labelOn="★ Featured"
                  labelOff="☆ Feature"
                />
                <Link
                  href={`/admin/journal/${post.id}`}
                  aria-label="Edit article"
                  className="flex size-8 items-center justify-center border border-line text-silver/60 transition-colors hover:border-white/25 hover:text-soft"
                >
                  <Pencil className="size-3.5" />
                </Link>
                <ConfirmDelete
                  action={deletePostAction}
                  id={post.id}
                  variant="icon"
                  title={`Delete “${post.title}”?`}
                  description="The article will be removed permanently from the archive."
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
