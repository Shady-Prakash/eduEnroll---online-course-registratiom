import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Small presentational pieces shared by the desktop table and the mobile cards. */

export const CourseThumbnail = ({ src, className }: { src: string | null; className?: string }) => (
  <div
    className={cn(
      "relative aspect-video shrink-0 overflow-hidden rounded-md bg-ink-100",
      className
    )}
  >
    {src ? (
      <Image src={src} alt="" fill sizes="96px" className="object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <ImageIcon className="h-4 w-4 text-ink-400" aria-hidden />
      </div>
    )}
  </div>
);

export const StatusBadge = ({ published }: { published: boolean }) => (
  <span
    className={cn(
      "inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
      published ? "bg-success-50 text-success-700 ring-1 ring-success-600/20" : "bg-ink-100 text-ink-600 ring-1 ring-ink-500/20"
    )}
  >
    <span
      aria-hidden
      className={cn("h-1.5 w-1.5 rounded-full", published ? "bg-success-500" : "bg-ink-400")}
    />
    {published ? "Published" : "Draft"}
  </span>
);

export const ChapterProgress = ({ published, total }: { published: number; total: number }) => {
  const pct = total ? (published / total) * 100 : 0;
  return (
    <div className="flex items-center gap-x-2" title={`${published} of ${total} chapters published`}>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-ink-600">
        {published}/{total}
      </span>
    </div>
  );
};

export const formatUpdated = (date: Date) => {
  const diff = Date.now() - new Date(date).getTime();
  const day = 86_400_000;
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
