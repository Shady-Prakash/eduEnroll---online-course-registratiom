import { getCourseEditor } from "@/lib/course-owner";
import { isTeacher } from "@/lib/roles";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { muxVideo as video } from "@/lib/mux";

export async function PATCH (
  _req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId, orgRole } = auth();

    if (!userId || !isTeacher(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await getCourseEditor(params.courseId);

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      }
    });

    let muxData = await db.muxData.findUnique({
      where: {
        chapterId: params.chapterId,
      }
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    const missing = [
      !chapter.title && "title",
      !chapter.description && "description",
      !chapter.videoUrl && "video",
    ].filter(Boolean);

    if (missing.length) {
      return new NextResponse(`Missing required fields: ${missing.join(", ")}`, { status: 400 });
    }

    // Video saved but never processed by Mux (e.g. keys were wrong at upload time):
    // retry processing now so the video doesn't need to be re-uploaded.
    if (!muxData && chapter.videoUrl) {
      try {
        const asset = await video.assets.create({
          input: [{ url: chapter.videoUrl, generated_subtitles: [{ language_code: "en", name: "English (auto-generated)" }] }],
          playback_policy: ["public"],
          test: false,
        });
        muxData = await db.muxData.create({
          data: {
            chapterId: chapter.id,
            assetId: asset.id,
            playbackId: asset.playback_ids?.[0]?.id,
          },
        });
      } catch (muxError) {
        console.log("[CHAPTER_PUBLISH_MUX]", muxError);
      }
    }

    if (!muxData) {
      return new NextResponse(
        "Video was not processed by Mux. Mux rejected the request: check MUX_TOKEN_ID / MUX_TOKEN_SECRET in .env and restart the dev server.",
        { status: 400 }
      );
    }

    const publishedChapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        isPublished: true,
      }
    });

    return NextResponse.json(publishedChapter);
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}