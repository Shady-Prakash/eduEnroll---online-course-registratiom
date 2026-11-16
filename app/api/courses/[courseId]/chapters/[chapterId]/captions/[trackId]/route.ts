import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCourseEditor } from "@/lib/course-owner";
import { deleteCaptionTrack, getCaptionTracks } from "@/lib/mux";

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string; chapterId: string; trackId: string } }
) {
  try {
    if (!(await getCourseEditor(params.courseId))) return new NextResponse("Unauthorized", { status: 401 });

    const chapter = await db.chapter.findUnique({
      where: { id: params.chapterId, courseId: params.courseId },
      select: { muxData: { select: { assetId: true } } },
    });
    const assetId = chapter?.muxData?.assetId;
    if (!assetId) return new NextResponse("Not found", { status: 404 });

    // Only delete tracks that actually belong to this chapter's video.
    const tracks = await getCaptionTracks(assetId);
    if (!tracks.some((t) => t.id === params.trackId)) return new NextResponse("Not found", { status: 404 });

    await deleteCaptionTrack(assetId, params.trackId);
    return NextResponse.json(await getCaptionTracks(assetId));
  } catch (error) {
    console.log("[CAPTIONS_DELETE]", error);
    return new NextResponse("Couldn't remove the captions. Please try again.", { status: 502 });
  }
}
