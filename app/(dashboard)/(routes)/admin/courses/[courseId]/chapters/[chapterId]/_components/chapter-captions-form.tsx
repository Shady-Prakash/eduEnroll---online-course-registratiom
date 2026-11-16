"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle2, Clock, FileUp, Loader2, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { CAPTION_LANGUAGES, CaptionTrack, languageLabel } from "@/lib/captions";
import { cn } from "@/lib/utils";
import { fieldClass } from "../../../../../_components/form-bits";
import { errorMessage } from "../../../../../_components/use-save";

interface ChapterCaptionsFormProps {
  courseId: string;
  chapterId: string;
  hasProcessedVideo: boolean;
  initialTracks: CaptionTrack[];
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-x-1 text-xs font-medium text-success-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Ready
      </span>
    );
  if (status === "errored")
    return (
      <span className="inline-flex items-center gap-x-1 text-xs font-medium text-danger-600">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-x-1 text-xs font-medium text-warning-700">
      <Clock className="h-3.5 w-3.5 animate-pulse" aria-hidden /> Generating…
    </span>
  );
};

/** Manage caption tracks: auto-generate (speech recognition) or upload .vtt/.srt. */
export const ChapterCaptionsForm = ({ courseId, chapterId, hasProcessedVideo, initialTracks }: ChapterCaptionsFormProps) => {
  const base = `/api/courses/${courseId}/chapters/${chapterId}/captions`;
  const [tracks, setTracks] = useState(initialTracks);
  const [language, setLanguage] = useState("en");
  const [mode, setMode] = useState<"idle" | "upload">("idle");
  const [busy, setBusy] = useState<string | null>(null);

  const taken = new Set(tracks.map((t) => t.languageCode));
  const preparing = tracks.some((t) => t.status === "preparing");

  // Poll while Mux is generating/processing captions.
  useEffect(() => {
    if (!preparing) return;
    const t = setInterval(async () => {
      try {
        const { data } = await axios.get<CaptionTrack[]>(base);
        setTracks(data);
      } catch { /* keep polling */ }
    }, 5000);
    return () => clearInterval(t);
  }, [preparing, base]);

  const request = async (key: string, fn: () => Promise<{ data: CaptionTrack[] }>, success: string) => {
    try {
      setBusy(key);
      const { data } = await fn();
      setTracks(data);
      toast.success(success);
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    } finally {
      setBusy(null);
    }
  };

  if (!hasProcessedVideo) {
    return (
      <p className="rounded-lg border border-dashed border-ink-200 p-4 text-sm text-ink-500">
        Captions become available once the lesson video has finished processing.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tracks.length > 0 ? (
        <ul className="divide-y divide-ink-100 rounded-lg border border-ink-200">
          {tracks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-md bg-ink-900 text-2xs font-bold uppercase tracking-wide text-white">
                {t.languageCode || "cc"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{t.name}</p>
                <div className="flex flex-wrap items-center gap-x-2">
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-ink-400">· {t.source === "generated" ? "Auto-generated" : "Uploaded file"}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-ink-400 hover:bg-danger-50 hover:text-danger-600"
                disabled={busy !== null}
                onClick={() => request(t.id, () => axios.delete(`${base}/${t.id}`), `${languageLabel(t.languageCode)} captions removed`)}
                aria-label={`Remove ${t.name}`}
              >
                {busy === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-500">
          No captions yet. Captions make lectures accessible and easier to follow. Students turn them on with the <strong>CC</strong> button.
        </p>
      )}

      <div className="space-y-3 rounded-lg bg-ink-50 p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-1.5">
            <span className="text-sm font-medium text-ink-700">Spoken language</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={cn(fieldClass, "h-10")}>
              {CAPTION_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} disabled={taken.has(l.code)}>
                  {l.label}{taken.has(l.code) ? " (added)" : ""}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            className="h-10"
            disabled={busy !== null || taken.has(language)}
            onClick={() =>
              request("generate", () => axios.post(base, { mode: "generate", language }), `Generating ${languageLabel(language)} captions. This takes a minute or two.`)
            }
          >
            {busy === "generate" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />}
            Auto-generate
          </Button>
          <Button type="button" variant="outline" className="h-10" disabled={busy !== null || taken.has(language)} onClick={() => setMode(mode === "upload" ? "idle" : "upload")}>
            <FileUp className="mr-1.5 h-4 w-4" aria-hidden /> Upload file
          </Button>
        </div>

        {mode === "upload" && (
          <div className="space-y-2">
            <div className="rounded-lg border-2 border-dashed border-ink-200 bg-white p-2">
              <FileUpload
                endpoint="chapterCaptions"
                onChange={async (url, fileName) => {
                  if (!url) return;
                  const ok = await request(
                    "upload",
                    () => axios.post(base, { mode: "upload", url, fileName, language }),
                    `${languageLabel(language)} captions added`
                  );
                  if (ok) setMode("idle");
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-ink-500">WebVTT (.vtt) or SubRip (.srt), up to 1MB, for {languageLabel(language)}.</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => setMode("idle")}>
                <X className="mr-1 h-4 w-4" aria-hidden /> Cancel
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-ink-500">
          New videos get English captions automatically. Auto-captions are machine-generated: review them for names and technical terms.
        </p>
      </div>
    </div>
  );
};
