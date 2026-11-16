import Link from "next/link";
import { PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { priceLabel } from "./enroll-panel";

interface MobileEnrollBarProps {
  courseId: string;
  title: string;
  price: number | null;
  /** Regular price, shown struck through while an offer runs. */
  originalPrice?: number;
  isEnrolled: boolean;
  nextChapterId?: string | null;
  /** Show the Pass alternative ("or $19.99/mo") when the viewer doesn't have it. */
  passMonthly?: number;
}

/** Sticky bottom bar on phones: price at a glance, one tap to the plan picker or to continue. */
export const MobileEnrollBar = ({ courseId, title, price, originalPrice, isEnrolled, nextChapterId, passMonthly }: MobileEnrollBarProps) => (
  <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgb(15_23_42/0.06)] backdrop-blur md:hidden">
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-ink-500">{title}</p>
        {isEnrolled ? (
          <p className="text-sm font-semibold text-success-700">You&apos;re enrolled</p>
        ) : (
          <p className="flex items-baseline gap-x-1.5">
            <span className="text-lg font-bold tabular-nums text-ink-900">{priceLabel(price)}</span>
            {originalPrice && <span className="text-xs text-ink-400 line-through tabular-nums">{formatPrice(originalPrice)}</span>}
            {passMonthly && price ? <span className="truncate text-xs text-highlight-700">or {formatPrice(passMonthly)}/mo</span> : null}
          </p>
        )}
      </div>
      {isEnrolled ? (
        nextChapterId && (
          <Button asChild className="shrink-0">
            <Link href={`/courses/${courseId}/chapters/${nextChapterId}`}>
              <PlayCircle className="mr-1.5 h-4 w-4" aria-hidden /> Continue
            </Link>
          </Button>
        )
      ) : (
        <Button asChild className="shrink-0">
          <a href="#plans">Enroll</a>
        </Button>
      )}
    </div>
  </div>
);
