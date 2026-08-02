export type AnalyticsRow = { label: string; value: number };

export type AnalyticsTotals = {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  engagedSessions: number;
  engagementRate: number;
  averageSessionDuration: number;
  eventCount: number;
  bounceRate: number;
};

export type AnalyticsPoint = {
  date: string;
  sessions: number;
  activeUsers: number;
  pageViews: number;
};

export type AnalyticsData = {
  configured: true;
  days: number;
  totals: AnalyticsTotals;
  daily: AnalyticsPoint[];
  channels: AnalyticsRow[];
  sources: AnalyticsRow[];
  pages: AnalyticsRow[];
  landingPages: AnalyticsRow[];
  countries: AnalyticsRow[];
  cities: AnalyticsRow[];
  devices: AnalyticsRow[];
  browsers: AnalyticsRow[];
  operatingSystems: AnalyticsRow[];
  events: AnalyticsRow[];
  newVsReturning: AnalyticsRow[];
  realtimeActiveUsers: number;
};

export type AnalyticsUnconfigured = { configured: false; error?: string };

export type AnalyticsResponse = AnalyticsData | AnalyticsUnconfigured;

export const RANGE_PRESETS = [
  { days: 7, label: "Last 7 days" },
  { days: 28, label: "Last 28 days" },
  { days: 90, label: "Last 90 days" },
] as const;

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatDuration(seconds: number): string {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

/** GA returns dates as YYYYMMDD. */
export function formatGaDate(yyyymmdd: string): string {
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  return new Date(year, month, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
