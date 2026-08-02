"use client";

import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import worldTopology from "world-atlas/countries-110m.json";
import type { AnalyticsRow } from "@/lib/analytics-types";
import { normalizeCountryName } from "@/lib/country-aliases";

const WIDTH = 760;
const HEIGHT = 380;

type CountryProperties = { name: string };

const topology = worldTopology as unknown as Topology<{ countries: GeometryCollection<CountryProperties> }>;
const countries = feature(topology, topology.objects.countries).features;

const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT - 30], {
  type: "FeatureCollection",
  features: countries,
});
const path = geoPath(projection);

/** Light tint of the accent, up to full accent, scaled by sqrt so a few dominant countries don't wash out the rest. */
function colorFor(value: number, max: number): string {
  if (max <= 0) return "var(--color-surface-3)";
  const t = Math.sqrt(value / max);
  return `color-mix(in oklab, var(--color-accent) ${Math.round(t * 85 + 15)}%, var(--color-surface-2))`;
}

export function WorldMap({ rows }: { rows: AnalyticsRow[] }) {
  const [showTable, setShowTable] = useState(false);
  const [hovered, setHovered] = useState<{ name: string; value: number; x: number; y: number } | null>(null);

  const valueByCountry = useMemo(() => {
    const map = new Map<string, { label: string; value: number }>();
    for (const row of rows) {
      map.set(normalizeCountryName(row.label).toLowerCase(), { label: row.label, value: row.value });
    }
    return map;
  }, [rows]);

  const max = useMemo(() => Math.max(...rows.map((r) => r.value), 1), [rows]);
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const matchedCount = useMemo(
    () => countries.filter((c) => valueByCountry.has((c.properties?.name ?? "").toLowerCase())).length,
    [valueByCountry]
  );

  function handlePointerMove(event: ReactPointerEvent<SVGPathElement>, name: string, value: number) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setHovered({
      name,
      value,
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="rounded-2xl border border-line/10 bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-heading">Active users by country</h2>
          <p className="text-sm text-body">
            {matchedCount} of {rows.length} countries mapped &middot; darker is more traffic
          </p>
        </div>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="shrink-0 text-sm font-semibold text-accent hover:underline"
          >
            {showTable ? "View map" : "View as table"}
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-center text-sm text-body">No data for this range.</p>
      ) : showTable ? (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-body">
              <th className="py-2 pr-4">Country</th>
              <th className="py-2 pr-4">Active users</th>
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
        <div className="relative mt-4">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Active users by country">
            {countries.map((country) => {
              const name = country.properties?.name ?? "";
              const match = valueByCountry.get(name.toLowerCase());
              const d = path(country) ?? undefined;
              const isHovered = hovered?.name === (match?.label ?? name);
              return (
                <path
                  key={name}
                  d={d}
                  fill={match ? colorFor(match.value, max) : "var(--color-surface-3)"}
                  stroke="var(--color-surface)"
                  strokeWidth={0.5}
                  opacity={isHovered ? 0.85 : 1}
                  onPointerMove={match ? (e) => handlePointerMove(e, match.label, match.value) : undefined}
                  onPointerLeave={() => setHovered(null)}
                  className={match ? "cursor-pointer" : undefined}
                />
              );
            })}
          </svg>

          {hovered && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-line/10 bg-surface-2 px-3 py-2 text-xs shadow-lg"
              style={{ left: `${hovered.x}%`, top: `${Math.max(hovered.y - 2, 0)}%` }}
            >
              <p className="font-semibold text-heading">{hovered.name}</p>
              <p className="text-body">{hovered.value.toLocaleString()} active users</p>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-body">
            <span>Fewer</span>
            <span
              className="h-2 flex-1 max-w-32 rounded-sm"
              style={{
                background: "linear-gradient(to right, var(--color-surface-3), var(--color-accent))",
              }}
            />
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
