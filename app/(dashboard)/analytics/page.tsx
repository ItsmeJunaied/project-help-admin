import { Radio, TrendingUp, Compass, FileText, MapPin, MonitorSmartphone, Repeat } from "lucide-react";
import { backendFetch } from "@/lib/backend";
import {
  computeDelta,
  formatCompact,
  formatDuration,
  formatPercent,
  type AnalyticsResponse,
} from "@/lib/analytics-types";
import { TimeSeriesChart } from "@/components/admin/TimeSeriesChart";
import { RankedBarList } from "@/components/admin/RankedBarList";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { StatTile } from "@/components/admin/StatTile";
import { SectionHeading } from "@/components/admin/SectionHeading";
import { WorldMap } from "@/components/admin/WorldMap";

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

  const { totals, previousTotals } = data;

  const tiles = [
    { label: "Active users", value: formatCompact(totals.activeUsers), delta: computeDelta(totals.activeUsers, previousTotals.activeUsers) },
    { label: "New users", value: formatCompact(totals.newUsers), delta: computeDelta(totals.newUsers, previousTotals.newUsers) },
    { label: "Sessions", value: formatCompact(totals.sessions), delta: computeDelta(totals.sessions, previousTotals.sessions) },
    { label: "Page views", value: formatCompact(totals.pageViews), delta: computeDelta(totals.pageViews, previousTotals.pageViews) },
    { label: "Engaged sessions", value: formatCompact(totals.engagedSessions), delta: computeDelta(totals.engagedSessions, previousTotals.engagedSessions) },
    { label: "Engagement rate", value: formatPercent(totals.engagementRate), delta: computeDelta(totals.engagementRate, previousTotals.engagementRate) },
    { label: "Avg. session", value: formatDuration(totals.averageSessionDuration), delta: computeDelta(totals.averageSessionDuration, previousTotals.averageSessionDuration) },
    { label: "Events", value: formatCompact(totals.eventCount), delta: computeDelta(totals.eventCount, previousTotals.eventCount) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Analytics</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-body">
            <Radio aria-hidden size={14} className="text-accent" />
            {data.realtimeActiveUsers.toLocaleString()} active {data.realtimeActiveUsers === 1 ? "user" : "users"}{" "}
            right now
          </p>
        </div>
        <DateRangePicker days={days} />
      </div>

      <p className="mt-6 text-xs uppercase tracking-wide text-body">vs. the previous {days} days</p>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile key={tile.label} label={tile.label} value={tile.value} delta={tile.delta} />
        ))}
      </div>

      <div className="mt-8">
        <SectionHeading icon={TrendingUp} title="Traffic over time" />
        <TimeSeriesChart daily={data.daily} />
      </div>

      <div className="mt-8">
        <SectionHeading icon={Compass} title="Acquisition" />
        <div className="grid gap-4 lg:grid-cols-2">
          <RankedBarList title="Traffic acquisition" dimensionLabel="Channel" metricLabel="Sessions" rows={data.channels} />
          <RankedBarList title="Source / medium" dimensionLabel="Source / medium" metricLabel="Sessions" rows={data.sources} />
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading icon={FileText} title="Content" />
        <div className="grid gap-4 lg:grid-cols-2">
          <RankedBarList title="Pages and screens" dimensionLabel="Page title" metricLabel="Views" rows={data.pages} />
          <RankedBarList title="Landing pages" dimensionLabel="Landing page" metricLabel="Sessions" rows={data.landingPages} />
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading icon={MapPin} title="Geography" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WorldMap rows={data.countries} />
          </div>
          <RankedBarList title="Cities" dimensionLabel="City" metricLabel="Active users" rows={data.cities} />
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading icon={MonitorSmartphone} title="Audience" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RankedBarList title="Devices" dimensionLabel="Device category" metricLabel="Active users" rows={data.devices} />
          <RankedBarList title="Browsers" dimensionLabel="Browser" metricLabel="Active users" rows={data.browsers} />
          <RankedBarList title="Operating systems" dimensionLabel="Operating system" metricLabel="Active users" rows={data.operatingSystems} />
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading icon={Repeat} title="Engagement" />
        <div className="grid gap-4 lg:grid-cols-2">
          <RankedBarList title="New vs returning" dimensionLabel="User type" metricLabel="Active users" rows={data.newVsReturning} />
          <RankedBarList title="Events" dimensionLabel="Event name" metricLabel="Event count" rows={data.events} />
        </div>
      </div>
    </div>
  );
}
