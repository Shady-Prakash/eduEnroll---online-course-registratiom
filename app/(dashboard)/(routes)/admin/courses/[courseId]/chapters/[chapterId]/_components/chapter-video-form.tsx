"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, RefreshCw, UploadCloud, X } from "lucide-react";
import { Chapter, MuxData } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { MuxPlayer } from "@/components/mux-player";
import { FileUpload } from "@/components/file-upload";
import { useSave } from "../../../../../_components/use-save";

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}

/** Upload / replace the chapter video, with a clear processing status. */
export const ChapterVideoForm = ({ initialData, courseId, chapterId }: ChapterVideoFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!initialData.videoUrl);
  const { save } = useSave(`/api/courses/${courseId}/chapters/${chapterId}`);

  const playbackId = initialData.muxData?.playbackId;
  const status: "none" | "processing" | "ready" = !initialData.videoUrl ? "none" : playbackId ? "ready" : "processing";

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/60 p-2">
          <FileUpload
            endpoint="chapterVideo"
            onChange={async (url) => {
              if (url && (await save({ videoUrl: url }, "Video uploaded. Processing has started."))) {
                setIsEditing(false);
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-x-1.5 text-xs text-ink-500">
            <UploadCloud className="h-3.5 w-3.5" aria-hidden />
            MP4 or MOV. Videos are streamed adaptively to students via Mux.
          </p>
          {initialData.videoUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <X className="mr-1 h-4 w-4" aria-hidden /> Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-ink-950">
        {status === "ready" ? (
          <MuxPlayer playbackId={playbackId!} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-y-2 px-4 text-center text-white">
            <Clock className="h-7 w-7 animate-pulse text-brand-300" aria-hidden />
            <p className="font-medium">Processing video…</p>
            <p className="text-sm text-ink-400">This usually takes a minute or two.</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-x-1.5 text-xs">
          {status === "ready" ? (
            <span className="inline-flex items-center gap-x-1 text-success-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Ready to stream
            </span>
          ) : (
            <span className="text-warning-700">Still processing. Publishing will also retry processing.</span>
          )}
        </p>
        <div className="flex gap-2">
          {status === "processing" && (
            <Button type="button" variant="ghost" size="sm" onClick={() => router.refresh()}>
              <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden /> Check again
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <UploadCloud className="mr-1.5 h-4 w-4" aria-hidden /> Replace video
          </Button>
        </div>
      </div>
    </div>
  );
};
