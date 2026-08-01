import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
