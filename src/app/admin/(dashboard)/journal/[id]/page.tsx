import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { JournalForm } from "@/components/admin/journal-form";
import { deletePostAction } from "@/lib/actions/journal";
import { getAdminCategories, getAdminPost } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJournalPage({ params }: PageProps) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getAdminPost(id), getAdminCategories()]);

  if (!post) notFound();

  return (
    <>
      <AdminHeader
        kicker="Content / Journal"
        title={post.title}
        description={`${post.status === "published" ? "Published" : "Draft"} · Updated ${new Date(post.updated_at).toLocaleDateString("en-GB")}`}
        actions={
          <>
            <Link
              href="/admin/journal"
              className="inline-flex h-10 items-center border border-white/15 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-silver/70 transition-colors hover:text-soft"
            >
              All articles
            </Link>
            {post.status === "published" && (
              <Link
                href={`/journal/${post.slug}`}
                target="_blank"
                className="inline-flex h-10 items-center gap-2 border border-white/15 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-soft transition-colors hover:border-blood/50"
              >
                View <ExternalLink className="size-3" />
              </Link>
            )}
            <ConfirmDelete
              action={deletePostAction}
              id={post.id}
              title={`Delete “${post.title}”?`}
              description="This removes the article from the archive permanently."
            />
          </>
        }
      />

      <JournalForm post={post} categories={categories} />
    </>
  );
}
