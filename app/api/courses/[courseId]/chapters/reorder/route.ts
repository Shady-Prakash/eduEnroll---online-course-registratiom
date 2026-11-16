import { normalizeChapterOrder } from "@/lib/curriculum-order";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { getCourseEditor } from "@/lib/course-owner";

const schema = z.object({
  list: z
    .array(
      z.object({
        id: z.string().min(1),
        position: z.number().int().min(0),
        /** Optional: move the lecture to another section (null = unassigned). */
        sectionId: z.string().min(1).nullable().optional(),
      })
    )
    .max(500),
});

export async function PUT(req: Request, { params }: { params: { courseId: string } }) {
  try {
    if (!(await getCourseEditor(params.courseId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse("Invalid order", { status: 400 });
    const { list } = parsed.data;

    // Any target section must belong to this course.
    const sectionIds = Array.from(new Set(list.map((i) => i.sectionId).filter((v): v is string => !!v)));
    if (sectionIds.length) {
      const owned = await db.section.count({ where: { id: { in: sectionIds }, courseId: params.courseId } });
      if (owned !== sectionIds.length) return new NextResponse("Invalid section", { status: 400 });
    }

    // Scoped to this course, so another course's chapters can't be touched.
    await db.$transaction(
      list.map((item) =>
        db.chapter.update({
          where: { id: item.id, courseId: params.courseId },
          data: {
            position: item.position,
            ...(item.sectionId !== undefined ? { sectionId: item.sectionId } : {}),
          },
        })
      )
    );

    await normalizeChapterOrder(params.courseId);
    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
