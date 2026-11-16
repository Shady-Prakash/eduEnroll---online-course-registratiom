import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { getCourseEditor } from "@/lib/course-owner";
import { CAPTION_LANGUAGES, languageLabel } from "@/lib/captions";
import { addCaptionFile, generateCaptions, getCaptionTracks } from "@/lib/mux";

const languageCodes = CAPTION_LANGUAGES.map((l) => l.code) as [string, ...string[]];

const schema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("generate"), language: z.enum(languageCodes) }),
  z.object({
    mode: z.literal("upload"),
    url: z.string().url().startsWith("https://"),
    fileName: z.string().max(200).optional(),
    language: z.string().trim().min(2).max(10),
    name: z.string().trim().max(60).optional(),
  }),
]);

type Params = { params: { courseId: string; chapterId: string } };

const getAssetId = async ({ courseId, chapterId }: Params["params"]) => {
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId, courseId },
    select: { muxData: { select: { assetId: true } } },
  });
  return chapter?.muxData?.assetId ?? null;
};

/** List caption tracks (for polling while auto-captions are being generated). */
export async function GET(_req: Request, { params }: Params) {
  if (!(await getCourseEditor(params.courseId))) return new NextResponse("Unauthorized", { status: 401 });
  const assetId = await getAssetId(params);
  if (!assetId) return NextResponse.json([]);
  return NextResponse.json(await getCaptionTracks(assetId));
}

/** Auto-generate captions, or attach an uploaded .vtt/.srt file. */
export async function POST(req: Request, { params }: Params) {
  try {
    if (!(await getCourseEditor(params.courseId))) return new NextResponse("Unauthorized", { status: 401 });

    const assetId = await getAssetId(params);
    if (!assetId) return new NextResponse("Upload a video first. Captions attach to the processed video.", { status: 400 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse(parsed.error.issues[0]?.message ?? "Invalid request", { status: 400 });
    const body = parsed.data;

    const existing = await getCaptionTracks(assetId);
    if (existing.some((t) => t.languageCode === body.language)) {
      return new NextResponse(`This video already has ${languageLabel(body.language)} captions. Remove them first to replace.`, { status: 409 });
    }

    if (body.mode === "generate") {
      await generateCaptions(assetId, body.language as Parameters<typeof generateCaptions>[1]);
    } else {
      if (body.fileName && !/\.(vtt|srt)$/i.test(body.fileName)) {
        return new NextResponse("Caption files must be .vtt or .srt", { status: 400 });
      }
      await addCaptionFile(assetId, body.url, body.language, body.name || languageLabel(body.language));
    }

    return NextResponse.json(await getCaptionTracks(assetId));
  } catch (error) {
    console.log("[CAPTIONS_POST]", error);
    const message = error instanceof Error ? error.message : "";
    return new NextResponse(
      message.includes("audio")
        ? message
        : "Mux couldn't add captions to this video. Auto-captions may be unavailable on test environments.",
      { status: 502 }
    );
  }
}
