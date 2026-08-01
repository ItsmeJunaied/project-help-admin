import { backendFetch } from "@/lib/backend";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import type { JobApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const response = await backendFetch("/admin/applications");
  const applications: JobApplication[] = await response.json();
  return <ApplicationsTable applications={applications} />;
}
