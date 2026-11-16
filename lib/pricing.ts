/** Course price with an optional limited-time offer. */
export type Pricing = {
  /** What the student pays right now (0 = free). */
  current: number;
  /** Regular price (shown struck through while on sale). */
  original: number;
  onSale: boolean;
  discountPct: number;
  endsAt: Date | null;
  isFree: boolean;
};

type PriceFields = { price: number | null; salePrice?: number | null; saleEndsAt?: Date | string | null };

export const getPricing = (course: PriceFields, now = new Date()): Pricing => {
  const original = course.price && course.price > 0 ? course.price : 0;
  const endsAt = course.saleEndsAt ? new Date(course.saleEndsAt) : null;
  const onSale =
    original > 0 &&
    course.salePrice != null &&
    course.salePrice >= 0 &&
    course.salePrice < original &&
    (!endsAt || endsAt > now);

  const current = onSale ? course.salePrice! : original;
  return {
    current,
    original,
    onSale,
    discountPct: onSale ? Math.round((1 - current / original) * 100) : 0,
    endsAt: onSale ? endsAt : null,
    isFree: current <= 0,
  };
};

/** "2 days left" / "5 hours left" / "Ends today" for offer countdowns. */
export const timeLeftLabel = (endsAt: Date | null, now = new Date()) => {
  if (!endsAt) return null;
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "Less than an hour left";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} left`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} left`;
};
