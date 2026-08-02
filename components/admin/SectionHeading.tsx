import type { LucideIcon } from "lucide-react";

export function SectionHeading({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon aria-hidden size={18} className="text-accent" />
      <h2 className="text-lg font-bold text-heading">{title}</h2>
    </div>
  );
}
