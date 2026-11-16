import { isTeacher } from "@/lib/roles";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getCourseReadiness } from "@/lib/course-readiness";

import { db } from "@/lib/db";

export async function PATCH(
  _req: Request,
  { params } : { params: { courseId: string } }
) {
  try {
    const { userId, orgRole } = auth();

    if (!userId || !isTeacher(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          }
        }
      }
    });

    if(!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const readiness = getCourseReadiness(course);

    if (!readiness.canPublish) {
      return new NextResponse(
        `Complete these first: ${readiness.missing.map((m) => m.label.toLowerCase()).join(", ")}`,
        { status: 400 }
      );
    }

    const publishedCourse = await db.course.update({
      where: {
        id: params.courseId,
        userId,
      },
      data: {
        isPublished: true,
      }
    });

    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.log("[COURSE_ID_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}