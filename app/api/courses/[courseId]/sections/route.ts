import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { getCourseEditor } from "@/lib/course-owner";

const schema = z.object({ title: z.string().trim().min(1, "Section title is required").max(160) });

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    if (!(await getCourseEditor(params.courseId))) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse(parsed.error.issues[0].message, { status: 400 });

    const last = await db.section.findFirst({
      where: { courseId: params.courseId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const section = await db.section.create({
      data: { title: parsed.data.title, courseId: params.courseId, position: (last?.position ?? 0) + 1 },
    });
    return NextResponse.json(section);
  } catch (error) {
    console.log("[SECTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
