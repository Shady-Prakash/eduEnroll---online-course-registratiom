import Mux from "@mux/mux-node";

import { db } from "@/lib/db";
import type { CaptionLanguage, CaptionTrack } from "@/lib/captions";
import { languageLabel } from "@/lib/captions";

/** Single shared Mux client (server only). */
export const { video: muxVideo } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

type ChapterWithAsset = {
  id: string;
  duration: number | null;
  muxData: { assetId: string } | null;
};

/**
 * Fill in missing chapter durations from Mux (seconds) and save them, so each
 * video is looked up at most once after it finishes processing.
 * Returns a map of chapterId → duration for everything it could resolve.
 * Never throws: a Mux outage just means durations show up later.
 */
export const ensureChapterDurations = async (chapters: ChapterWithAsset[]) => {
  const result = new Map<string, number>();
  chapters.forEach((c) => c.duration != null && result.set(c.id, c.duration));

  const missing = chapters.filter((c) => c.duration == null && c.muxData?.assetId).slice(0, 25);
  if (!missing.length) return result;

  await Promise.all(
    missing.map(async (c) => {
      try {
        const asset = await muxVideo.assets.retrieve(c.muxData!.assetId);
        if (asset.status !== "ready" || !asset.duration) return;
        const seconds = Math.round(asset.duration);
        await db.chapter.update({ where: { id: c.id }, data: { duration: seconds } });
        result.set(c.id, seconds);
      } catch (error) {
        console.log("[MUX_DURATION]", c.id, error instanceof Error ? error.message : error);
      }
    })
  );

  return result;
};

// ---------------------------------------------------------------------------
// Captions
// ---------------------------------------------------------------------------

/** Text (caption) tracks on an asset, newest first. Returns [] if Mux is unreachable. */
export const getCaptionTracks = async (assetId: string): Promise<CaptionTrack[]> => {
  try {
    const asset = await muxVideo.assets.retrieve(assetId);
    return (asset.tracks ?? [])
      .filter((t) => t.type === "text" && t.status !== "deleted")
      .map((t) => ({
        id: t.id!,
        name: t.name ?? languageLabel(t.language_code),
        languageCode: t.language_code ?? "",
        status: t.status ?? "preparing",
        source: t.text_source?.startsWith("generated") ? "generated" : "uploaded",
      }));
  } catch (error) {
    console.log("[MUX_CAPTION_TRACKS]", error instanceof Error ? error.message : error);
    return [];
  }
};

/** Ask Mux to auto-generate captions from the video's audio track. */
export const generateCaptions = async (assetId: string, language: CaptionLanguage) => {
  const asset = await muxVideo.assets.retrieve(assetId);
  const audio = asset.tracks?.find((t) => t.type === "audio" && t.status !== "deleted");
  if (!audio?.id) throw new Error("This video has no audio track to caption.");
  return muxVideo.assets.generateSubtitles(assetId, audio.id, {
    generated_subtitles: [{ language_code: language, name: `${languageLabel(language)} (auto-generated)` }],
  });
};

/** Attach an uploaded .vtt / .srt caption file. */
export const addCaptionFile = (assetId: string, url: string, language: string, name: string) =>
  muxVideo.assets.createTrack(assetId, {
    url,
    type: "text",
    text_type: "subtitles",
    language_code: language,
    name,
    closed_captions: false,
  });

export const deleteCaptionTrack = (assetId: string, trackId: string) =>
  muxVideo.assets.deleteTrack(assetId, trackId);
