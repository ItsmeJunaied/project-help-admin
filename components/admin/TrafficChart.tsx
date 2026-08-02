"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { AnalyticsOverview } from "@/lib/analytics-types";

const WIDTH = 680;
const HEIGHT = 220;
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function formatDate(yyyymmdd: string): string {
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  return new Date(year, month, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TrafficChart({ daily }: { daily: AnalyticsOverview["daily"] }) {
  const [showTable, setShowTable] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const chartWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const baselineY = PAD_TOP + chartHeight;

  const yMax = useMemo(() => niceMax(Math.max(...daily.map((d) => d.sessions), 1)), [daily]);

  const points = useMemo(
    () =>
      daily.map((d, i) => {
        const x = daily.length === 1 ? PAD_LEFT + chartWidth / 2 : PAD_LEFT + (i / (daily.length - 1)) * chartWidth;
        const y = baselineY - (d.sessions / yMax) * chartHeight;
        return { x, y, ...d };
      }),
    [daily, yMax, chartWidth, baselineY, chartHeight]
  );

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${baselineY} L${points[0].x},${baselineY} Z`
      : "";

  const yTicks = [0, yMax / 2, yMax];
  const last = points[points.length - 1];

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

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="rounded-2xl border border-line/10 bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-heading">Sessions</h2>
          <p className="text-sm text-body">Last {daily.length} days, from Google Analytics</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-sm font-semibold text-accent hover:underline"
        >
          {showTable ? "View chart" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <div className="mt-4 max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-body">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.date} className="border-b border-line/10 last:border-0">
                  <td className="py-2 pr-4 text-body">{formatDate(d.date)}</td>
                  <td className="py-2 tabular-nums text-heading">{d.sessions.toLocaleString()}</td>
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
            aria-label={`Sessions over the last ${daily.length} days`}
          >
            {yTicks.map((tick) => {
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
                    strokeWidth={1}
                  />
                  <text x={PAD_LEFT - 8} y={y + 4} textAnchor="end" className="fill-body" fontSize={10}>
                    {formatCompact(tick)}
                  </text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill="var(--color-accent)" fillOpacity={0.1} stroke="none" />}
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
              <>
                <circle cx={last.x} cy={last.y} r={5} fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth={2} />
                <text x={last.x} y={last.y - 12} textAnchor="end" className="fill-heading" fontSize={11} fontWeight={600}>
                  {formatCompact(last.sessions)}
                </text>
              </>
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
                  strokeWidth={1}
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
              <p className="text-body">{formatDate(hovered.date)}</p>
              <p className="font-semibold text-heading">{hovered.sessions.toLocaleString()} sessions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
