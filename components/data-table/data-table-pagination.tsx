"use client";

import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

/** "Showing 1–10 of 24 courses" · rows-per-page · prev/next. Stacks on mobile. */
export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50],
  itemLabel = "rows",
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);
  const pageCount = Math.max(table.getPageCount(), 1);

  return (
    <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-ink-500" aria-live="polite">
        Showing <span className="font-medium text-ink-700 tabular-nums">{from}–{to}</span> of{" "}
        <span className="font-medium text-ink-700 tabular-nums">{total}</span> {itemLabel}
      </p>

      <div className="flex w-full items-center justify-between gap-x-4 sm:w-auto sm:justify-end">
        <label className="flex items-center gap-x-2 text-sm text-ink-500">
          <span className="hidden sm:inline">Rows per page</span>
          <span className="sm:hidden">Per page</span>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-9 rounded-md border border-ink-200 bg-white px-2 text-sm text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-x-2">
          <span className="text-sm text-ink-500 tabular-nums">
            {pageIndex + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
