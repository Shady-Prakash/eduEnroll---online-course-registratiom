"use client";

import { useEffect, useState } from "react";
import { Keyboard, Maximize2, Minimize2, Subtitles, X } from "lucide-react";

import { cn } from "@/lib/utils";

const THEATER_KEY = "eduenroll:theater";

const SHORTCUTS: [string, string][] = [
  ["Space / K", "Play or pause"],
  ["← / →", "Back / forward 10s"],
  ["↑ / ↓", "Volume up / down"],
  ["M", "Mute"],
  ["F", "Fullscreen"],
  ["C", "Captions on / off"],
  ["T", "Theater mode"],
  ["?", "Show shortcuts"],
];

/**
 * Frames the lecture video and adds a small toolbar:
 * theater mode (wider, dark stage, remembered) and a keyboard-shortcuts panel.
 * Quality, speed, captions, PiP and casting live in the player's own controls.
 */
export const PlayerStage = ({ children }: { children: React.ReactNode }) => {
  const [theater, setTheater] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    try {
      setTheater(window.localStorage.getItem(THEATER_KEY) === "1");
    } catch { /* ignore */ }
  }, []);

  const toggleTheater = () =>
    setTheater((t) => {
      try { window.localStorage.setItem(THEATER_KEY, t ? "0" : "1"); } catch { /* ignore */ }
      return !t;
    });

  // T = theater, ? = shortcuts (ignored while typing in inputs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "t" || e.key === "T") toggleTheater();
      if (e.key === "?") setShowKeys((s) => !s);
      if (e.key === "Escape") setShowKeys(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={cn("transition-colors", theater ? "bg-ink-950" : "bg-ink-950 md:bg-transparent md:px-6 md:pt-6")}>
      <div
        className={cn(
          "mx-auto transition-[max-width] duration-300",
          theater ? "max-w-[min(100%,calc((100vh-180px)*16/9))]" : "max-w-5xl"
        )}
      >
        <div className={cn("overflow-hidden", !theater && "md:rounded-xl md:shadow-lg md:ring-1 md:ring-ink-900/10")}>
          {children}
        </div>

        {/* Toolbar (desktop/tablet; on phones the native fullscreen covers this) */}
        <div className={cn("hidden items-center justify-end gap-1 py-2 text-xs sm:flex", theater ? "px-3 text-ink-300" : "text-ink-500")}>
          <span className="mr-auto hidden items-center gap-x-1.5 lg:inline-flex">
            <Subtitles className="h-3.5 w-3.5" aria-hidden />
            Captions, quality &amp; speed are in the player&apos;s ⚙ / CC menus
          </span>
          <button
            type="button"
            onClick={() => setShowKeys((s) => !s)}
            aria-expanded={showKeys}
            className={cn("inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 font-medium transition", theater ? "hover:bg-white/10 hover:text-white" : "hover:bg-ink-100 hover:text-ink-900")}
          >
            <Keyboard className="h-3.5 w-3.5" aria-hidden /> Shortcuts
          </button>
          <button
            type="button"
            onClick={toggleTheater}
            aria-pressed={theater}
            title="Theater mode (T)"
            className={cn("hidden items-center gap-x-1.5 rounded-md px-2.5 py-1.5 font-medium transition md:inline-flex", theater ? "hover:bg-white/10 hover:text-white" : "hover:bg-ink-100 hover:text-ink-900")}
          >
            {theater ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />}
            {theater ? "Default view" : "Theater mode"}
          </button>
        </div>

        {showKeys && (
          <div className={cn("relative mb-3 rounded-xl p-4", theater ? "mx-3 bg-white/5 text-ink-200" : "border border-ink-200 bg-white text-ink-700 shadow-sm")}>
            <button type="button" onClick={() => setShowKeys(false)} aria-label="Close shortcuts" className="absolute right-2 top-2 rounded p-1 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
            <p className="mb-3 text-sm font-semibold">Keyboard shortcuts</p>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {SHORTCUTS.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <dd className={theater ? "text-ink-400" : "text-ink-500"}>{label}</dd>
                  <dt>
                    <kbd className={cn("rounded px-1.5 py-0.5 font-mono text-2xs", theater ? "bg-white/10" : "bg-ink-100 text-ink-700")}>{key}</kbd>
                  </dt>
                </div>
              ))}
            </dl>
            <p className={cn("mt-3 text-xs", theater ? "text-ink-500" : "text-ink-400")}>Click the video first so it has keyboard focus.</p>
          </div>
        )}
      </div>
    </div>
  );
};
