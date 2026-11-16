"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { Crown, Loader2, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface PassCardProps {
  name: string;
  monthlyPrice: number;
  trialDays: number;
  subscription: { status: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean } | null;
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** eduEnroll Pass status (with billing portal) or a gentle upsell. */
export const PassCard = ({ name, monthlyPrice, trialDays, subscription }: PassCardProps) => {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/subscription/portal");
      window.location.assign(data.url);
    } catch (error) {
      toast.error(axios.isAxiosError(error) && typeof error.response?.data === "string" ? error.response.data : "Couldn't open billing.");
      setLoading(false);
    }
  };

  if (subscription) {
    const trial = subscription.status === "trialing";
    const ending = subscription.cancelAtPeriodEnd;
    return (
      <section className="flex flex-col gap-4 overflow-hidden rounded-xl bg-gradient-to-r from-highlight-600 via-iris-600 to-brand-600 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-x-3">
          <span className="rounded-lg bg-white/15 p-2 ring-1 ring-white/20"><Crown className="h-5 w-5" aria-hidden /></span>
          <div>
            <p className="font-semibold">
              {name} {trial ? "· free trial" : "· active"}
            </p>
            <p className="text-sm text-white/80">
              {ending
                ? `Access ends ${fmt(subscription.currentPeriodEnd)}. Resubscribe anytime from billing.`
                : trial
                  ? `Trial ends ${fmt(subscription.currentPeriodEnd)}, then ${formatPrice(monthlyPrice)}/month.`
                  : `Renews ${fmt(subscription.currentPeriodEnd)} · every course unlocked.`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm" className="bg-white text-ink-900 hover:bg-white/90">
            <Link href="/search">Browse courses</Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={openPortal} disabled={loading} className="text-white hover:bg-white/15 hover:text-white">
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Settings className="mr-1.5 h-4 w-4" aria-hidden />}
            Manage
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-highlight-200 bg-highlight-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-x-3">
        <span className="rounded-lg bg-highlight-600 p-2 text-white"><Crown className="h-5 w-5" aria-hidden /></span>
        <div>
          <p className="font-semibold text-ink-900">Learn without limits with {name}</p>
          <p className="text-sm text-ink-600">
            Every course for {formatPrice(monthlyPrice)}/month{trialDays > 0 && <>, {trialDays}-day free trial</>}. Cancel anytime.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="bg-highlight-600 hover:bg-highlight-700">
        <Link href="/search">Explore courses</Link>
      </Button>
    </section>
  );
};
