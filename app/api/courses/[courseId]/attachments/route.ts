import { getCourseEditor } from "@/lib/course-owner";
import { isTeacher } from "@/lib/roles";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId, orgRole } = auth();
    const { url, name } = (await req.json()) as { url?: string; name?: string };
    if(!userId || !isTeacher(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await getCourseEditor(params.courseId);

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!url || !/^https:\/\//.test(url)) {
      return new NextResponse("Invalid file URL", { status: 400 });
    }

    // Keep the original file name for students (fallback: last URL segment).
    const fileName = (name?.trim() || url.split("/").pop() || "Attachment").slice(0, 200);

    const attachment = await db.attachment.create({
      data: {
        url,
        name: fileName,
        courseId: params.courseId,
      }
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.log("COURSE_ID_ATTACHMENTS", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}