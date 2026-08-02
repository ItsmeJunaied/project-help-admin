export type AnalyticsOverview = {
  configured: true;
  totals: { activeUsers: number; sessions: number; pageViews: number };
  daily: { date: string; sessions: number }[];
};

export type AnalyticsUnconfigured = { configured: false };

export type AnalyticsResponse = AnalyticsOverview | AnalyticsUnconfigured;
