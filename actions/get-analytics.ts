import { db } from "@/lib/db";
import { taughtBy } from "@/lib/course-owner";

export type MonthlyPoint = {
  key: string;      // "2026-11"
  label: string;    // "Nov"
  revenue: number;
  sales: number;
};

export type CourseStat = {
  id: string;
  title: string;
  isPublished: boolean;
  price: number;
  sales: number;
  revenue: number;
  publishedChapters: number;
  totalChapters: number;
  /** 0–100: completed published chapters across all buyers. null when not measurable. */
  completionRate: number | null;
};

export type Analytics = {
  totals: {
    revenue: number;
    sales: number;
    students: number;
    publishedCourses: number;
    totalCourses: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
  };
  monthly: MonthlyPoint[];
  courses: CourseStat[];
};

const MONTHS = 6;

const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const emptyMonths = (): MonthlyPoint[] => {
  const now = new Date();
  return Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    return {
      key: monthKey(d),
      label: d.toLocaleString("en-US", { month: "short" }),
      revenue: 0,
      sales: 0,
    };
  });
};

const EMPTY: Analytics = {
  totals: {
    revenue: 0,
    sales: 0,
    students: 0,
    publishedCourses: 0,
    totalCourses: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
  },
  monthly: emptyMonths(),
  courses: [],
};

/**
 * Analytics for the courses owned by a teacher.
 * Revenue = amount paid on one-time purchases (older purchases without a stored
 * amount fall back to the course price). Pass enrolments count as students, not revenue.
 */
export const getAnalytics = async (userId: string): Promise<Analytics> => {
  try {
    const courses = await db.course.findMany({
      where: taughtBy(userId),
      include: {
        purchases: { select: { userId: true, createdAt: true, source: true, amount: true } },
        chapters: { select: { id: true, isPublished: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Completed published chapters, grouped by chapter, for buyer completion rates.
    const publishedChapterIds = courses.flatMap((c) =>
      c.chapters.filter((ch) => ch.isPublished).map((ch) => ch.id)
    );
    const completed = publishedChapterIds.length
      ? await db.userProgress.findMany({
          where: { chapterId: { in: publishedChapterIds }, isCompleted: true },
          select: { userId: true, chapterId: true },
        })
      : [];

    const monthly = emptyMonths();
    const monthIndex = new Map(monthly.map((m, i) => [m.key, i]));
    const students = new Set<string>();

    const courseStats: CourseStat[] = courses.map((course) => {
      const price = course.price ?? 0;
      const buyers = new Set(course.purchases.map((p) => p.userId));
      const published = course.chapters.filter((ch) => ch.isPublished);
      const publishedIds = new Set(published.map((ch) => ch.id));

      const paid = course.purchases.filter((p) => p.source !== "subscription");
      const paidOf = (p: { amount: number | null }) => p.amount ?? price;
      course.purchases.forEach((p) => {
        students.add(p.userId);
        const i = monthIndex.get(monthKey(p.createdAt));
        if (i !== undefined && p.source !== "subscription") {
          monthly[i].revenue += paidOf(p);
          monthly[i].sales += 1;
        }
      });

      const completedByBuyers = completed.filter(
        (u) => publishedIds.has(u.chapterId) && buyers.has(u.userId)
      ).length;
      const possible = buyers.size * published.length;

      return {
        id: course.id,
        title: course.title,
        isPublished: course.isPublished,
        price,
        sales: paid.length,
        revenue: paid.reduce((sum, p) => sum + paidOf(p), 0),
        publishedChapters: published.length,
        totalChapters: course.chapters.length,
        completionRate: possible ? Math.round((completedByBuyers / possible) * 100) : null,
      };
    });

    courseStats.sort((a, b) => b.revenue - a.revenue || b.sales - a.sales);

    return {
      totals: {
        revenue: courseStats.reduce((sum, c) => sum + c.revenue, 0),
        sales: courseStats.reduce((sum, c) => sum + c.sales, 0),
        students: students.size,
        publishedCourses: courseStats.filter((c) => c.isPublished).length,
        totalCourses: courseStats.length,
        revenueThisMonth: monthly[MONTHS - 1].revenue,
        revenueLastMonth: monthly[MONTHS - 2].revenue,
      },
      monthly,
      courses: courseStats,
    };
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return EMPTY;
  }
};
