import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Delta } from "@/lib/analytics-types";

const DELTA_STYLES: Record<Delta["direction"], { icon: typeof ArrowUp; classes: string }> = {
  up: { icon: ArrowUp, classes: "bg-accent/10 text-accent" },
  down: { icon: ArrowDown, classes: "bg-red-400/10 text-red-400" },
  flat: { icon: Minus, classes: "bg-surface-2 text-body" },
};

export function StatTile({ label, value, delta }: { label: string; value: string; delta?: Delta }) {
  const style = delta ? DELTA_STYLES[delta.direction] : null;
  const DeltaIcon = style?.icon;

  return (
    <div className="rounded-2xl border border-line/10 bg-surface p-6">
      <div className="flex items-start justify-between gap-2">
        <p className="text-3xl font-bold text-heading">{value}</p>
        {style && DeltaIcon && (
          <span
            className={`mt-1 inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${style.classes}`}
          >
            <DeltaIcon aria-hidden size={12} />
            {delta!.label}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-body">{label}</p>
    </div>
  );
}
