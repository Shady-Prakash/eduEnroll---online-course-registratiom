import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { PASS } from "@/lib/plans";
import { getActiveSubscription } from "@/lib/access";
import { getOrCreateStripeCustomer } from "@/lib/checkout";

/** Start an eduEnroll Pass subscription (monthly, all courses, optional free trial). */
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!user?.id || !email) return new NextResponse("Please sign in to subscribe.", { status: 401 });

    const { courseId } = (await req.json().catch(() => ({}))) as { courseId?: string };
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    // Return to the course they were looking at (validated), or the dashboard.
    const course = courseId
      ? await db.course.findUnique({ where: { id: courseId, isPublished: true }, select: { id: true } })
      : null;
    const returnPath = course ? `/courses/${course.id}` : "/";

    if (await getActiveSubscription(user.id)) {
      return NextResponse.json({ url: returnPath, alreadySubscribed: true });
    }

    // Only offer the free trial to people who have never subscribed before.
    const hadSubscription = await db.subscription.findUnique({ where: { userId: user.id }, select: { id: true } });

    const customer = await getOrCreateStripeCustomer(
      user.id,
      email,
      [user.firstName, user.lastName].filter(Boolean).join(" ")
    );

    const session = await stripe.checkout.sessions.create({
      customer,
      mode: "subscription",
      client_reference_id: user.id,
      allow_promotion_codes: true,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            unit_amount: Math.round(PASS.monthlyPrice * 100),
            product_data: {
              name: PASS.name,
              description: "Unlimited access to every eduEnroll course. Cancel anytime.",
            },
          },
        },
      ],
      subscription_data: {
        metadata: { userId: user.id },
        ...(PASS.trialDays > 0 && !hadSubscription ? { trial_period_days: PASS.trialDays } : {}),
      },
      metadata: { userId: user.id, kind: "pass" },
      success_url: `${appUrl}${returnPath}?pass=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${returnPath}?pass=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.log("[PASS_CHECKOUT]", error);
    return new NextResponse("We couldn't start your subscription. Please try again.", { status: 500 });
  }
}
