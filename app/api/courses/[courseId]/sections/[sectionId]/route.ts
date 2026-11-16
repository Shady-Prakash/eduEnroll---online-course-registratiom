import { normalizeChapterOrder } from "@/lib/curriculum-order";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { getCourseEditor } from "@/lib/course-owner";

const schema = z.object({ title: z.string().trim().min(1, "Section title is required").max(160) });

type Params = { params: { courseId: string; sectionId: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    if (!(await getCourseEditor(params.courseId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse(parsed.error.issues[0].message, { status: 400 });

    const section = await db.section.update({
      where: { id: params.sectionId, courseId: params.courseId },
      data: { title: parsed.data.title },
    });
    return NextResponse.json(section);
  } catch (error) {
    console.log("[SECTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/** Deleting a section keeps its lectures: they become unassigned. */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    if (!(await getCourseEditor(params.courseId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    await db.$transaction([
      db.chapter.updateMany({ where: { sectionId: params.sectionId, courseId: params.courseId }, data: { sectionId: null } }),
      db.section.delete({ where: { id: params.sectionId, courseId: params.courseId } }),
    ]);
    await normalizeChapterOrder(params.courseId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("[SECTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
