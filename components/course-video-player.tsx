"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, X } from "lucide-react";

import { MuxPlayer } from "@/components/mux-player";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/design-tokens";

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const RATE_KEY = "eduenroll:playbackRate";
const VOLUME_KEY = "eduenroll:volume";
const MUTED_KEY = "eduenroll:muted";
const CAPTIONS_KEY = "eduenroll:captions"; // language code, or "off"
const posKey = (id: string) => `eduenroll:pos:${id}`;

// localStorage can throw (private mode, blocked storage): never let that break playback.
const read = (key: string) => {
  try { return window.localStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* ignore */ }
};

export const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

type MediaEl = HTMLVideoElement;

interface CourseVideoPlayerProps {
  playbackId: string;
  title: string;
  autoPlay?: boolean;
  /** Resume from the last position for this video (per browser). */
  rememberPosition?: boolean;
  onEnded?: () => void;
  className?: string;
}

/**
 * Mux player with learning-friendly defaults:
 *  - brand accent colour, 0.5×–2× speeds (the chosen speed is remembered)
 *  - 10s skip back/forward, remaining time, keyboard shortcuts (space, ←/→, f, m, c)
 *  - resumes where you left off, with a one-tap "Start over"
 *  - remembers volume/mute and the caption language you picked (CC button)
 *  - quality picker, picture-in-picture and casting come from Mux Player's own menus
 */
export const CourseVideoPlayer = ({
  playbackId,
  title,
  autoPlay = true,
  rememberPosition = true,
  onEnded,
  className,
}: CourseVideoPlayerProps) => {
  const mediaRef = useRef<MediaEl | null>(null);
  const lastSaved = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [resumedAt, setResumedAt] = useState<number | null>(null);

  // Reset UI state when switching videos (e.g. in the preview modal).
  useEffect(() => {
    setIsReady(false);
    setResumedAt(null);
    lastSaved.current = 0;
  }, [playbackId]);

  // Hide the "resumed" pill after a few seconds.
  useEffect(() => {
    if (resumedAt === null) return;
    const t = setTimeout(() => setResumedAt(null), 6000);
    return () => clearTimeout(t);
  }, [resumedAt]);

  const onLoadedMetadata = (e: Event) => {
    const el = e.target as MediaEl;
    mediaRef.current = el;

    const rate = Number(read(RATE_KEY));
    if (RATES.includes(rate)) el.playbackRate = rate;
    el.addEventListener("ratechange", () => write(RATE_KEY, String(el.playbackRate)));

    // Volume & mute
    const savedVolume = read(VOLUME_KEY);
    if (savedVolume !== null && Number(savedVolume) >= 0 && Number(savedVolume) <= 1) el.volume = Number(savedVolume);
    if (read(MUTED_KEY) === "1") el.muted = true;
    el.addEventListener("volumechange", () => {
      write(VOLUME_KEY, String(el.volume));
      write(MUTED_KEY, el.muted ? "1" : "0");
    });

    // Captions: re-apply the learner's last choice as tracks load, and remember changes.
    const isCaption = (t: TextTrack) => t.kind === "subtitles" || t.kind === "captions";
    const applyCaptions = () => {
      const pref = read(CAPTIONS_KEY);
      if (!pref) return;
      Array.from(el.textTracks ?? []).filter(isCaption).forEach((t) => {
        t.mode = pref !== "off" && t.language === pref ? "showing" : "disabled";
      });
    };
    applyCaptions();
    el.textTracks?.addEventListener("addtrack", applyCaptions);
    el.textTracks?.addEventListener("change", () => {
      const showing = Array.from(el.textTracks ?? []).find((t) => isCaption(t) && t.mode === "showing");
      if (Array.from(el.textTracks ?? []).some(isCaption)) write(CAPTIONS_KEY, showing ? showing.language : "off");
    });

    if (rememberPosition) {
      const saved = Number(read(posKey(playbackId)));
      if (saved > 5 && el.duration && saved < el.duration - 15) {
        el.currentTime = saved;
        setResumedAt(saved);
      }
    }
  };

  const onTimeUpdate = (e: Event) => {
    if (!rememberPosition) return;
    const t = (e.target as MediaEl).currentTime;
    if (Math.abs(t - lastSaved.current) >= 5) {
      lastSaved.current = t;
      write(posKey(playbackId), String(Math.floor(t)));
    }
  };

  const handleEnded = () => {
    write(posKey(playbackId), null);
    onEnded?.();
  };

  const startOver = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0;
      void mediaRef.current.play?.();
    }
    write(posKey(playbackId), null);
    setResumedAt(null);
  };

  return (
    // Fixed 16:9 frame; overflow-hidden keeps the box from growing to a video's size.
    <div className={cn("relative aspect-video w-full overflow-hidden bg-ink-950", className)}>
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-900" aria-hidden>
          <Loader2 className="h-8 w-8 animate-spin text-ink-400" />
        </div>
      )}

      <MuxPlayer
        key={playbackId}
        playbackId={playbackId}
        title={title}
        metadata={{ video_title: title }}
        streamType="on-demand"
        autoPlay={autoPlay}
        accentColor={theme.primary}
        playbackRates={RATES}
        forwardSeekOffset={10}
        backwardSeekOffset={10}
        defaultShowRemainingTime
        thumbnailTime={5}
        onLoadedMetadata={onLoadedMetadata}
        onCanPlay={() => setIsReady(true)}
        onTimeUpdate={onTimeUpdate}
        onEnded={handleEnded}
      />

      {resumedAt !== null && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-x-2 rounded-full bg-ink-950/80 py-1 pl-3 pr-1 text-xs text-white shadow-lg backdrop-blur">
          <span>Resumed at {formatTime(resumedAt)}</span>
          <button
            type="button"
            onClick={startOver}
            className="inline-flex items-center gap-x-1 rounded-full bg-white/15 px-2 py-1 font-medium hover:bg-white/25"
          >
            <RotateCcw className="h-3 w-3" aria-hidden /> Start over
          </button>
          <button type="button" onClick={() => setResumedAt(null)} aria-label="Dismiss" className="rounded-full p-1 hover:bg-white/15">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
