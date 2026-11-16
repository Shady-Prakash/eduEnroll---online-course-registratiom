import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { PriceFilter, SORTS, SortValue, searchCourses } from "@/actions/search-courses";

import { SearchShell } from "./_components/search-shell";
import { CourseCard } from "@/components/course-card";
import { CourseResultCard } from "./_components/course-result-card";
import { Heading } from "@/components/ui/typography";

export const metadata = { title: "Browse courses" };

interface SearchPageProps {
  searchParams: {
    q?: string;
    title?: string; // legacy param name
    categoryId?: string;
    level?: string;
    price?: string;
    sort?: string;
    view?: string;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const q = (searchParams.q ?? searchParams.title)?.trim() || undefined;
  const price = searchParams.price === "free" || searchParams.price === "paid" ? (searchParams.price as PriceFilter) : undefined;
  const sort = SORTS.some((s) => s.value === searchParams.sort) ? (searchParams.sort as SortValue) : undefined;

  const { results, facets, total } = await searchCourses(userId, {
    q,
    categoryId: searchParams.categoryId,
    level: searchParams.level,
    price,
    sort,
  });

  const hasFilters = !!(searchParams.categoryId || searchParams.level || price);
  const view = searchParams.view === "grid" ? "grid" : "list";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="space-y-3">
        <Heading>
          {q ? <>Results for &ldquo;{q}&rdquo;</> : "Browse courses"}
        </Heading>
        {!q && <p className="text-sm text-ink-500">Find your KOI units by name, unit code or topic.</p>}
        <div className="md:hidden">
          <SearchInput />
        </div>
      </div>

      <SearchShell total={total} facets={facets} view={view}>
          {results.length > 0 ? (
            view === "grid" ? (
              // Card view: one more column when the filter panel is hidden (data-filters on SearchShell).
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 group-data-[filters=closed]/search:lg:grid-cols-3 group-data-[filters=closed]/search:xl:grid-cols-4">
                {results.map((c) => (
                  <li key={c.id}>
                    <CourseCard
                      id={c.id}
                      title={c.title}
                      imageUrl={c.imageUrl}
                      chaptersLength={c.chaptersCount}
                      price={c.currentPrice}
                      originalPrice={c.discountPct > 0 ? c.originalPrice : null}
                      progress={c.progress}
                      category={c.category}
                      code={c.code}
                      level={c.level}
                      rating={c.rating}
                      ratingCount={c.ratingCount}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="-mx-2 divide-y divide-ink-200 sm:-mx-3">
                {results.map((course) => (
                  <li key={course.id} className="py-2">
                    <CourseResultCard course={course} />
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white px-4 py-14 text-center">
              <div className="rounded-full bg-ink-100 p-3">
                <SearchX className="h-6 w-6 text-ink-500" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-ink-900">No courses found</p>
                <p className="mt-1 text-sm text-ink-500">
                  {q ? "Check the spelling, try a unit code like ICT725, or use fewer words." : "Try removing a filter."}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {hasFilters && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}>Clear filters</Link>
                  </Button>
                )}
                {q && (
                  <Button asChild size="sm">
                    <Link href="/search">Browse all courses</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
      </SearchShell>
    </div>
  );
};

export default SearchPage;
