import Stripe from "stripe";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

/**
 * Idempotently grant LIFETIME access (one-time purchase). Safe to call from both
 * the webhook and the return page. Upgrades a Pass enrolment to a purchase.
 */
export const grantCourseAccess = (userId: string, courseId: string, amount?: number | null) =>
  db.purchase.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { source: "purchase", ...(amount != null ? { amount } : {}) },
    create: { userId, courseId, source: "purchase", amount: amount ?? null },
  });

/** Enrol through the eduEnroll Pass; never downgrades an existing purchase. */
export const enrollViaSubscription = (userId: string, courseId: string) =>
  db.purchase.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId, source: "subscription" },
  });

/** Reuse or create the Stripe customer for a user. */
export const getOrCreateStripeCustomer = async (userId: string, email: string, name?: string) => {
  const existing = await db.stripeCustomer.findUnique({ where: { userId }, select: { stripeCustomerId: true } });
  if (existing) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({ email, name: name || undefined, metadata: { userId } });
  await db.stripeCustomer.create({ data: { userId, stripeCustomerId: customer.id } });
  return customer.id;
};

/** Mirror a Stripe subscription into our DB (the source of truth for Pass access). */
export const syncSubscription = async (sub: Stripe.Subscription) => {
  const userId = sub.metadata?.userId;
  if (!userId) return null;
  const data = {
    stripeSubscriptionId: sub.id,
    status: sub.status,
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
  return db.subscription.upsert({ where: { userId }, update: data, create: { userId, ...data } });
};

/**
 * Fulfil a Checkout Session (one-time course purchase OR Pass subscription).
 * Called by the webhook and, as a fallback, on the return page so access is
 * instant even if the webhook is delayed.
 */
export const fulfillCheckoutSession = async (
  sessionOrId: string | Stripe.Checkout.Session,
  expectedUserId?: string
): Promise<"fulfilled" | "unpaid" | "invalid"> => {
  const session =
    typeof sessionOrId === "string"
      ? await stripe.checkout.sessions.retrieve(sessionOrId)
      : sessionOrId;

  const userId = session.metadata?.userId;
  if (!userId || (expectedUserId && userId !== expectedUserId)) return "invalid";

  if (session.mode === "subscription") {
    if (!session.subscription) return "unpaid";
    const sub = await stripe.subscriptions.retrieve(
      typeof session.subscription === "string" ? session.subscription : session.subscription.id
    );
    await syncSubscription(sub);
    return "fulfilled";
  }

  const courseId = session.metadata?.courseId;
  if (!courseId) return "invalid";
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return "unpaid";
  }

  await grantCourseAccess(userId, courseId, session.amount_total != null ? session.amount_total / 100 : null);
  return "fulfilled";
};
