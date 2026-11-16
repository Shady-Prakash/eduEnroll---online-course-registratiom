import { getCourseEditor } from "@/lib/course-owner";
import { normalizeChapterOrder } from "@/lib/curriculum-order";
import { isTeacher } from "@/lib/roles";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
  req: Request,
  {params}: { params: { courseId: string } }
) {
  try {
    const { userId, orgRole } = auth();
    const { title, sectionId } = (await req.json()) as { title?: string; sectionId?: string | null };

    if (!userId || !isTeacher(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await getCourseEditor(params.courseId);

    if(!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cleanTitle = title?.trim();
    if (!cleanTitle || cleanTitle.length > 160) {
      return new NextResponse("Lecture title is required (max 160 characters)", { status: 400 });
    }

    if (sectionId) {
      const section = await db.section.findUnique({ where: { id: sectionId, courseId: params.courseId }, select: { id: true } });
      if (!section) return new NextResponse("Invalid section", { status: 400 });
    }

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId: params.courseId,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const chapter = await db.chapter.create({
      data: {
        title: cleanTitle,
        courseId: params.courseId,
        position: newPosition,
        sectionId: sectionId || null,
      },
    });

    if (sectionId) await normalizeChapterOrder(params.courseId);

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTERS", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}