"use client";

import { cn } from "@/lib/utils";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

interface DataTableFilterTabsProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** Segmented single-choice filter with counts (e.g. All · Published · Draft). */
export function DataTableFilterTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: DataTableFilterTabsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-md border border-ink-200 bg-ink-50 p-1 text-sm",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-full flex-1 items-center justify-center gap-x-1.5 whitespace-nowrap rounded px-3 font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30",
              active ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-brand-100 text-brand-800" : "bg-ink-200/70 text-ink-600"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
