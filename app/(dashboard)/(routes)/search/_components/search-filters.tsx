"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { categoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Facet } from "@/actions/search-courses";
import { useSearchUrl } from "./use-search-url";

export interface SearchFacets {
  categories: Facet[];
  levels: Facet[];
  prices: Facet[];
}

const VISIBLE = 5;

interface FilterGroupProps {
  title: string;
  name: string;
  options: Facet[];
  value?: string;
  onChange: (value: string | null) => void;
  withIcons?: boolean;
  defaultOpen?: boolean;
}

/** Udemy-style accordion filter group: collapsible, with "Show more" for long lists. */
const FilterGroup = ({ title, name, options, value, onChange, withIcons, defaultOpen = true }: FilterGroupProps) => {
  const [open, setOpen] = useState(defaultOpen || !!value);
  const [showAll, setShowAll] = useState(false);

  const selectedIndex = options.findIndex((o) => o.value === value);
  // Always keep the selected option visible, even when the list is truncated.
  const limit = Math.max(VISIBLE, selectedIndex + 1);
  const visible = showAll ? options : options.slice(0, limit);
  const hidden = options.length - visible.length;
  const selectedLabel = options.find((o) => o.value === value)?.label;
  const panelId = `filter-${name}`;

  return (
    <div className="border-b border-ink-200 py-4 first:pt-0 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink-900">{title}</span>
          {!open && selectedLabel && <span className="block truncate text-xs text-brand-700">{selectedLabel}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-x-2">
          {value && (
            <span className="rounded-full bg-brand-600 px-1.5 text-3xs font-semibold text-white" aria-label="1 selected">1</span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-ink-500 transition-transform", open && "rotate-180")} aria-hidden />
        </span>
      </button>

      {open && (
        <fieldset id={panelId} className="mt-3">
          <legend className="sr-only">{title}</legend>
          <div className="space-y-0.5">
            {[{ value: "", label: "All", count: undefined as number | undefined }, ...visible].map((option) => {
              const checked = (value ?? "") === option.value;
              const disabled = option.count === 0 && !checked;
              const Icon = withIcons && option.value ? categoryIcon(option.label) : null;
              return (
                <label
                  key={option.value || "all"}
                  className={cn(
                    "flex cursor-pointer items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm transition",
                    checked ? "bg-brand-50 font-medium text-brand-900" : "text-ink-700 hover:bg-ink-50",
                    disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onChange(option.value || null)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {Icon && <Icon size={16} aria-hidden />}
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.count !== undefined && <span className="text-xs tabular-nums text-ink-400">{option.count}</span>}
                </label>
              );
            })}
          </div>
          {(hidden > 0 || showAll) && options.length > VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="mt-2 flex items-center gap-x-1 px-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              {showAll ? "Show less" : `Show ${hidden} more`}
              <ChevronDown className={cn("h-4 w-4 transition-transform", showAll && "rotate-180")} aria-hidden />
            </button>
          )}
        </fieldset>
      )}
    </div>
  );
};

/** Category / level / price filters. Counts show how many results each option gives. */
export const SearchFilters = ({ facets }: { facets: SearchFacets }) => {
  const { get, update } = useSearchUrl();

  return (
    <div>
      <FilterGroup
        title="Category"
        name="categoryId"
        options={facets.categories}
        value={get("categoryId")}
        onChange={(v) => update({ categoryId: v })}
        withIcons
      />
      {facets.levels.length > 0 && (
        <FilterGroup title="Level" name="level" options={facets.levels} value={get("level")} onChange={(v) => update({ level: v })} />
      )}
      <FilterGroup title="Price" name="price" options={facets.prices} value={get("price")} onChange={(v) => update({ price: v })} />
    </div>
  );
};
