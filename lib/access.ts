import { db } from "@/lib/db";
import { ACTIVE_STATUSES } from "@/lib/plans";

export type ActiveSubscription = {
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
};

/** The user's eduEnroll Pass if it currently grants access, else null. */
export const getActiveSubscription = async (userId: string): Promise<ActiveSubscription | null> => {
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
  });
  if (!sub) return null;
  const active = (ACTIVE_STATUSES as readonly string[]).includes(sub.status) && sub.currentPeriodEnd > new Date();
  return active ? sub : null;
};

export type AccessVia = "purchase" | "subscription" | "instructor" | null;

/**
 * Single source of truth for "can this student open lecture pages?"
 *  - bought the course outright (lifetime)
 *  - enrolled through an ACTIVE eduEnroll Pass
 *  - teaches the course (owner or co-teacher)
 */
export const getCourseAccess = async (userId: string, courseId: string) => {
  const [enrollment, course, coTeacher, subscription] = await Promise.all([
    db.purchase.findUnique({ where: { userId_courseId: { userId, courseId } }, select: { id: true, source: true } }),
    db.course.findUnique({ where: { id: courseId }, select: { userId: true } }),
    db.courseInstructor.findUnique({ where: { courseId_userId: { courseId, userId } }, select: { id: true } }),
    getActiveSubscription(userId),
  ]);

  let via: AccessVia = null;
  if (course?.userId === userId || coTeacher) via = "instructor";
  else if (enrollment?.source === "purchase") via = "purchase";
  else if (enrollment?.source === "subscription" && subscription) via = "subscription";

  return {
    hasAccess: via !== null,
    via,
    enrollment,
    subscription,
    /** Enrolled through the Pass, but it lapsed: offer to buy or resubscribe. */
    passExpired: enrollment?.source === "subscription" && !subscription,
  };
};
