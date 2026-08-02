"use client";

import { useState } from "react";
import type { AnalyticsRow } from "@/lib/analytics-types";

type Props = {
  title: string;
  /** What the bar length measures, e.g. "Sessions". */
  metricLabel: string;
  /** What each row names, e.g. "Channel". */
  dimensionLabel: string;
  rows: AnalyticsRow[];
};

export function RankedBarList({ title, metricLabel, dimensionLabel, rows }: Props) {
  const [showTable, setShowTable] = useState(false);

  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="rounded-2xl border border-line/10 bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-heading">{title}</h2>
          <p className="text-sm text-body">By {metricLabel.toLowerCase()}</p>
        </div>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="shrink-0 text-sm font-semibold text-accent hover:underline"
          >
            {showTable ? "View chart" : "View as table"}
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-center text-sm text-body">No data for this range.</p>
      ) : showTable ? (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-body">
              <th className="py-2 pr-4">{dimensionLabel}</th>
              <th className="py-2 pr-4">{metricLabel}</th>
              <th className="py-2">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line/10 last:border-0">
                <td className="py-2 pr-4 text-body">{row.label}</td>
                <td className="py-2 pr-4 tabular-nums text-heading">{row.value.toLocaleString()}</td>
                <td className="py-2 tabular-nums text-body">
                  {total > 0 ? `${((row.value / total) * 100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="group">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-heading" title={row.label}>
                  {row.label}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-heading">
                  {row.value.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-sm bg-surface-2">
                <div
                  className="h-full rounded-r-sm bg-accent transition-opacity group-hover:opacity-80"
                  style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
