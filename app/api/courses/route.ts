import { isTeacher } from "@/lib/roles";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { courseCreateSchema } from "@/lib/validations/course";


export async function POST(
  req: Request,
) {
  try {
    const { userId, orgRole } = auth();
    if(!userId || !isTeacher(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const parsed = courseCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse(parsed.error.issues[0]?.message ?? "Invalid data", { status: 400 });
    }

    const course = await db.course.create({
      data: {
        userId,
        title: parsed.data.title,
        code: parsed.data.code ?? null,
        categoryId: parsed.data.categoryId ?? null,
      }
    })

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status:500 });
  }
}