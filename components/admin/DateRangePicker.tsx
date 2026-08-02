"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RANGE_PRESETS } from "@/lib/analytics-types";

export function DateRangePicker({ days }: { days: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`flex items-center gap-2 ${isPending ? "opacity-60" : ""}`}>
      <span className="text-sm text-body">Date range</span>
      <div className="flex rounded-full border border-line/10 p-0.5">
        {RANGE_PRESETS.map((preset) => (
          <button
            key={preset.days}
            type="button"
            aria-pressed={preset.days === days}
            onClick={() => startTransition(() => router.push(`/analytics?days=${preset.days}`))}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              preset.days === days ? "bg-primary text-on-primary" : "text-body hover:text-heading"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
