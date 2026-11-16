import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { getCourseOwner } from "@/lib/course-owner";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address") });

/** Owner adds a co-teacher by the email of their eduEnroll account. */
export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const ownerId = await getCourseOwner(params.courseId);
    if (!ownerId) return new NextResponse("Only the course owner can manage teachers.", { status: 403 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse(parsed.error.issues[0].message, { status: 400 });

    const [user] = await clerkClient.users.getUserList({ emailAddress: [parsed.data.email], limit: 1 });
    if (!user) {
      return new NextResponse("No eduEnroll account uses that email. Ask them to sign up first.", { status: 404 });
    }
    if (user.id === ownerId) return new NextResponse("You already own this course.", { status: 400 });

    const count = await db.courseInstructor.count({ where: { courseId: params.courseId } });
    if (count >= 10) return new NextResponse("A course can have up to 10 co-teachers.", { status: 400 });

    await db.courseInstructor.upsert({
      where: { courseId_userId: { courseId: params.courseId, userId: user.id } },
      update: {},
      create: { courseId: params.courseId, userId: user.id },
    });

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || parsed.data.email;
    return NextResponse.json({ userId: user.id, name });
  } catch (error) {
    console.log("[INSTRUCTORS_POST]", error);
    return new NextResponse("Couldn't add the teacher. Please try again.", { status: 500 });
  }
}
