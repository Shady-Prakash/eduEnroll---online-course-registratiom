"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import axios from "axios";
import toast from "react-hot-toast";
import { Lock, PlayCircle, RotateCcw, VideoOff } from "lucide-react";

import { CourseVideoPlayer } from "@/components/course-video-player";
import { useConfettiStore } from "@/hooks/use-confetti-store";

const AUTOPLAY_SECONDS = 6;

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  nextChapterTitle?: string;
  /** Next chapter exists but needs enrolment (free-preview viewers). */
  nextLocked?: boolean;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
}

export const VideoPlayer = ({
  playbackId,
  courseId,
  chapterId,
  nextChapterId,
  nextChapterTitle,
  nextLocked = false,
  isLocked,
  completeOnEnd,
  title,
}: VideoPlayerProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [ended, setEnded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  const nextHref = nextChapterId && !nextLocked ? `/courses/${courseId}/chapters/${nextChapterId}` : null;

  // "Up next" countdown, Netflix-style, cancellable.
  useEffect(() => {
    if (countdown === null || !nextHref) return;
    if (countdown <= 0) {
      router.push(nextHref);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, nextHref, router]);

  const onEnd = async () => {
    setEnded(true);
    if (completeOnEnd) {
      try {
        await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, { isCompleted: true });
        toast.success("Chapter completed");
        if (!nextChapterId) confetti.onOpen();
        router.refresh();
      } catch {
        toast.error("Couldn't save your progress. Use “Complete” below to mark it manually.");
      }
    }
    if (nextHref) setCountdown(AUTOPLAY_SECONDS);
  };

  if (isLocked) {
    return (
      <div className="relative flex aspect-video flex-col items-center justify-center gap-y-3 bg-gradient-to-b from-ink-800 to-ink-900 px-4 text-center text-white">
        <div className="rounded-full bg-white/10 p-3">
          <Lock className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="font-medium">This chapter is locked</p>
          <p className="mt-1 text-sm text-ink-300">Enroll in the course to watch every chapter.</p>
        </div>
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-semibold text-ink-900 transition hover:bg-ink-100"
        >
          View course &amp; enroll
        </Link>
      </div>
    );
  }

  if (!playbackId) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-y-2 bg-ink-900 px-4 text-center text-white">
        <VideoOff className="h-7 w-7 text-ink-400" aria-hidden />
        <p className="font-medium">Video coming soon</p>
        <p className="text-sm text-ink-400">The instructor hasn&apos;t finished processing this video yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <CourseVideoPlayer key={replayKey} playbackId={playbackId} title={title} onEnded={onEnd} />

      {ended && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-ink-950/85 px-4 text-center text-white backdrop-blur-sm">
          {nextLocked ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Enjoyed the preview?</p>
              <p className="line-clamp-2 max-w-md text-lg font-semibold sm:text-xl">
                Up next: {nextChapterTitle ?? "the next chapter"}
              </p>
              <p className="text-sm text-ink-300">It&apos;s part of the full course.</p>
              <Link
                href={`/courses/${courseId}`}
                className="inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-semibold text-ink-900 hover:bg-ink-100"
              >
                <Lock className="mr-2 h-4 w-4" aria-hidden /> View course &amp; enroll
              </Link>
            </>
          ) : nextHref ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                Up next{countdown !== null && countdown > 0 ? ` in ${countdown}s` : ""}
              </p>
              <p className="line-clamp-2 max-w-md text-lg font-semibold sm:text-xl">{nextChapterTitle ?? "Next chapter"}</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  href={nextHref}
                  className="inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-semibold text-ink-900 hover:bg-ink-100"
                >
                  <PlayCircle className="mr-2 h-4 w-4" aria-hidden /> Play now
                </Link>
                {countdown !== null && countdown > 0 && (
                  <button
                    type="button"
                    onClick={() => setCountdown(null)}
                    className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-ink-200 ring-1 ring-white/25 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">🎉 You&apos;ve reached the end of the course</p>
              <Link href={`/courses/${courseId}`} className="text-sm font-medium text-brand-300 hover:underline">
                Back to course overview
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => { setEnded(false); setCountdown(null); setReplayKey((k) => k + 1); }}
            className="inline-flex items-center gap-x-1.5 text-xs font-medium text-ink-300 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Replay
          </button>
        </div>
      )}
    </div>
  );
};
