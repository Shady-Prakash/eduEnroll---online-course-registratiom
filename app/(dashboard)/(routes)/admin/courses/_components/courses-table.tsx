"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookPlus, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableFilterTabs } from "@/components/data-table/data-table-filter-tabs";

import type { CourseRow, StatusFilter } from "./types";
import { columns } from "./columns";
import { CourseMobileCard } from "./course-mobile-card";

interface CoursesTableProps {
  courses: CourseRow[];
}

export const CoursesTable = ({ courses }: CoursesTableProps) => {
  const [status, setStatus] = useState<StatusFilter>("all");

  const counts = useMemo(() => {
    const published = courses.filter((c) => c.isPublished).length;
    return { all: courses.length, published, draft: courses.length - published };
  }, [courses]);

  // First-run state: the teacher has no courses at all.
  if (!courses.length) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 bg-white">
        <DataTableEmpty
          icon={BookPlus}
          title="Create your first course"
          description="Add a title, then build chapters, upload videos and publish when you're ready."
          action={
            <Button asChild>
              <Link href="/admin/courses/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                New course
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={courses}
      itemLabel={courses.length === 1 ? "course" : "courses"}
      initialSorting={[{ id: "updatedAt", desc: true }]}
      renderMobileRow={(row) => <CourseMobileCard course={row.original} />}
      globalFilterFn={(row, _columnId, query) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        const { title, category, code } = row.original;
        return [title, category, code].some((v) => (v ?? "").toLowerCase().includes(q));
      }}
      toolbar={(table) => {
        const query = (table.getState().globalFilter as string) ?? "";
        const isFiltered = !!query || status !== "all";

        const setStatusFilter = (value: StatusFilter) => {
          setStatus(value);
          table.getColumn("isPublished")?.setFilterValue(value === "all" ? undefined : value);
        };

        return (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchField
              value={query}
              onValueChange={(v) => table.setGlobalFilter(v)}
              placeholder="Search title, code or category"
              label="Search courses"
              containerClassName="sm:max-w-xs"
            />
            <div className="flex items-center gap-x-2">
              <DataTableFilterTabs<StatusFilter>
                label="Filter by status"
                value={status}
                onChange={setStatusFilter}
                className="w-full sm:w-auto"
                options={[
                  { value: "all", label: "All", count: counts.all },
                  { value: "published", label: "Published", count: counts.published },
                  { value: "draft", label: "Draft", count: counts.draft },
                ]}
              />
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-10 text-ink-500 sm:inline-flex"
                  onClick={() => {
                    table.setGlobalFilter("");
                    setStatusFilter("all");
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        );
      }}
      emptyState={
        <DataTableEmpty
          title="No courses match your filters"
          description="Try a different search term or status."
        />
      }
    />
  );
};
