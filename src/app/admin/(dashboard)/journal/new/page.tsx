import { AdminHeader } from "@/components/admin/admin-header";
import { JournalForm } from "@/components/admin/journal-form";
import { getAdminCategories } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function NewJournalPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminHeader
        kicker="Content / Journal"
        title="New journal entry"
        description="Long-form Markdown with a live preview. Save as a draft until it is ready."
      />
      <JournalForm categories={categories} />
    </>
  );
}
