import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

/** Stripe billing portal: update card, view invoices, cancel or resume the Pass. */
export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const customer = await db.stripeCustomer.findUnique({ where: { userId }, select: { stripeCustomerId: true } });
    if (!customer) return new NextResponse("No billing account yet.", { status: 404 });

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.log("[PASS_PORTAL]", error);
    return new NextResponse(
      "Couldn't open billing. In Stripe, activate the customer portal (Settings → Billing → Customer portal).",
      { status: 500 }
    );
  }
}
