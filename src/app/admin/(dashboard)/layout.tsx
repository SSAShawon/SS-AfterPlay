import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-dvh">
      <AdminSidebar email={user.email ?? "administrator"} />
      <div className="lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-6 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
