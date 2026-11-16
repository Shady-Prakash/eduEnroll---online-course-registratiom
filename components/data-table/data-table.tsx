"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  Table as TableInstance,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    /** Extra classes for the column's <th>/<td> (e.g. width, alignment, hiding on smaller screens). */
    className?: string;
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Toolbar above the table; receives the table instance (search, filters, …). */
  toolbar?: (table: TableInstance<TData>) => React.ReactNode;
  /** Card layout for small screens. If omitted, the table scrolls horizontally instead. */
  renderMobileRow?: (row: Row<TData>) => React.ReactNode;
  /** Rendered when no rows match. */
  emptyState?: React.ReactNode;
  initialSorting?: SortingState;
  pageSize?: number;
  itemLabel?: string;
  /** Global filter function used by `table.setGlobalFilter`. */
  globalFilterFn?: (row: Row<TData>, columnId: string, filterValue: string) => boolean;
}

/**
 * Generic, responsive data table built on TanStack Table.
 *  - md and up: a real <table> with sortable headers
 *  - below md:  stacked cards via `renderMobileRow` (no sideways scrolling)
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  renderMobileRow,
  emptyState,
  initialSorting = [],
  pageSize = 10,
  itemLabel,
  globalFilterFn,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    initialState: { pagination: { pageSize } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn ?? "includesString",
    autoResetPageIndex: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;

  return (
    <div className="space-y-4">
      {toolbar?.(table)}

      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm">
        {/* Mobile cards */}
        {renderMobileRow && (
          <ul className="divide-y divide-ink-100 md:hidden">
            {hasRows
              ? rows.map((row) => <li key={row.id}>{renderMobileRow(row)}</li>)
              : <li>{emptyState}</li>}
          </ul>
        )}

        {/* Table */}
        <div className={cn("overflow-x-auto", renderMobileRow && "hidden md:block")}>
          <table className="w-full text-sm">
            <thead className="bg-ink-50/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-ink-200">
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                        className={cn(
                          "h-11 px-4 text-left align-middle text-xs font-medium text-ink-500",
                          header.column.columnDef.meta?.className
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-ink-100">
              {hasRows ? (
                rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-ink-50/70">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn("px-4 py-3 align-middle", cell.column.columnDef.meta?.className)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>{emptyState}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {table.getFilteredRowModel().rows.length > 0 && (
        <DataTablePagination table={table} itemLabel={itemLabel} />
      )}
    </div>
  );
}
