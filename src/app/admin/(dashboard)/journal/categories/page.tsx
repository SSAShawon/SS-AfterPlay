import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCategories } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function JournalCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminHeader
        kicker="Content / Journal"
        title="Categories"
        description="Categories organise the journal and drive its filter bar."
        actions={
          <Link
            href="/admin/journal"
            className="inline-flex h-10 items-center border border-line-strong px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-silver/70 transition-colors hover:text-soft"
          >
            Back to journal
          </Link>
        }
      />

      <CategoryManager categories={categories} />
    </>
  );
}
