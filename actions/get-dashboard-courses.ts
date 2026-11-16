import { db } from "@/lib/db";

export type DashboardCourse = {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  code: string | null;
  level: string | null;
  category: string | null;
  chaptersTotal: number;
  chaptersCompleted: number;
  progress: number; // 0–100
  /** First published chapter the student hasn't completed (or the first chapter if all done). */
  nextChapter: { id: string; title: string; position: number } | null;
  lastActivity: Date | null;
};

export type ActivityDay = {
  key: string;    // "2026-11-16"
  label: string;  // "Mon"
  date: string;   // "Nov 16"
  count: number;
};

export type Dashboard = {
  courses: DashboardCourse[];
  continueCourse: DashboardCourse | null;
  stats: {
    enrolled: number;
    inProgress: number;
    completed: number;
    chaptersCompleted: number;
    chaptersTotal: number;
  };
  activity: {
    days: ActivityDay[];
    thisWeek: number;
    streak: number;
  };
  recommended: DashboardCourse[];
};

const DAY_MS = 86_400_000;

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const lastSevenDays = (): ActivityDay[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() - (6 - i) * DAY_MS);
    return {
      key: dayKey(d),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    };
  });
};

/** Consecutive days (ending today, or yesterday if nothing yet today) with ≥1 completed chapter. */
const computeStreak = (activeDays: Set<string>) => {
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!activeDays.has(dayKey(cursor))) cursor.setTime(cursor.getTime() - DAY_MS);

  let streak = 0;
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  return streak;
};

const EMPTY: Dashboard = {
  courses: [],
  continueCourse: null,
  stats: { enrolled: 0, inProgress: 0, completed: 0, chaptersCompleted: 0, chaptersTotal: 0 },
  activity: { days: lastSevenDays(), thisWeek: 0, streak: 0 },
  recommended: [],
};

const courseSelect = {
  id: true,
  title: true,
  imageUrl: true,
  price: true,
  code: true,
  level: true,
  category: { select: { name: true } },
  chapters: {
    where: { isPublished: true },
    select: { id: true, title: true, position: true },
    orderBy: { position: "asc" as const },
  },
};

/**
 * Everything the student dashboard needs, in one parallel round of queries
 * (+1 only when there is nothing enrolled, for recommendations).
 */
export const getDashboard = async (userId: string): Promise<Dashboard> => {
  try {
    const [purchases, progressRows] = await Promise.all([
      db.purchase.findMany({
        where: { userId },
        select: { createdAt: true, course: { select: courseSelect } },
        orderBy: { createdAt: "desc" },
      }),
      db.userProgress.findMany({
        where: { userId, isCompleted: true },
        select: { chapterId: true, updatedAt: true },
      }),
    ]);

    const completedAt = new Map(progressRows.map((p) => [p.chapterId, p.updatedAt]));

    const courses: DashboardCourse[] = purchases.map(({ course, createdAt }) => {
      const done = course.chapters.filter((ch) => completedAt.has(ch.id));
      const total = course.chapters.length;
      const lastActivity = done.reduce<Date | null>((latest, ch) => {
        const at = completedAt.get(ch.id)!;
        return !latest || at > latest ? at : latest;
      }, null);
      const next = course.chapters.find((ch) => !completedAt.has(ch.id)) ?? course.chapters[0] ?? null;

      return {
        id: course.id,
        title: course.title,
        imageUrl: course.imageUrl,
        price: course.price,
        code: course.code,
        level: course.level,
        category: course.category?.name ?? null,
        chaptersTotal: total,
        chaptersCompleted: done.length,
        progress: total ? Math.round((done.length / total) * 100) : 0,
        nextChapter: next,
        lastActivity: lastActivity ?? createdAt,
      };
    });

    const inProgress = courses.filter((c) => c.progress < 100);
    const continueCourse =
      [...inProgress].sort(
        (a, b) => (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0)
      )[0] ?? null;

    // Activity over the last 7 days, and the current streak.
    const days = lastSevenDays();
    const dayIndex = new Map(days.map((d, i) => [d.key, i]));
    const activeDays = new Set<string>();
    progressRows.forEach((p) => {
      const key = dayKey(p.updatedAt);
      activeDays.add(key);
      const i = dayIndex.get(key);
      if (i !== undefined) days[i].count += 1;
    });

    const recommended = courses.length
      ? []
      : (
          await db.course.findMany({
            where: { isPublished: true },
            select: courseSelect,
            orderBy: { createdAt: "desc" },
            take: 4,
          })
        ).map((course) => ({
          id: course.id,
          title: course.title,
          imageUrl: course.imageUrl,
          price: course.price,
          code: course.code,
          level: course.level,
          category: course.category?.name ?? null,
          chaptersTotal: course.chapters.length,
          chaptersCompleted: 0,
          progress: 0,
          nextChapter: course.chapters[0] ?? null,
          lastActivity: null,
        }));

    return {
      courses,
      continueCourse,
      stats: {
        enrolled: courses.length,
        inProgress: inProgress.length,
        completed: courses.length - inProgress.length,
        chaptersCompleted: courses.reduce((sum, c) => sum + c.chaptersCompleted, 0),
        chaptersTotal: courses.reduce((sum, c) => sum + c.chaptersTotal, 0),
      },
      activity: {
        days,
        thisWeek: days.reduce((sum, d) => sum + d.count, 0),
        streak: computeStreak(activeDays),
      },
      recommended,
    };
  } catch (error) {
    console.log("[GET_DASHBOARD]", error);
    return EMPTY;
  }
};
