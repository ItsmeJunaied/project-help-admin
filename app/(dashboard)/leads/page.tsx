import { backendFetch } from "@/lib/backend";
import { LeadsTable } from "@/components/admin/LeadsTable";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const response = await backendFetch("/admin/leads");
  const leads: Lead[] = await response.json();
  return <LeadsTable leads={leads} />;
}
