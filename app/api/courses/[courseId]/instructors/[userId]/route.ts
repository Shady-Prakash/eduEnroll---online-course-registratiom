import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCourseOwner } from "@/lib/course-owner";

/** Owner removes a co-teacher, or a co-teacher leaves the course themselves. */
export async function DELETE(_req: Request, { params }: { params: { courseId: string; userId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const isOwner = !!(await getCourseOwner(params.courseId));
    const isSelf = userId === params.userId;
    if (!isOwner && !isSelf) return new NextResponse("Only the course owner can remove teachers.", { status: 403 });

    await db.courseInstructor.deleteMany({ where: { courseId: params.courseId, userId: params.userId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("[INSTRUCTORS_DELETE]", error);
    return new NextResponse("Couldn't remove the teacher.", { status: 500 });
  }
}
