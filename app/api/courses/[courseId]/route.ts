import { Prisma } from "@prisma/client";
import { courseUpdateSchema } from "@/lib/validations/course";
import { isTeacher } from "@/lib/roles";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { muxVideo as video } from "@/lib/mux";
import { getCourseRole } from "@/lib/course-owner";

export async function DELETE(
  _req: Request,
  { params }:{ params: { courseId: string } }
) {
  try {
    const { userId, orgRole } = auth();

    if (!userId || !isTeacher(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          }
        }
      }
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        await video.assets.delete(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await db.course.delete({
      where: {
        id: params.courseId,
      }
    });

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }:{ params: { courseId: string } }
) {
  try{
    const{courseId} = params;
    const access = await getCourseRole(courseId);
    if (!access) {
      return new NextResponse("unauthorized", {status: 401});
    }

    // Whitelist + validate: never let the client set userId, isPublished, etc.
    const parsed = courseUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse(parsed.error.issues[0]?.message ?? "Invalid data", { status: 400 });
    }
    const { outcomes, ...values } = parsed.data;

    // Pricing & offers are the owner's call; co-teachers edit content only.
    const pricingFields = ["price", "salePrice", "saleEndsAt"] as const;
    if (access.role !== "owner" && pricingFields.some((f) => values[f] !== undefined)) {
      return new NextResponse("Only the course owner can change pricing.", { status: 403 });
    }

    if (values.salePrice != null || values.price !== undefined) {
      const current = await db.course.findUnique({ where: { id: courseId }, select: { price: true, salePrice: true } });
      const price = values.price !== undefined ? values.price : current?.price ?? null;
      const sale = values.salePrice !== undefined ? values.salePrice : current?.salePrice ?? null;
      if (sale != null && (price == null || sale >= price)) {
        return new NextResponse("The offer price must be lower than the regular price.", { status: 400 });
      }
    }
    if (values.saleEndsAt && values.saleEndsAt <= new Date()) {
      return new NextResponse("The offer end date must be in the future.", { status: 400 });
    }

    const course = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        ...values,
        ...(outcomes !== undefined ? { outcomes: outcomes ?? Prisma.JsonNull } : {}),
      }
    });

    return NextResponse.json(course);

  } catch(error) {
    console.log("[COURSE_ID", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}