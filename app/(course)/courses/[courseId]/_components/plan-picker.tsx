"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Check, Clock, Crown, Infinity as InfinityIcon, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Pricing } from "@/lib/pricing";

type Plan = "buy" | "pass";

interface PlanPickerProps {
  courseId: string;
  pricing: Pricing;
  pass: { name: string; monthlyPrice: number; trialDays: number };
  publishedCount: number;
  hasActivePass: boolean;
  passExpired: boolean;
}

const errorText = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) && typeof error.response?.data === "string" && error.response.data ? error.response.data : fallback;

/** Live offer countdown: "2 days left", or HH:MM:SS in the final 24 hours. */
const useCountdown = (endsAt: Date | string | null) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} left at this price`;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `Ends in ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const PlanCard = ({
  value,
  selected,
  onSelect,
  children,
}: {
  value: Plan;
  selected: Plan;
  onSelect: (plan: Plan) => void;
  children: React.ReactNode;
}) => {
  const active = selected === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(value)}
      className={cn(
        "relative w-full rounded-xl border-2 p-3.5 text-left transition",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20",
        active ? (value === "pass" ? "border-highlight-600 bg-highlight-50/50" : "border-brand-600 bg-brand-50/50") : "border-ink-200 hover:border-ink-300"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2",
          active ? (value === "pass" ? "border-highlight-600 bg-highlight-600" : "border-brand-600 bg-brand-600") : "border-ink-300"
        )}
      >
        {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
};

/**
 * Two ways in, side by side (a plan picker rather than stacked buttons):
 *  ● Own this course: one-time price, offer + countdown, lifetime access
 *  ● eduEnroll Pass: monthly, every course, free trial, cancel anytime
 * One primary button follows the selected plan.
 */
export const PlanPicker = ({ courseId, pricing, pass, publishedCount, hasActivePass, passExpired }: PlanPickerProps) => {
  const [plan, setPlan] = useState<Plan>(pricing.onSale || pricing.isFree ? "buy" : "pass");
  const [loading, setLoading] = useState<string | null>(null);
  const countdown = useCountdown(pricing.endsAt);

  const go = async (key: string, fn: () => Promise<{ data: { url: string } }>, fallback: string) => {
    try {
      setLoading(key);
      const { data } = await fn();
      window.location.assign(data.url); // keep the spinner while navigating away
    } catch (error) {
      toast.error(errorText(error, fallback));
      setLoading(null);
    }
  };

  const buy = () => go("buy", () => axios.post(`/api/courses/${courseId}/checkout`, {}), "We couldn't start checkout. Please try again.");
  const subscribe = () => go("pass", () => axios.post("/api/subscription/checkout", { courseId }), "We couldn't start your subscription.");
  const enrollWithPass = () => go("enroll", () => axios.post(`/api/courses/${courseId}/enroll`), "Couldn't enrol you. Please try again.");

  // Free courses: no plan choice needed.
  if (pricing.isFree) {
    return (
      <div className="space-y-3">
        <p className="text-3xl font-bold text-success-700">Free</p>
        <Button size="lg" className="w-full" onClick={buy} disabled={!!loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Enroll for free
        </Button>
        <p className="text-center text-xs text-ink-500">No card needed. Lifetime access.</p>
      </div>
    );
  }

  // Active Pass: this course is included.
  if (hasActivePass) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-x-2 rounded-lg bg-gradient-to-r from-highlight-600 to-iris-600 px-3 py-2 text-sm font-semibold text-white">
          <Crown className="h-4 w-4" aria-hidden /> Included in your {pass.name}
        </div>
        <Button size="lg" className="w-full" onClick={enrollWithPass} disabled={!!loading}>
          {loading === "enroll" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Start learning
        </Button>
        <button type="button" onClick={buy} disabled={!!loading} className="w-full text-center text-xs font-medium text-ink-500 hover:text-ink-900 hover:underline">
          Prefer to own it forever? Buy for {formatPrice(pricing.current)}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3" id="plans">
      {passExpired && (
        <p className="rounded-lg bg-warning-50 px-3 py-2 text-xs text-warning-800">
          Your {pass.name} has ended. Resubscribe to continue, or buy this course to keep it forever.
        </p>
      )}

      <div role="radiogroup" aria-label="Choose how to get this course" className="space-y-2.5">
        {/* One-time purchase */}
        <PlanCard value="buy" selected={plan} onSelect={setPlan}>
          <p className="pr-8 text-xs font-semibold uppercase tracking-wide text-ink-500">Own this course</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-2xl font-bold tabular-nums text-ink-900">{formatPrice(pricing.current)}</span>
            {pricing.onSale && (
              <>
                <span className="text-sm text-ink-400 line-through tabular-nums">{formatPrice(pricing.original)}</span>
                <span className="rounded bg-danger-100 px-1.5 py-0.5 text-xs font-bold text-danger-700">{pricing.discountPct}% OFF</span>
              </>
            )}
          </div>
          {pricing.onSale && countdown && (
            <p className="mt-1 flex items-center gap-x-1 text-xs font-semibold text-danger-600" aria-live="off">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {/* Time-based text differs between server render and hydration by design */}
              <span suppressHydrationWarning>{countdown}</span>
            </p>
          )}
          <p className="mt-1.5 flex items-center gap-x-1.5 text-xs text-ink-600">
            <InfinityIcon className="h-3.5 w-3.5" aria-hidden /> One-time payment · lifetime access
          </p>
        </PlanCard>

        {/* Subscription */}
        <PlanCard value="pass" selected={plan} onSelect={setPlan}>
          <p className="flex items-center gap-x-1.5 pr-8 text-xs font-semibold uppercase tracking-wide text-highlight-700">
            <Crown className="h-3.5 w-3.5" aria-hidden /> {pass.name}
            <span className="rounded-full bg-highlight-600 px-1.5 py-px text-3xs normal-case tracking-normal text-white">Best value</span>
          </p>
          <div className="mt-1 flex items-baseline gap-x-1">
            <span className="text-2xl font-bold tabular-nums text-ink-900">{formatPrice(pass.monthlyPrice)}</span>
            <span className="text-sm text-ink-500">/month</span>
          </div>
          <p className="mt-1.5 text-xs text-ink-600">
            This course <strong>+ all {publishedCount} courses</strong>
            {pass.trialDays > 0 && <> · <span className="font-semibold text-highlight-700">{pass.trialDays}-day free trial</span></>} · cancel anytime
          </p>
        </PlanCard>
      </div>

      {plan === "buy" ? (
        <Button size="lg" className="w-full" onClick={buy} disabled={!!loading}>
          {loading === "buy" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
          {loading === "buy" ? "Redirecting to checkout…" : `Buy now for ${formatPrice(pricing.current)}`}
        </Button>
      ) : (
        <Button size="lg" className="w-full bg-highlight-600 hover:bg-highlight-700" onClick={subscribe} disabled={!!loading}>
          {loading === "pass" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
          {loading === "pass" ? "Redirecting…" : pass.trialDays > 0 ? `Start ${pass.trialDays}-day free trial` : `Subscribe for ${formatPrice(pass.monthlyPrice)}/mo`}
        </Button>
      )}

      <p className="flex items-center justify-center gap-x-1 text-center text-xs text-ink-500">
        <ShieldCheck className="h-3.5 w-3.5 text-success-600" aria-hidden />
        {plan === "buy"
          ? "Secure checkout with Stripe"
          : pass.trialDays > 0
            ? `Free for ${pass.trialDays} days, then ${formatPrice(pass.monthlyPrice)}/month`
            : "Billed monthly. Cancel anytime"}
      </p>
    </div>
  );
};
