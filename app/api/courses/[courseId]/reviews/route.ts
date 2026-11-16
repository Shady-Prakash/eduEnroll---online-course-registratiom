import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { getCourseAccess } from "@/lib/access";

const schema = z.object({
  rating: z.number().int().min(1, "Choose a rating").max(5),
  comment: z.string().trim().max(2000, "Keep it under 2000 characters").optional().nullable(),
});

/** Create or update the signed-in student's review (enrolled students only). */
export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const access = await getCourseAccess(userId, params.courseId);
    if (!access.hasAccess || access.via === "instructor") {
      return new NextResponse("Only enrolled students can review this course.", { status: 403 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse(parsed.error.issues[0]?.message ?? "Invalid review", { status: 400 });
    const { rating, comment } = parsed.data;

    const review = await db.review.upsert({
      where: { courseId_userId: { courseId: params.courseId, userId } },
      update: { rating, comment: comment || null },
      create: { courseId: params.courseId, userId, rating, comment: comment || null },
    });
    return NextResponse.json(review);
  } catch (error) {
    console.log("[REVIEW_POST]", error);
    return new NextResponse("Couldn't save your review. Please try again.", { status: 500 });
  }
}

/** Delete the signed-in student's own review. */
export async function DELETE(_req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    await db.review.deleteMany({ where: { courseId: params.courseId, userId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("[REVIEW_DELETE]", error);
    return new NextResponse("Couldn't delete your review.", { status: 500 });
  }
}
