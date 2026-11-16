import { auth } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { isTeacher } from "@/lib/roles";

export type CourseRole = "owner" | "co";

/**
 * The signed-in teacher's role on a course: "owner", "co" (co-teacher), or null.
 *  - owner: everything (publish, pricing, teachers, delete)
 *  - co:    edit content (details, curriculum, lectures, resources, captions)
 */
export const getCourseRole = async (courseId: string): Promise<{ userId: string; role: CourseRole } | null> => {
  const { userId, orgRole } = auth();
  if (!userId || !isTeacher(orgRole)) return null;

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { userId: true, instructors: { where: { userId }, select: { id: true } } },
  });
  if (!course) return null;
  if (course.userId === userId) return { userId, role: "owner" };
  if (course.instructors.length) return { userId, role: "co" };
  return null;
};

/** userId if the teacher can edit this course's content (owner or co-teacher). */
export const getCourseEditor = async (courseId: string) => (await getCourseRole(courseId))?.userId ?? null;

/** userId only if the signed-in teacher OWNS the course. */
export const getCourseOwner = async (courseId: string) => {
  const r = await getCourseRole(courseId);
  return r?.role === "owner" ? r.userId : null;
};

/** Prisma filter: courses the user owns or co-teaches. */
export const taughtBy = (userId: string) => ({
  OR: [{ userId }, { instructors: { some: { userId } } }],
});
