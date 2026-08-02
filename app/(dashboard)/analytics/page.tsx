import { backendFetch } from "@/lib/backend";
import {
  formatCompact,
  formatDuration,
  formatPercent,
  type AnalyticsResponse,
} from "@/lib/analytics-types";
import { TimeSeriesChart } from "@/components/admin/TimeSeriesChart";
import { RankedBarList } from "@/components/admin/RankedBarList";
import { DateRangePicker } from "@/components/admin/DateRangePicker";

export const dynamic = "force-dynamic";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const parsed = Number(daysParam);
  const days = [7, 28, 90].includes(parsed) ? parsed : 28;

  const response = await backendFetch(`/admin/stats/analytics?days=${days}`);
  const data: AnalyticsResponse = await response.json();

  if (!data.configured) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-heading">Analytics</h1>
        <div className="mt-6 rounded-2xl border border-dashed border-line/20 bg-surface p-8 text-center">
          <h2 className="text-lg font-bold text-heading">
            {data.error ? "Google Analytics request failed" : "Google Analytics not connected"}
          </h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-body">
            {data.error ??
              "Add GA_PROPERTY_ID, GA_CLIENT_EMAIL, and GA_PRIVATE_KEY to the backend environment to show traffic data here."}
          </p>
        </div>
      </div>
    );
  }

  const { totals } = data;

  const tiles = [
    { label: "Active users", value: formatCompact(totals.activeUsers) },
    { label: "New users", value: formatCompact(totals.newUsers) },
    { label: "Sessions", value: formatCompact(totals.sessions) },
    { label: "Page views", value: formatCompact(totals.pageViews) },
    { label: "Engaged sessions", value: formatCompact(totals.engagedSessions) },
    { label: "Engagement rate", value: formatPercent(totals.engagementRate) },
    { label: "Avg. session", value: formatDuration(totals.averageSessionDuration) },
    { label: "Events", value: formatCompact(totals.eventCount) },
  ];

  const breakdowns = [
    { title: "Traffic acquisition", dimensionLabel: "Channel", metricLabel: "Sessions", rows: data.channels },
    { title: "Source / medium", dimensionLabel: "Source / medium", metricLabel: "Sessions", rows: data.sources },
    { title: "Pages and screens", dimensionLabel: "Page title", metricLabel: "Views", rows: data.pages },
    { title: "Landing pages", dimensionLabel: "Landing page", metricLabel: "Sessions", rows: data.landingPages },
    { title: "Countries", dimensionLabel: "Country", metricLabel: "Active users", rows: data.countries },
    { title: "Cities", dimensionLabel: "City", metricLabel: "Active users", rows: data.cities },
    { title: "Devices", dimensionLabel: "Device category", metricLabel: "Active users", rows: data.devices },
    { title: "Browsers", dimensionLabel: "Browser", metricLabel: "Active users", rows: data.browsers },
    {
      title: "Operating systems",
      dimensionLabel: "Operating system",
      metricLabel: "Active users",
      rows: data.operatingSystems,
    },
    { title: "Events", dimensionLabel: "Event name", metricLabel: "Event count", rows: data.events },
    {
      title: "New vs returning",
      dimensionLabel: "User type",
      metricLabel: "Active users",
      rows: data.newVsReturning,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-heading">Analytics</h1>
        <DateRangePicker days={days} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-body">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        {data.realtimeActiveUsers.toLocaleString()} active {data.realtimeActiveUsers === 1 ? "user" : "users"} in
        the last 30 minutes
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-line/10 bg-surface p-6">
            <p className="text-3xl font-bold text-heading">{tile.value}</p>
            <p className="mt-1 text-sm text-body">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <TimeSeriesChart daily={data.daily} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {breakdowns.map((breakdown) => (
          <RankedBarList
            key={breakdown.title}
            title={breakdown.title}
            dimensionLabel={breakdown.dimensionLabel}
            metricLabel={breakdown.metricLabel}
            rows={breakdown.rows}
          />
        ))}
      </div>
    </div>
  );
}
