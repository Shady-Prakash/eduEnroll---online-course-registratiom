"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type ReactQuillType from "react-quill";
import { ImageIcon, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import "react-quill/dist/quill.snow.css";

type QuillInstance = ReturnType<ReactQuillType["getEditor"]>;
type QuillProps = ReactQuillType.ReactQuillProps & { forwardedRef?: React.Ref<ReactQuillType> };

// Quill is large and browser-only: load on demand. The wrapper forwards the ref,
// which next/dynamic doesn't do by itself, so we can reach the Quill instance.
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const Wrapped = ({ forwardedRef, ...props }: QuillProps) => <RQ ref={forwardedRef} {...props} />;
    return Wrapped;
  },
  {
    ssr: false,
    loading: () => (
      <div aria-hidden>
        <div className="h-11 border-b border-ink-200 bg-ink-50" />
        <div className="h-[180px] animate-pulse bg-white" />
      </div>
    ),
  }
);

/** Toolbar presets. "full" for course/chapter descriptions, "basic" for short text. */
const TOOLBARS = {
  full: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block", { script: "sub" }, { script: "super" }],
    ["link", "image", "video"],
    ["clean"],
  ],
  basic: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
} as const;

const FORMATS = [
  "header", "bold", "italic", "underline", "strike", "color", "background",
  "list", "bullet", "indent", "align", "blockquote", "code-block", "script",
  "link", "image", "video",
];

/** Hover/screen-reader labels for toolbar controls (Quill renders icon-only buttons). */
const LABELS: Record<string, string> = {
  ".ql-bold": "Bold (Ctrl/⌘+B)",
  ".ql-italic": "Italic (Ctrl/⌘+I)",
  ".ql-underline": "Underline (Ctrl/⌘+U)",
  ".ql-strike": "Strikethrough",
  '.ql-list[value="ordered"]': "Numbered list",
  '.ql-list[value="bullet"]': "Bulleted list",
  '.ql-indent[value="-1"]': "Decrease indent",
  '.ql-indent[value="+1"]': "Increase indent",
  ".ql-blockquote": "Quote",
  ".ql-code-block": "Code block",
  '.ql-script[value="sub"]': "Subscript",
  '.ql-script[value="super"]': "Superscript",
  ".ql-link": "Insert link",
  ".ql-image": "Insert image from URL",
  ".ql-video": "Embed YouTube or Vimeo video",
  ".ql-clean": "Clear formatting",
  ".ql-header .ql-picker-label": "Text style",
  ".ql-color .ql-picker-label": "Text colour",
  ".ql-background .ql-picker-label": "Highlight colour",
  ".ql-align .ql-picker-label": "Alignment",
};

/** Turn YouTube / Vimeo share links into embeddable player URLs. */
const toEmbedUrl = (raw: string): string | null => {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtube.com") {
    const id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/(\d{6,})/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
};

const isImageUrl = (raw: string) => {
  try {
    return new URL(raw.trim()).protocol === "https:";
  } catch {
    return false;
  }
};

type EmbedKind = "video" | "image";

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
  placeholder?: string;
  toolbar?: keyof typeof TOOLBARS;
  /** Shows a word / character count under the editor. */
  showCount?: boolean;
  className?: string;
}

export const Editor = ({
  onChange,
  value,
  placeholder = "Start writing…",
  toolbar = "full",
  showCount = true,
  className,
}: EditorProps) => {
  const quillRef = useRef<QuillInstance | null>(null);
  const savedRange = useRef<{ index: number; length: number } | null>(null);
  const [embed, setEmbed] = useState<EmbedKind | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedError, setEmbedError] = useState<string | null>(null);

  // Stable across renders: Quill must not be re-initialised when modules change.
  const openEmbed = useRef<(kind: EmbedKind) => void>(() => {});
  openEmbed.current = (kind) => {
    const quill = quillRef.current;
    savedRange.current = quill?.getSelection(true) ?? { index: quill?.getLength() ?? 0, length: 0 };
    setEmbedUrl("");
    setEmbedError(null);
    setEmbed(kind);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: TOOLBARS[toolbar],
        handlers: {
          image: () => openEmbed.current("image"),
          video: () => openEmbed.current("video"),
        },
      },
      clipboard: { matchVisual: false }, // don't add stray blank lines when pasting
      history: { delay: 800, maxStack: 200, userOnly: true },
    }),
    [toolbar]
  );

  const attachRef = useCallback((instance: ReactQuillType | null) => {
    if (!instance) return;
    // Quill finishes setting up after React attaches the ref.
    requestAnimationFrame(() => {
      const quill = instance.getEditor?.();
      if (!quill) return;
      quillRef.current = quill;

      const toolbarEl = (quill.getModule("toolbar") as { container: HTMLElement }).container;
      // React strict mode mounts twice in development, which can leave a stale toolbar behind.
      toolbarEl.parentElement
        ?.querySelectorAll(":scope > .ql-toolbar")
        .forEach((el) => el !== toolbarEl && el.remove());

      Object.entries(LABELS).forEach(([selector, label]) =>
        toolbarEl.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          el.title = label;
          el.setAttribute("aria-label", label);
        })
      );
    });
  }, []);

  const insertEmbed = () => {
    const quill = quillRef.current;
    if (!quill || !embed) return;
    const url = embed === "video" ? toEmbedUrl(embedUrl) : isImageUrl(embedUrl) ? embedUrl.trim() : null;
    if (!url) {
      setEmbedError(
        embed === "video"
          ? "Paste a YouTube or Vimeo link, e.g. https://youtu.be/abc123"
          : "Paste an image link that starts with https://"
      );
      return;
    }
    const index = savedRange.current?.index ?? quill.getLength();
    quill.insertEmbed(index, embed, url, "user");
    quill.setSelection(index + 1, 0, "user");
    setEmbed(null);
  };

  const text = value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.replace(/\s+/g, " ").trim().length;

  return (
    <div className={cn("rich-editor overflow-hidden rounded-lg border border-ink-200 bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15", className)}>
      <ReactQuill
        forwardedRef={attachRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
      />

      {showCount && (
        <div className="flex items-center justify-end gap-x-3 border-t border-ink-100 bg-ink-50/60 px-3 py-1.5 text-2xs text-ink-400 tabular-nums">
          <span>{words} words</span>
          <span>{chars} characters</span>
        </div>
      )}

      <Dialog open={embed !== null} onOpenChange={(open) => !open && setEmbed(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-x-2">
              {embed === "video" ? <Video className="h-5 w-5 text-brand-600" /> : <ImageIcon className="h-5 w-5 text-brand-600" />}
              {embed === "video" ? "Embed a video" : "Insert an image"}
            </DialogTitle>
            <DialogDescription>
              {embed === "video"
                ? "Paste a YouTube or Vimeo link. Students can watch it right inside the description."
                : "Paste a direct link to an image (https://…)."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              insertEmbed();
            }}
            className="space-y-2"
          >
            <input
              autoFocus
              type="url"
              inputMode="url"
              value={embedUrl}
              onChange={(e) => {
                setEmbedUrl(e.target.value);
                setEmbedError(null);
              }}
              placeholder={embed === "video" ? "https://www.youtube.com/watch?v=…" : "https://example.com/diagram.png"}
              aria-invalid={!!embedError}
              className={cn(
                "h-11 w-full rounded-lg border bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-4",
                embedError
                  ? "border-danger-400 focus-visible:ring-danger-500/15"
                  : "border-ink-200 focus-visible:border-brand-500 focus-visible:ring-brand-500/15"
              )}
            />
            {embedError && <p className="text-xs font-medium text-danger-600" role="alert">{embedError}</p>}
            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setEmbed(null)}>Cancel</Button>
              <Button type="submit" disabled={!embedUrl.trim()}>Insert</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
