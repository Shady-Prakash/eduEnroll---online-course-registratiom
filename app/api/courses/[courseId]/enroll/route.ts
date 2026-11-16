import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getActiveSubscription } from "@/lib/access";
import { enrollViaSubscription } from "@/lib/checkout";

/** Enrol in a course through an active eduEnroll Pass (no payment). */
export async function POST(_req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    if (!(await getActiveSubscription(userId))) {
      return new NextResponse("An active eduEnroll Pass is required.", { status: 402 });
    }

    const course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true },
      select: { id: true, userId: true, instructors: { where: { userId }, select: { id: true } }, chapters: { where: { isPublished: true }, select: { id: true }, orderBy: { position: "asc" }, take: 1 } },
    });
    if (!course) return new NextResponse("This course is no longer available.", { status: 404 });

    const first = course.chapters[0]?.id;

    // Teachers already have access to their own course; no enrolment needed.
    if (course.userId === userId || course.instructors.length > 0) {
      return NextResponse.json({ url: first ? `/courses/${course.id}/chapters/${first}` : `/courses/${course.id}`, instructor: true });
    }

    await enrollViaSubscription(userId, course.id);
    return NextResponse.json({ url: first ? `/courses/${course.id}/chapters/${first}?checkout=success` : `/courses/${course.id}` });
  } catch (error) {
    console.log("[PASS_ENROLL]", error);
    return new NextResponse("Couldn't enrol you. Please try again.", { status: 500 });
  }
}
