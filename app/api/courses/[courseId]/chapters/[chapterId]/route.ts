import { getCourseEditor } from "@/lib/course-owner";
import { normalizeChapterOrder } from "@/lib/curriculum-order";
import { isTeacher } from "@/lib/roles";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { chapterUpdateSchema } from "@/lib/validations/course";

import { db } from "@/lib/db";
 
import { muxVideo as video } from "@/lib/mux";

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
      const { userId, orgRole } = auth();

      if(!userId || !isTeacher(orgRole)) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const ownCourse = await getCourseEditor(params.courseId);

      if(!ownCourse) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const chapter = await db.chapter.findUnique({
        where: {
          id: params.chapterId,
          courseId: params.courseId,
        }
      });

      if (!chapter) {
        return new NextResponse("Not Found", { status: 404 });
      }

      if (chapter.videoUrl) {
        const existingMuxData = await db.muxData.findFirst({
          where: {
            chapterId: params.chapterId,
          }
        });

        if (existingMuxData) {
          await video.assets.delete(existingMuxData.assetId);
          await db.muxData.delete({
            where: {
              id: existingMuxData.id,
            }
          });
        }
      }

      const deletedChapter = await db.chapter.delete({
        where: {
          id: params.chapterId
        }
      });

      const publishedChaptersInCourse = await db.chapter.findMany({
        where: {
          courseId: params.courseId,
          isPublished: true,
        }
      });

      if(!publishedChaptersInCourse.length) {
        await db.course.update({
          where: {
            id: params.courseId,
          },
          data: {
            isPublished: false,
          }
        });
      }
      
      return NextResponse.json(deletedChapter);
} catch (error) {
  console.log("[CHAPTER_ID_DELETE]", error);
  return new NextResponse("Internal Error", { status: 500 });
}

}

export async function PATCH(
  req: Request,
  { params } : { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId, orgRole } = auth();
    const parsed = chapterUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse(parsed.error.issues[0]?.message ?? "Invalid data", { status: 400 });
    }
    const values = parsed.data;

    if (values.sectionId) {
      const section = await db.section.findUnique({ where: { id: values.sectionId, courseId: params.courseId }, select: { id: true } });
      if (!section) return new NextResponse("Invalid section", { status: 400 });
    }

    if(!userId || !isTeacher(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await getCourseEditor(params.courseId);

    if(!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId
      },
      data: {
        ...values,
        // A new video means a new length; it is re-read from Mux once processed.
        ...(values.videoUrl ? { duration: null } : {}),
      }
    });

    if (values.sectionId !== undefined) await normalizeChapterOrder(params.courseId);

    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        }
      });

      if (existingMuxData) {
        await video.assets.delete(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          }
        });
      }

      let asset;
      try {
        asset = await video.assets.create({
          // Auto-generate English captions as soon as the video is processed.
          input: [{ url: values.videoUrl, generated_subtitles: [{ language_code: "en", name: "English (auto-generated)" }] }],
          playback_policy: ['public'],
          test: false,
        });
      } catch (muxError) {
        console.log("[MUX_ASSET_CREATE]", muxError);
        return new NextResponse(
          "Video saved, but Mux could not process it. Check MUX_TOKEN_ID / MUX_TOKEN_SECRET in .env.",
          { status: 502 }
        );
      }

      await db.muxData.create({
        data: {
          chapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        }
      })
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}