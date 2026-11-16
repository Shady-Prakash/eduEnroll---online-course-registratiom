import { normalizeChapterOrder } from "@/lib/curriculum-order";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { getCourseEditor } from "@/lib/course-owner";

const schema = z.object({
  list: z.array(z.object({ id: z.string().min(1), position: z.number().int().min(0) })).max(200),
});

export async function PUT(req: Request, { params }: { params: { courseId: string } }) {
  try {
    if (!(await getCourseEditor(params.courseId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse("Invalid order", { status: 400 });

    await db.$transaction(
      parsed.data.list.map((item) =>
        db.section.update({ where: { id: item.id, courseId: params.courseId }, data: { position: item.position } })
      )
    );
    await normalizeChapterOrder(params.courseId);
    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[SECTIONS_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
