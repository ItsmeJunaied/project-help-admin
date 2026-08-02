import Link from "next/link";
import { formatCompact, type AnalyticsResponse } from "@/lib/analytics-types";
import { TimeSeriesChart } from "@/components/admin/TimeSeriesChart";

export function AnalyticsOverview({ data }: { data: AnalyticsResponse }) {
  if (!data.configured) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-line/20 bg-surface p-6 text-center">
        <h2 className="text-lg font-bold text-heading">
          {data.error ? "Google Analytics request failed" : "Google Analytics not connected"}
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-body">
          {data.error ??
            "Add GA_PROPERTY_ID, GA_CLIENT_EMAIL, and GA_PRIVATE_KEY to the backend environment to show traffic data here."}
        </p>
      </div>
    );
  }

  const { totals, daily } = data;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-heading">Website traffic</h2>
        <Link href="/analytics" className="text-sm font-semibold text-accent hover:underline">
          View full analytics
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active users", value: totals.activeUsers },
          { label: "Sessions", value: totals.sessions },
          { label: "Page views", value: totals.pageViews },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line/10 bg-surface p-6">
            <p className="text-3xl font-bold text-heading">{formatCompact(stat.value)}</p>
            <p className="mt-1 text-sm text-body">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <TimeSeriesChart daily={daily} />
      </div>
    </div>
  );
}
