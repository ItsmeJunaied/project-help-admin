"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { formatCompact, formatGaDate, type AnalyticsPoint } from "@/lib/analytics-types";

const WIDTH = 760;
const HEIGHT = 260;
const PAD_LEFT = 48;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 32;

const METRICS = [
  { key: "sessions", label: "Sessions" },
  { key: "activeUsers", label: "Active users" },
  { key: "pageViews", label: "Page views" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function TimeSeriesChart({ daily }: { daily: AnalyticsPoint[] }) {
  const [metricKey, setMetricKey] = useState<MetricKey>("sessions");
  const [showTable, setShowTable] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const chartWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const baselineY = PAD_TOP + chartHeight;
  const activeMetric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0];

  const yMax = useMemo(
    () => niceMax(Math.max(...daily.map((d) => d[metricKey]), 1)),
    [daily, metricKey]
  );

  const points = useMemo(
    () =>
      daily.map((d, i) => ({
        x: daily.length === 1 ? PAD_LEFT + chartWidth / 2 : PAD_LEFT + (i / (daily.length - 1)) * chartWidth,
        y: baselineY - (d[metricKey] / yMax) * chartHeight,
        date: d.date,
        value: d[metricKey],
      })),
    [daily, metricKey, yMax, chartWidth, baselineY, chartHeight]
  );

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${baselineY} L${points[0].x},${baselineY} Z`
      : "";

  const last = points[points.length - 1];
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const xTickIndexes = points.length
    ? [0, Math.floor((points.length - 1) / 2), points.length - 1].filter((v, i, a) => a.indexOf(v) === i)
    : [];

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDistance = Infinity;
    points.forEach((p, i) => {
      const distance = Math.abs(p.x - relativeX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <div className="rounded-2xl border border-line/10 bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-heading">{activeMetric.label} over time</h2>
          <p className="text-sm text-body">Daily totals for the selected range</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-line/10 p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetricKey(m.key)}
                aria-pressed={m.key === metricKey}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  m.key === metricKey ? "bg-primary text-on-primary" : "text-body hover:text-heading"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {showTable ? "View chart" : "View as table"}
          </button>
        </div>
      </div>

      {showTable ? (
        <div className="mt-4 max-h-72 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-body">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Sessions</th>
                <th className="py-2 pr-4">Active users</th>
                <th className="py-2">Page views</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.date} className="border-b border-line/10 last:border-0">
                  <td className="py-2 pr-4 text-body">{formatGaDate(d.date)}</td>
                  <td className="py-2 pr-4 tabular-nums text-heading">{d.sessions.toLocaleString()}</td>
                  <td className="py-2 pr-4 tabular-nums text-heading">{d.activeUsers.toLocaleString()}</td>
                  <td className="py-2 tabular-nums text-heading">{d.pageViews.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full"
            role="img"
            aria-label={`${activeMetric.label} per day over the selected range`}
          >
            {[0, yMax / 2, yMax].map((tick) => {
              const y = baselineY - (tick / yMax) * chartHeight;
              return (
                <g key={tick}>
                  <line
                    x1={PAD_LEFT}
                    x2={WIDTH - PAD_RIGHT}
                    y1={y}
                    y2={y}
                    stroke="var(--color-line)"
                    strokeOpacity={0.1}
                  />
                  <text x={PAD_LEFT - 10} y={y + 4} textAnchor="end" className="fill-body" fontSize={11}>
                    {formatCompact(tick)}
                  </text>
                </g>
              );
            })}

            {xTickIndexes.map((i) => (
              <text
                key={i}
                x={points[i].x}
                y={HEIGHT - 10}
                textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
                className="fill-body"
                fontSize={11}
              >
                {formatGaDate(points[i].date)}
              </text>
            ))}

            {areaPath && <path d={areaPath} fill="var(--color-accent)" fillOpacity={0.1} />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {last && (
              <circle
                cx={last.x}
                cy={last.y}
                r={5}
                fill="var(--color-accent)"
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
            )}

            {hovered && (
              <>
                <line
                  x1={hovered.x}
                  x2={hovered.x}
                  y1={PAD_TOP}
                  y2={baselineY}
                  stroke="var(--color-line)"
                  strokeOpacity={0.3}
                />
                <circle
                  cx={hovered.x}
                  cy={hovered.y}
                  r={5}
                  fill="var(--color-accent)"
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                />
              </>
            )}

            <rect
              x={PAD_LEFT}
              y={PAD_TOP}
              width={chartWidth}
              height={chartHeight}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            />
          </svg>

          {hovered && (
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-line/10 bg-surface-2 px-3 py-2 text-xs shadow-lg"
              style={{ left: `${(hovered.x / WIDTH) * 100}%` }}
            >
              <p className="text-body">{formatGaDate(hovered.date)}</p>
              <p className="font-semibold text-heading">
                {hovered.value.toLocaleString()} {activeMetric.label.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
