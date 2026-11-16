"use client";

import { useState } from "react";
import Image from "next/image";
import { Keyboard, PlayCircle } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CourseVideoPlayer } from "@/components/course-video-player";
import { cn } from "@/lib/utils";
import { CourseEnrollButton } from "./course-enroll-button";
import { priceLabel } from "./enroll-panel";

type PreviewVideo = { id: string; title: string; playbackId: string };

interface PreviewModalProps {
  courseId: string;
  courseTitle: string;
  price: number | null;
  isEnrolled: boolean;
  previews: PreviewVideo[];
  /** Which preview to start with (defaults to the first). */
  initialId?: string;
  /** Open immediately on mount (e.g. after being redirected from a chapter URL). */
  defaultOpen?: boolean;
  children: React.ReactNode; // trigger
}

const SHORTCUTS = [
  ["Space / K", "Play / pause"],
  ["← / →", "Back / forward 10s"],
  ["F", "Fullscreen"],
  ["M", "Mute"],
];

/** Udemy-style "Preview this course": free chapters in a modal with a playlist. */
export const PreviewModal = ({ courseId, courseTitle, price, isEnrolled, previews, initialId, defaultOpen = false, children }: PreviewModalProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState(initialId ?? previews[0]?.id);
  const [showKeys, setShowKeys] = useState(false);

  const active = previews.find((p) => p.id === activeId) ?? previews[0];
  if (!active) return <>{children}</>;

  const activeIndex = previews.findIndex((p) => p.id === active.id);
  const next = previews[activeIndex + 1];

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setActiveId(initialId ?? previews[0]?.id);
        else setShowKeys(false);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        // Focus the dialog itself (not the first button) so no stray focus ring appears on open.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
        tabIndex={-1}
        className={cn(
          "w-[calc(100%-1rem)] max-w-3xl gap-0 overflow-hidden outline-none rounded-xl border-ink-800 bg-ink-950 p-0 text-white",
          "max-h-[92vh] overflow-y-auto",
          "[&>button]:right-3 [&>button]:top-3 [&>button]:z-40 [&>button]:rounded-full [&>button]:bg-ink-900/80 [&>button]:p-1.5 [&>button]:text-white [&>button]:opacity-100"
        )}
      >
        <div className="px-4 pb-3 pr-12 pt-4 sm:px-5">
          <DialogDescription className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Course preview
          </DialogDescription>
          <DialogTitle className="mt-0.5 line-clamp-1 text-base font-semibold text-white sm:text-lg">
            {courseTitle}
          </DialogTitle>
        </div>

        {/* Mount the player only while open, so closing stops playback. */}
        {open && (
          <CourseVideoPlayer
            playbackId={active.playbackId}
            title={active.title}
            onEnded={() => next && setActiveId(next.id)}
          />
        )}

        <div className="flex items-center justify-between gap-2 px-4 pt-3 text-xs text-ink-400 sm:px-5">
          <p className="min-w-0 truncate">
            Now playing: <span className="font-medium text-ink-200">{active.title}</span>
          </p>
          <button
            type="button"
            onClick={() => setShowKeys((s) => !s)}
            aria-expanded={showKeys}
            className="hidden shrink-0 items-center gap-x-1 rounded-md px-2 py-1 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <Keyboard className="h-3.5 w-3.5" aria-hidden /> Shortcuts
          </button>
        </div>

        {showKeys && (
          <dl className="mx-4 mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-lg bg-white/5 p-3 text-xs sm:mx-5">
            {SHORTCUTS.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <dt><kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-2xs text-ink-100">{key}</kbd></dt>
                <dd className="text-ink-400">{label}</dd>
              </div>
            ))}
          </dl>
        )}

        {previews.length > 1 && (
          <div className="px-4 pt-4 sm:px-5">
            <p className="text-sm font-semibold text-white">Free sample videos</p>
            <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
              {previews.map((p) => {
                const isActive = p.id === active.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(p.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-x-3 rounded-lg p-2 text-left transition",
                        isActive ? "bg-white/10" : "hover:bg-white/5"
                      )}
                    >
                      <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-ink-800">
                        <Image
                          src={`https://image.mux.com/${p.playbackId}/thumbnail.webp?width=240&time=5`}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          {isActive ? (
                            <span className="flex h-3 items-end gap-[2px]" aria-hidden>
                              <span className="w-[3px] animate-pulse bg-white" style={{ height: "60%" }} />
                              <span className="w-[3px] animate-pulse bg-white [animation-delay:150ms]" style={{ height: "100%" }} />
                              <span className="w-[3px] animate-pulse bg-white [animation-delay:300ms]" style={{ height: "40%" }} />
                            </span>
                          ) : (
                            <PlayCircle className="h-5 w-5 text-white" aria-hidden />
                          )}
                        </span>
                      </span>
                      <span className={cn("line-clamp-2 text-sm", isActive ? "font-semibold text-white" : "text-ink-300")}>
                        {p.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Conversion moment: enroll right from the preview */}
        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 bg-ink-900/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          {isEnrolled ? (
            <p className="text-sm text-ink-300">You&apos;re enrolled. Close this to continue learning.</p>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-white">Enjoying the preview?</p>
                <p className="text-xs text-ink-400">Get every chapter for {priceLabel(price)}.</p>
              </div>
              <CourseEnrollButton courseId={courseId} price={price} className="w-full bg-white text-ink-900 hover:bg-ink-100 sm:w-auto" />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
