"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { SearchFilters, SearchFacets } from "./search-filters";
import { SearchToolbar, ResultsView } from "./search-toolbar";

const FILTERS_KEY = "eduenroll:search:filters";

interface SearchShellProps {
  total: number;
  facets: SearchFacets;
  view: ResultsView;
  children: React.ReactNode;
}

/**
 * Toolbar + collapsible filter panel + results.
 * `data-filters` lets the server-rendered card grid add a column when the panel is hidden.
 */
export const SearchShell = ({ total, facets, view, children }: SearchShellProps) => {
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(FILTERS_KEY) === "0") setFiltersOpen(false);
    } catch { /* ignore */ }
  }, []);

  const toggle = () =>
    setFiltersOpen((open) => {
      try { localStorage.setItem(FILTERS_KEY, open ? "0" : "1"); } catch { /* ignore */ }
      return !open;
    });

  return (
    <div className="group/search space-y-5" data-filters={filtersOpen ? "open" : "closed"}>
      <SearchToolbar total={total} facets={facets} view={view} filtersOpen={filtersOpen} onToggleFilters={toggle} />

      <div className={cn("grid gap-8", filtersOpen && "lg:grid-cols-[260px_minmax(0,1fr)]")}>
        {filtersOpen && (
          <aside id="search-filters" aria-label="Filters" className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              <SearchFilters facets={facets} />
            </div>
          </aside>
        )}
        <section className="min-w-0" aria-label="Search results">
          {children}
        </section>
      </div>
    </div>
  );
};
