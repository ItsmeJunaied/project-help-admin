import { backendFetch } from "@/lib/backend";
import { SubscribersTable } from "@/components/admin/SubscribersTable";
import type { Subscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const response = await backendFetch("/admin/newsletter");
  const subscribers: Subscriber[] = await response.json();
  return <SubscribersTable subscribers={subscribers} />;
}
