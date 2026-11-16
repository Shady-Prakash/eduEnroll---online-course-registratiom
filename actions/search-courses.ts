import { clerkClient } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { COURSE_LEVELS } from "@/lib/validations/course";
import { getProgressForCourses } from "./get-progress";
import { getPricing } from "@/lib/pricing";
import { getCourseRatings } from "@/lib/reviews";

export const SORTS = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];
export type PriceFilter = "free" | "paid";

export type SearchParams = {
  q?: string;
  categoryId?: string;
  level?: string;
  price?: PriceFilter;
  sort?: SortValue;
};

export type CourseResult = {
  id: string;
  title: string;
  subtitle: string | null;
  code: string | null;
  term: string | null;
  level: string | null;
  imageUrl: string | null;
  price: number | null;
  /** What the student pays now (offer applied) and the regular price. */
  currentPrice: number;
  originalPrice: number;
  discountPct: number;
  rating: number;
  ratingCount: number;
  category: string | null;
  chaptersCount: number;
  studentsCount: number;
  instructor: string | null;
  createdAt: Date;
  /** null = not enrolled; 0–100 = enrolled progress */
  progress: number | null;
};

export type Facet = { value: string; label: string; count: number };


/** Display names for many teachers in ONE Clerk request (never blocks search). */
const getInstructorNames = async (userIds: string[]) => {
  const names = new Map<string, string>();
  if (!userIds.length) return names;
  try {
    const users = await clerkClient.users.getUserList({ userId: userIds, limit: userIds.length });
    users.forEach((u) => {
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
      if (name) names.set(u.id, name);
    });
  } catch {
    /* show results without instructor names */
  }
  return names;
};

/**
 * Catalogue search with faceted filters.
 * Text search hits title, unit code and subtitle. Facet counts reflect the
 * *other* active filters (like Udemy), so you can see what each option would return.
 * Filtering happens in memory: fine for a single institute's catalogue.
 */
export const searchCourses = async (userId: string, params: SearchParams) => {
  const q = params.q?.trim();

  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      ...(q
        ? { OR: [{ title: { contains: q } }, { code: { contains: q } }, { subtitle: { contains: q } }] }
        : {}),
    },
    select: {
      id: true,
      userId: true,
      title: true,
      subtitle: true,
      code: true,
      term: true,
      level: true,
      imageUrl: true,
      price: true,
      salePrice: true,
      saleEndsAt: true,
      createdAt: true,
      categoryId: true,
      category: { select: { name: true } },
      chapters: { where: { isPublished: true }, select: { id: true } },
      purchases: { where: { userId }, select: { id: true } },
      _count: { select: { purchases: true } },
    },
  });

  type Row = (typeof courses)[number];
  const matches = {
    category: (c: Row) => !params.categoryId || c.categoryId === params.categoryId,
    level: (c: Row) => !params.level || c.level === params.level,
    price: (c: Row) => !params.price || (params.price === "free" ? getPricing(c).isFree : !getPricing(c).isFree),
  };
  const filtered = courses.filter((c) => matches.category(c) && matches.level(c) && matches.price(c));

  // Facet counts: apply every filter except the facet's own.
  const categoryCounts = new Map<string, { label: string; count: number }>();
  courses
    .filter((c) => matches.level(c) && matches.price(c) && c.categoryId)
    .forEach((c) => {
      const cur = categoryCounts.get(c.categoryId!) ?? { label: c.category?.name ?? "Other", count: 0 };
      categoryCounts.set(c.categoryId!, { ...cur, count: cur.count + 1 });
    });
  const levelPool = courses.filter((c) => matches.category(c) && matches.price(c));
  const pricePool = courses.filter((c) => matches.category(c) && matches.level(c));

  const facets = {
    categories: Array.from(categoryCounts, ([value, { label, count }]) => ({ value, label, count }))
      .sort((a, b) => a.label.localeCompare(b.label)) as Facet[],
    levels: COURSE_LEVELS.map((l) => ({
      value: l.value,
      label: l.label,
      count: levelPool.filter((c) => c.level === l.value).length,
    })).filter((l) => l.count > 0 || l.value === params.level) as Facet[],
    prices: [
      { value: "free", label: "Free", count: pricePool.filter((c) => getPricing(c).isFree).length },
      { value: "paid", label: "Paid", count: pricePool.filter((c) => !getPricing(c).isFree).length },
    ] as Facet[],
  };

  const ratings = await getCourseRatings(filtered.map((c) => c.id));

  // Sorting
  const sort: SortValue = params.sort ?? "relevance";
  const ql = q?.toLowerCase();
  const relevance = (c: Row) =>
    !ql ? 0 : (c.code?.toLowerCase() === ql ? 3 : 0) + (c.title.toLowerCase().startsWith(ql) ? 2 : 0) + (c.title.toLowerCase().includes(ql) ? 1 : 0);
  filtered.sort((a, b) => {
    switch (sort) {
      case "newest": return b.createdAt.getTime() - a.createdAt.getTime();
      case "popular": return b._count.purchases - a._count.purchases;
      case "rating": {
        const ra = ratings.get(a.id), rb = ratings.get(b.id);
        return (rb?.average ?? 0) - (ra?.average ?? 0) || (rb?.count ?? 0) - (ra?.count ?? 0);
      }
      case "price-asc": return getPricing(a).current - getPricing(b).current;
      case "price-desc": return getPricing(b).current - getPricing(a).current;
      default: return relevance(b) - relevance(a) || b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const purchased = filtered.filter((c) => c.purchases.length > 0);
  const [progress, instructors] = await Promise.all([
    getProgressForCourses(userId, purchased),
    getInstructorNames(Array.from(new Set(filtered.map((c) => c.userId)))),
  ]);

  const results: CourseResult[] = filtered.map((c) => {
    const pricing = getPricing(c);
    return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    code: c.code,
    term: c.term,
    level: c.level,
    imageUrl: c.imageUrl,
    price: c.price,
    currentPrice: pricing.current,
    originalPrice: pricing.original,
    discountPct: pricing.discountPct,
    rating: ratings.get(c.id)?.average ?? 0,
    ratingCount: ratings.get(c.id)?.count ?? 0,
    category: c.category?.name ?? null,
    chaptersCount: c.chapters.length,
    studentsCount: c._count.purchases,
    instructor: instructors.get(c.userId) ?? null,
    createdAt: c.createdAt,
    progress: c.purchases.length ? Math.round(progress.get(c.id) ?? 0) : null,
    };
  });

  return { results, facets, total: results.length };
};
