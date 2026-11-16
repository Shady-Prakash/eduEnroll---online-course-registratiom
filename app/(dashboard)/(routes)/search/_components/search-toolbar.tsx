"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, LayoutGrid, List, PanelLeftClose, PanelLeftOpen, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SORTS } from "@/actions/search-courses";
import { cn } from "@/lib/utils";
import { SearchFilters, SearchFacets } from "./search-filters";
import { useSearchUrl } from "./use-search-url";

export type ResultsView = "list" | "grid";
const VIEW_KEY = "eduenroll:search:view";

interface SearchToolbarProps {
  total: number;
  facets: SearchFacets;
  view: ResultsView;
  /** Desktop filter panel state (owned by SearchShell). */
  filtersOpen: boolean;
  onToggleFilters: () => void;
}

/** Results count, active-filter chips, sort, and the mobile filter sheet. */
export const SearchToolbar = ({ total, facets, view, filtersOpen, onToggleFilters }: SearchToolbarProps) => {
  const { get, update, clearFilters, isPending } = useSearchUrl();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Restore the learner's preferred view when the URL doesn't specify one.
  useEffect(() => {
    if (get("view")) return;
    try {
      if (localStorage.getItem(VIEW_KEY) === "grid") update({ view: "grid" });
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setView = (next: ResultsView) => {
    try { localStorage.setItem(VIEW_KEY, next); } catch { /* ignore */ }
    update({ view: next === "list" ? null : next });
  };

  const q = get("q");
  const chips = [
    get("categoryId") && {
      key: "categoryId",
      label: facets.categories.find((c) => c.value === get("categoryId"))?.label ?? "Category",
    },
    get("level") && { key: "level", label: facets.levels.find((l) => l.value === get("level"))?.label ?? "Level" },
    get("price") && { key: "price", label: get("price") === "free" ? "Free" : "Paid" },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cn("text-sm text-ink-600 transition-opacity", isPending && "opacity-50")} aria-live="polite">
          <span className="font-semibold text-ink-900 tabular-nums">{total}</span> {total === 1 ? "result" : "results"}
          {q && (
            <>
              {" "}for <span className="font-semibold text-ink-900">&ldquo;{q}&rdquo;</span>
            </>
          )}
        </p>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          {/* Desktop: show / hide the filter panel */}
          <Button
            variant="outline"
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            aria-controls="search-filters"
            className="hidden lg:inline-flex"
          >
            {filtersOpen ? <PanelLeftClose className="mr-2 h-4 w-4" aria-hidden /> : <PanelLeftOpen className="mr-2 h-4 w-4" aria-hidden />}
            {filtersOpen ? "Hide filters" : "Filters"}
            {chips.length > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white">{chips.length}</span>
            )}
          </Button>

          {/* Mobile: filters in a bottom sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden />
                Filters
                {chips.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white">{chips.length}</span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-5 pb-0">
              <SheetTitle className="mb-4 text-lg">Filter courses</SheetTitle>
              <SearchFilters facets={facets} />
              <div className="sticky bottom-0 -mx-5 mt-4 flex gap-2 border-t border-ink-200 bg-white px-5 py-3">
                <Button variant="ghost" onClick={clearFilters} disabled={!chips.length}>Clear</Button>
                <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                  Show {total} {total === 1 ? "result" : "results"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <label className="relative order-last w-full sm:order-none sm:w-auto sm:flex-none">
            <span className="sr-only">Sort by</span>
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <select
              value={get("sort") ?? "relevance"}
              onChange={(e) => update({ sort: e.target.value === "relevance" ? null : e.target.value })}
              className="h-10 w-full appearance-none rounded-md border border-ink-200 bg-white pl-9 pr-8 text-sm font-medium text-ink-700 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 sm:w-auto"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400">▾</span>
          </label>

          {/* Card / list view */}
          <div role="radiogroup" aria-label="Results layout" className="inline-flex h-10 shrink-0 rounded-md border border-ink-200 bg-white p-0.5 shadow-sm">
            {([
              { value: "list", label: "List view", icon: List },
              { value: "grid", label: "Card view", icon: LayoutGrid },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={view === value}
                aria-label={label}
                title={label}
                onClick={() => setView(value)}
                className={cn(
                  "flex w-9 items-center justify-center rounded transition",
                  view === value ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => update({ [chip.key]: null })}
              className="inline-flex items-center gap-x-1 rounded-full border border-brand-200 bg-brand-50 py-1 pl-3 pr-2 text-xs font-medium text-brand-800 transition hover:bg-brand-100"
              aria-label={`Remove filter: ${chip.label}`}
            >
              {chip.label}
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
          <button type="button" onClick={clearFilters} className="text-xs font-medium text-ink-500 hover:text-ink-900 hover:underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
