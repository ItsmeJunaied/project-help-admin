import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

type Overview = {
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  recentLeads: Lead[];
  blogPostCount: number;
  applicationCount: number;
};

export default async function AdminOverviewPage() {
  const response = await backendFetch("/admin/stats/overview");
  const stats: Overview = await response.json();

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Leads today", value: stats.leadsToday },
          { label: "Leads this week", value: stats.leadsThisWeek },
          { label: "Total leads", value: stats.totalLeads },
          { label: "Job applications", value: stats.applicationCount },
          { label: "Blog posts", value: stats.blogPostCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line/10 bg-surface p-6">
            <p className="text-3xl font-bold text-heading">{stat.value}</p>
            <p className="mt-1 text-sm text-body">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">Recent leads</h2>
          <Link href="/leads" className="text-sm font-semibold text-accent hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-line/10 bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-body">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-body">
                    No leads yet.
                  </td>
                </tr>
              )}
              {stats.recentLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-line/10 last:border-0">
                  <td className="px-4 py-3 text-heading">{lead.name}</td>
                  <td className="px-4 py-3 text-body">{lead.email}</td>
                  <td className="px-4 py-3 text-body">{lead.service ?? "—"}</td>
                  <td className="px-4 py-3 text-body">{lead.status}</td>
                  <td className="px-4 py-3 text-body">
                    {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
