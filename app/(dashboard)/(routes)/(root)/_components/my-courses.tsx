"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, BookOpen, LayoutGrid, List } from "lucide-react";

import { DataTableFilterTabs } from "@/components/data-table/data-table-filter-tabs";
import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { cn } from "@/lib/utils";
import type { DashboardCourse } from "@/actions/get-dashboard-courses";
import { EnrolledCourseCard } from "./enrolled-course-card";
import { Heading } from "@/components/ui/typography";

type Tab = "all" | "in-progress" | "completed";
type View = "grid" | "list";
type Sort = "recent" | "progress" | "title";

const PREF_KEY = "eduenroll:my-courses";

const SORTS: { value: Sort; label: string }[] = [
  { value: "recent", label: "Recently accessed" },
  { value: "progress", label: "Progress" },
  { value: "title", label: "Title (A–Z)" },
];

export const MyCourses = ({ courses }: { courses: DashboardCourse[] }) => {
  const [tab, setTab] = useState<Tab>("all");
  const [view, setView] = useState<View>("grid");
  const [sort, setSort] = useState<Sort>("recent");

  // Remember view & sort per device.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}");
      if (saved.view === "list" || saved.view === "grid") setView(saved.view);
      if (SORTS.some((s) => s.value === saved.sort)) setSort(saved.sort);
    } catch { /* ignore */ }
  }, []);
  const savePref = (patch: Partial<{ view: View; sort: Sort }>) => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({ view, sort, ...patch }));
    } catch { /* ignore */ }
  };

  const inProgress = courses.filter((c) => c.progress < 100);
  const completed = courses.filter((c) => c.progress === 100);

  const visible = useMemo(() => {
    const list = tab === "all" ? courses : tab === "in-progress" ? inProgress : completed;
    return [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "progress") return b.progress - a.progress;
      return (new Date(b.lastActivity ?? 0).getTime()) - (new Date(a.lastActivity ?? 0).getTime());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, tab, sort]);

  return (
    <section aria-labelledby="my-courses-heading" className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Heading as="h2" id="my-courses-heading" size="card">My courses</Heading>

        <div className="flex flex-wrap items-center gap-2">
          <DataTableFilterTabs<Tab>
            label="Filter courses"
            value={tab}
            onChange={setTab}
            className="w-full sm:w-auto"
            options={[
              { value: "all", label: "All", count: courses.length },
              { value: "in-progress", label: "In progress", count: inProgress.length },
              { value: "completed", label: "Completed", count: completed.length },
            ]}
          />

          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Sort courses</span>
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <select
              value={sort}
              onChange={(e) => { const v = e.target.value as Sort; setSort(v); savePref({ sort: v }); }}
              className="h-10 w-full appearance-none rounded-md border border-ink-200 bg-white pl-9 pr-8 text-sm font-medium text-ink-700 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 sm:w-auto"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400">▾</span>
          </label>

          <div role="radiogroup" aria-label="Course layout" className="inline-flex h-10 shrink-0 rounded-md border border-ink-200 bg-white p-0.5 shadow-sm">
            {([
              { value: "grid", label: "Card view", icon: LayoutGrid },
              { value: "list", label: "List view", icon: List },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={view === value}
                aria-label={label}
                title={label}
                onClick={() => { setView(value); savePref({ view: value }); }}
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

      {visible.length ? (
        view === "grid" ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visible.map((course) => (
              <li key={course.id}><EnrolledCourseCard course={course} view="grid" /></li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-3">
            {visible.map((course) => (
              <li key={course.id}><EnrolledCourseCard course={course} view="list" /></li>
            ))}
          </ul>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-ink-300 bg-white">
          <DataTableEmpty
            icon={BookOpen}
            title={tab === "completed" ? "No completed courses yet" : "Nothing in progress"}
            description={tab === "completed" ? "Finish every lecture of a course to see it here." : "All your courses are complete. Nice work!"}
          />
        </div>
      )}
    </section>
  );
};
