import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarsProps {
  rating: number; // 0–5, fractions allowed
  size?: "xs" | "sm" | "md";
  className?: string;
}

const sizes = { xs: "h-3 w-3", sm: "h-3.5 w-3.5", md: "h-5 w-5" };

/** Read-only star rating with partial fills (e.g. 4.6). */
export const Stars = ({ rating, size = "sm", className }: StarsProps) => (
  <span className={cn("inline-flex items-center gap-px", className)} role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => {
      const fill = Math.max(0, Math.min(1, rating - (i - 1)));
      return (
        <span key={i} className="relative inline-block">
          <Star className={cn(sizes[size], "text-warning-300/50")} strokeWidth={1.5} aria-hidden />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star className={cn(sizes[size], "fill-warning-400 text-warning-400")} strokeWidth={1.5} aria-hidden />
          </span>
        </span>
      );
    })}
  </span>
);

/** "4.6 ★★★★★ (23)" compact rating line used on cards and the hero. */
export const RatingLine = ({
  average,
  count,
  size = "sm",
  className,
  showCountLabel = false,
}: {
  average: number;
  count: number;
  size?: "xs" | "sm" | "md";
  className?: string;
  showCountLabel?: boolean;
}) =>
  count > 0 ? (
    <span className={cn("inline-flex items-center gap-x-1.5", className)}>
      <span className="font-bold tabular-nums text-warning-600">{average.toFixed(1)}</span>
      <Stars rating={average} size={size} />
      <span className="tabular-nums opacity-80">
        ({count.toLocaleString("en-US")}{showCountLabel ? ` rating${count === 1 ? "" : "s"}` : ""})
      </span>
    </span>
  ) : (
    <span className={cn("text-xs opacity-70", className)}>No ratings yet</span>
  );
