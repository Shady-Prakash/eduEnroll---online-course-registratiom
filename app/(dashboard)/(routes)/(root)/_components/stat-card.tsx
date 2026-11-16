import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  sky: "bg-brand-100 text-brand-700",
  emerald: "bg-success-100 text-success-700",
  amber: "bg-warning-100 text-warning-700",
  violet: "bg-highlight-100 text-highlight-700",
} as const;

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: keyof typeof tones;
}

export const StatCard = ({ label, value, icon: Icon, hint, tone = "sky" }: StatCardProps) => (
  <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-center justify-between gap-x-2">
      <p className="truncate text-xs font-medium text-ink-500 sm:text-sm">{label}</p>
      <span className={cn("shrink-0 rounded-lg p-1.5 sm:p-2", tones[tone])}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
    </div>
    <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-900">{value}</p>
    {hint && <p className="mt-0.5 truncate text-xs text-ink-500">{hint}</p>}
  </div>
);
