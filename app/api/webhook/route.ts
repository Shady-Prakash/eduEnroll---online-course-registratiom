import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { fulfillCheckoutSession, syncSubscription } from "@/lib/checkout";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        const result = await fulfillCheckoutSession(session);
        if (result === "invalid") {
          return new NextResponse("Webhook Error: Missing metadata", { status: 400 });
        }
        // "unpaid" (e.g. delayed bank payment): wait for async_payment_succeeded.
      } catch (error) {
        console.log("[STRIPE_WEBHOOK]", error);
        // 500 → Stripe retries later. Fulfilment is idempotent, so retries are safe.
        return new NextResponse("Webhook handler failed", { status: 500 });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      // Keep eduEnroll Pass access in sync (renewals, cancellations, failed payments).
      try {
        await syncSubscription(event.data.object as Stripe.Subscription);
      } catch (error) {
        console.log("[STRIPE_WEBHOOK_SUB]", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
      }
      break;
    }
    default:
      // Acknowledge other events so Stripe doesn't retry them.
      break;
  }

  return new NextResponse(null, { status: 200 });
}
