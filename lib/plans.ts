/**
 * eduEnroll Pass: monthly subscription that unlocks every published course
 * (like Udemy Personal Plan). Configure via env, sensible defaults otherwise.
 */
const num = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const PASS = {
  name: "eduEnroll Pass",
  monthlyPrice: num(process.env.NEXT_PUBLIC_PASS_MONTHLY_PRICE, 19.99),
  trialDays: Math.floor(num(process.env.NEXT_PUBLIC_PASS_TRIAL_DAYS, 7)),
  perks: [
    "Every published course, unlimited",
    "New courses as soon as they launch",
    "Progress tracking & resources",
    "Cancel anytime",
  ],
} as const;

/** Subscription statuses that grant access. */
export const ACTIVE_STATUSES = ["active", "trialing"] as const;
