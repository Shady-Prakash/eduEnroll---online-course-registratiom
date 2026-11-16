import Image from "next/image";
import Link from "next/link";
import { BarChart3, BookOpen, CheckCircle2, ImageIcon } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { levelLabel } from "@/lib/validations/course";
import { RatingLine } from "@/components/ui/stars";
import { Heading } from "@/components/ui/typography";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string | null;
  chaptersLength: number;
  price: number | null;
  /** null = not enrolled (show price); 0–100 = enrolled (show progress). */
  progress: number | null;
  category: string | null;
  code?: string | null;
  level?: string | null;
  /** Optional rating line (★ average + count). */
  rating?: number;
  ratingCount?: number;
  /** Regular price, shown struck through when an offer is active. */
  originalPrice?: number | null;
};

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  code,
  level,
  rating = 0,
  ratingCount = 0,
  originalPrice,
}: CourseCardProps) => {
  const enrolled = progress !== null;
  const done = progress === 100;
  const pct = Math.round(progress ?? 0);

  return (
    <Link
      href={`/courses/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
    >
      <div className="relative aspect-video w-full bg-ink-100">
        {imageUrl ? (
          <Image
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            alt=""
            src={imageUrl}
            sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-ink-300" aria-hidden />
          </div>
        )}
        {done && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-x-1 rounded-full bg-success-600 px-2 py-0.5 text-xs font-medium text-white shadow">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Completed
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center gap-x-2">
          {code && (
            <span className="shrink-0 rounded bg-ink-900 px-1.5 py-0.5 text-3xs font-semibold tracking-wide text-white">
              {code}
            </span>
          )}
          {category && (
            <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-500">{category}</p>
          )}
        </div>
        <Heading as="h3" size="sub" className="mt-1 line-clamp-2 transition-colors group-hover:text-brand-700">
          {title}
        </Heading>
        {ratingCount > 0 && (
          <RatingLine average={rating} count={ratingCount} size="xs" className="mt-1 text-xs text-ink-500" />
        )}
        <p className="mt-2 flex items-center gap-x-1.5 text-xs text-ink-500">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          {chaptersLength} {chaptersLength === 1 ? "chapter" : "chapters"}
          {levelLabel(level) && <span className="text-ink-300">·</span>}
          {levelLabel(level) && <BarChart3 className="h-3.5 w-3.5" aria-hidden />}
          {levelLabel(level)}
        </p>

        <div className="mt-auto pt-4">
          {enrolled ? (
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-ink-500">{done ? "Completed" : "Progress"}</span>
                <span className={cn("font-medium tabular-nums", done ? "text-success-700" : "text-brand-700")}>
                  {pct}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${title} progress`}
                className="h-1.5 overflow-hidden rounded-full bg-ink-100"
              >
                <div
                  className={cn("h-full rounded-full", done ? "bg-success-500" : "bg-brand-600")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="flex items-baseline gap-x-2">
              <span className="font-semibold text-ink-900">{!price ? "Free" : formatPrice(price)}</span>
              {originalPrice && originalPrice > (price ?? 0) && (
                <span className="text-sm text-ink-400 line-through tabular-nums">{formatPrice(originalPrice)}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
