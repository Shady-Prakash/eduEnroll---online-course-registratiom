"use client";

import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  align?: "left" | "right";
}

/** Sortable column header: click cycles asc → desc → off, with a clear direction icon. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  align = "left",
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn(align === "right" && "block text-right")}>{title}</span>;
  }

  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "-mx-2 inline-flex items-center gap-x-1 rounded px-2 py-1 uppercase tracking-wide transition-colors",
        "hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30",
        sorted && "text-ink-900",
        align === "right" && "ml-auto flex-row-reverse"
      )}
      aria-label={`Sort by ${title}${sorted ? ` (${sorted === "asc" ? "ascending" : "descending"})` : ""}`}
    >
      {title}
      <Icon className={cn("h-3.5 w-3.5", !sorted && "text-ink-400")} aria-hidden />
    </button>
  );
}
