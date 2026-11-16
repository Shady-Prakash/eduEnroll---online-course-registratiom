import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer, grantCourseAccess } from "@/lib/checkout";
import { getPricing } from "@/lib/pricing";

/** One-time purchase (lifetime access) at the current price, including active offers. */
export async function POST(
  req: Request,
  { params} : { params: { courseId: string } }
) {
  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!user?.id || !email) {
      return new NextResponse("Please sign in to enroll.", { status: 401 });
    }

    // Where to send the student back to (the chapter they were viewing).
    const { chapterId } = (await req.json().catch(() => ({}))) as { chapterId?: string };

    const [course, enrollment] = await Promise.all([
      db.course.findUnique({
        where: { id: params.courseId, isPublished: true },
        select: {
          id: true,
          userId: true,
          instructors: { where: { userId: user.id }, select: { id: true } },
          title: true,
          description: true,
          imageUrl: true,
          price: true,
          salePrice: true,
          saleEndsAt: true,
          chapters: {
            where: { isPublished: true },
            select: { id: true },
            orderBy: { position: "asc" },
            take: 1,
          },
        },
      }),
      db.purchase.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
        select: { source: true },
      }),
    ]);

    if (!course) {
      return new NextResponse("This course is no longer available.", { status: 404 });
    }

    const returnChapterId = chapterId ?? course.chapters[0]?.id;
    const returnPath = returnChapterId
      ? `/courses/${course.id}/chapters/${returnChapterId}`
      : `/courses/${course.id}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Teachers (owner or co-teacher) already have full access: never charge them
    // for their own course, and don't create a purchase that would count as a sale.
    if (course.userId === user.id || course.instructors.length > 0) {
      return NextResponse.json({ url: returnPath, instructor: true });
    }

    // Already owns it for life. (A Pass enrolment can still be upgraded to a purchase.)
    if (enrollment?.source === "purchase") {
      return NextResponse.json({ url: returnPath, alreadyEnrolled: true });
    }

    const pricing = getPricing(course);

    // Free course: enroll directly, no Stripe round-trip.
    if (pricing.isFree) {
      await grantCourseAccess(user.id, course.id, 0);
      return NextResponse.json({ url: `${returnPath}?checkout=success`, free: true });
    }

    const description = course.description
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            ...(description ? { description } : {}),
            ...(course.imageUrl ? { images: [course.imageUrl] } : {}),
          },
          unit_amount: Math.round(pricing.current * 100),
        },
      },
    ];

    const customer = await getOrCreateStripeCustomer(
      user.id,
      email,
      [user.firstName, user.lastName].filter(Boolean).join(" ")
    );

    const session = await stripe.checkout.sessions.create({
      customer,
      line_items,
      mode: "payment",
      allow_promotion_codes: true,
      client_reference_id: user.id,
      submit_type: "pay",
      custom_text: {
        submit: {
          message: pricing.onSale
            ? `Offer price: ${pricing.discountPct}% off. Lifetime access to every lecture.`
            : "You'll get instant, lifetime access to every lecture after payment.",
        },
      },
      success_url: `${appUrl}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      // Canceling returns to where the student clicked Enroll (course page unless a chapter was given).
      cancel_url: `${appUrl}${chapterId ? returnPath : `/courses/${course.id}`}?checkout=canceled`,
      metadata: { courseId: course.id, userId: user.id, kind: "course" },
      payment_intent_data: { metadata: { courseId: course.id, userId: user.id } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.log("[COURSE_ID_CHECKOUT]", error);
    return new NextResponse("We couldn't start checkout. Please try again.", { status: 500 });
  }
}
