"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatPrice } from "@/lib/format";

import type { CourseRow } from "./types";
import { ChapterProgress, CourseThumbnail, StatusBadge, formatUpdated } from "./course-cells";
import { CourseRowActions } from "./course-row-actions";

export const columns: ColumnDef<CourseRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
    cell: ({ row }) => {
      const course = row.original;
      return (
        <Link
          href={`/admin/courses/${course.id}`}
          className="group flex min-w-0 items-center gap-x-3"
        >
          <CourseThumbnail src={course.imageUrl} className="w-16" />
          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-x-2">
              <span className="truncate font-medium text-ink-900 group-hover:text-brand-700" title={course.title}>
                {course.title}
              </span>
              {course.role === "co" && (
                <span className="shrink-0 rounded-full bg-highlight-50 px-2 py-0.5 text-3xs font-semibold uppercase tracking-wide text-highlight-700">
                  Co-teaching
                </span>
              )}
            </p>
            <p className="flex min-w-0 items-center gap-x-1.5 text-xs text-ink-500">
              {course.code && (
                <span className="shrink-0 rounded bg-ink-100 px-1 py-px font-semibold text-ink-700">{course.code}</span>
              )}
              <span className="truncate">{course.category ?? "Uncategorised"}</span>
            </p>
          </div>
        </Link>
      );
    },
    meta: { className: "w-full max-w-0 min-w-[240px]" },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge published={row.original.isPublished} />,
    filterFn: (row, id, value: string) =>
      value === "all" || (value === "published") === row.getValue<boolean>(id),
  },
  {
    id: "chapters",
    accessorFn: (row) => row.chaptersPublished,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Chapters" />,
    cell: ({ row }) => (
      <ChapterProgress published={row.original.chaptersPublished} total={row.original.chaptersTotal} />
    ),
    meta: { className: "hidden lg:table-cell" },
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" align="right" />,
    cell: ({ row }) => {
      const price = row.original.price;
      return (
        <span className="block text-right tabular-nums text-ink-700">
          {price === null ? <span className="text-ink-400">—</span> : price === 0 ? "Free" : formatPrice(price)}
        </span>
      );
    },
    sortUndefined: "last",
    meta: { className: "text-right" },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-ink-500" suppressHydrationWarning>{formatUpdated(row.original.updatedAt)}</span>
    ),
    sortingFn: "datetime",
    meta: { className: "hidden xl:table-cell" },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CourseRowActions course={row.original} />
      </div>
    ),
    enableSorting: false,
    meta: { className: "w-12" },
  },
];
