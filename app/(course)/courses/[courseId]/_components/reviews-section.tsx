"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, MessageSquarePlus, Pencil, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui/typography";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  updatedAt: Date;
  author: string;
  authorImage: string | null;
  isMine: boolean;
};

interface ReviewsSectionProps {
  courseId: string;
  ratings: { average: number; count: number; breakdown: { star: number; count: number; pct: number }[] };
  reviews: Review[];
  myReview: { rating: number; comment: string | null } | null;
  canReview: boolean;
}

const LABELS = ["", "Awful, not what I expected", "Poor, pretty disappointed", "Average, could be better", "Good, what I expected", "Amazing, above expectations!"];

const timeAgo = (date: Date) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
  return `${Math.floor(days / 365)} year${days < 730 ? "" : "s"} ago`;
};

/** Udemy-style student feedback: summary, star breakdown (filter), reviews, write/edit. */
export const ReviewsSection = ({ courseId, ratings, reviews, myReview, canReview }: ReviewsSectionProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<number | null>(null);

  const visible = filter ? reviews.filter((r) => r.rating === filter) : reviews;
  const shown = hover || rating;

  const submit = async () => {
    try {
      setSaving(true);
      await axios.post(`/api/courses/${courseId}/reviews`, { rating, comment });
      toast.success(myReview ? "Review updated" : "Thanks for your review!");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(axios.isAxiosError(error) && typeof error.response?.data === "string" ? error.response.data : "Couldn't save your review.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      setSaving(true);
      await axios.delete(`/api/courses/${courseId}/reviews`);
      toast.success("Review deleted");
      setOpen(false);
      setRating(0);
      setComment("");
      router.refresh();
    } catch {
      toast.error("Couldn't delete your review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Heading as="h2" id="reviews-heading" size="section">
          {ratings.count > 0 ? (
            <span className="inline-flex items-center gap-x-2">
              <Star className="h-5 w-5 fill-warning-400 text-warning-400" aria-hidden />
              {ratings.average.toFixed(1)} course rating · {ratings.count} rating{ratings.count === 1 ? "" : "s"}
            </span>
          ) : (
            "Student feedback"
          )}
        </Heading>
        {canReview && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            {myReview ? <Pencil className="mr-1.5 h-4 w-4" aria-hidden /> : <MessageSquarePlus className="mr-1.5 h-4 w-4" aria-hidden />}
            {myReview ? "Edit your review" : "Leave a review"}
          </Button>
        )}
      </div>

      {ratings.count === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-300 bg-white p-6 text-center text-sm text-ink-500">
          No reviews yet. {canReview ? "Be the first to share what you think!" : "Enrolled students can rate this course."}
        </p>
      ) : (
        <div className="grid gap-6 rounded-xl border border-ink-200 bg-white p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-8">
          <div className="text-center">
            <p className="text-5xl font-bold tabular-nums text-warning-600">{ratings.average.toFixed(1)}</p>
            <Stars rating={ratings.average} size="md" className="mt-1" />
            <p className="mt-1 text-xs font-medium text-warning-700">Course rating</p>
          </div>
          <ul className="space-y-1.5">
            {ratings.breakdown.map((b) => (
              <li key={b.star}>
                <button
                  type="button"
                  onClick={() => setFilter(filter === b.star ? null : b.star)}
                  disabled={b.count === 0}
                  aria-pressed={filter === b.star}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-1.5 py-1 text-left text-sm transition disabled:opacity-40",
                    filter === b.star ? "bg-warning-50" : "hover:bg-ink-50"
                  )}
                >
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-200">
                    <span className="block h-full rounded-full bg-ink-500" style={{ width: `${b.pct}%` }} />
                  </span>
                  <Stars rating={b.star} size="xs" />
                  <span className="w-10 text-right text-xs tabular-nums text-brand-700 underline-offset-2">{b.pct}%</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {filter && (
        <p className="text-sm text-ink-600">
          Showing {filter}-star reviews ·{" "}
          <button type="button" onClick={() => setFilter(null)} className="font-medium text-brand-700 hover:underline">Show all</button>
        </p>
      )}

      {visible.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((r) => (
            <li key={r.id} className={cn("rounded-xl border bg-white p-4", r.isMine ? "border-brand-200 ring-1 ring-brand-100" : "border-ink-200")}>
              <div className="flex items-center gap-x-3">
                {r.authorImage ? (
                  <Image src={r.authorImage} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-800 text-sm font-semibold text-white">
                    {r.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {r.author} {r.isMine && <span className="font-normal text-brand-700">(you)</span>}
                  </p>
                  <p className="flex items-center gap-x-2 text-xs text-ink-500">
                    <Stars rating={r.rating} size="xs" /> <span suppressHydrationWarning>{timeAgo(r.updatedAt)}</span>
                  </p>
                </div>
              </div>
              {r.comment && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      {/* Write / edit review */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>{myReview ? "Edit your review" : "How would you rate this course?"}</DialogTitle>
            <DialogDescription>Your review helps other KOI students choose the right course.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={rating === i}
                  aria-label={`${i} star${i === 1 ? "" : "s"}`}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className="rounded p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-400"
                >
                  <Star className={cn("h-9 w-9", i <= shown ? "fill-warning-400 text-warning-400" : "text-ink-300")} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <p className="h-5 text-sm font-medium text-ink-700">{shown ? LABELS[shown] : "Select a rating"}</p>
          </div>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-ink-700">Tell us more <span className="font-normal text-ink-400">(optional)</span></span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="What did you like? What could be better?"
              className="w-full rounded-lg border border-ink-200 p-3 text-sm shadow-sm focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
            />
            <span className="block text-right text-xs tabular-nums text-ink-400">{comment.length}/2000</span>
          </label>

          <DialogFooter className="gap-2 sm:justify-between sm:gap-0">
            {myReview ? (
              <Button type="button" variant="ghost" onClick={remove} disabled={saving} className="text-danger-600 hover:bg-danger-50 hover:text-danger-700">
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            ) : <span />}
            <Button type="button" onClick={submit} disabled={!rating || saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {myReview ? "Save changes" : "Submit review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
