import { getCourseEditor } from "@/lib/course-owner";
import { isTeacher } from "@/lib/roles";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string, attachmentId: string } }
) {
  try {
    const { userId, orgRole } = auth();

    if(!userId || !isTeacher(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await getCourseEditor(params.courseId);

    if(!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const attachment = await db.attachment.delete({
      where: {
        courseId: params.courseId,
        id: params.attachmentId,
      }
    });

    return NextResponse.json(attachment);

  } catch (error) {
    console.log("ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}