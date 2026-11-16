import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { isTeacher } from "@/lib/roles";

const url = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || /^https:\/\/[^\s]+\.[^\s]+/i.test(v), "Use a full https:// link")
  .transform((v) => v || null);

const schema = z.object({
  headline: z.string().trim().max(80, "Keep the headline under 80 characters").transform((v) => v || null),
  bio: z.string().trim().max(2000, "Keep your bio under 2000 characters").transform((v) => v || null),
  website: url,
  linkedin: url.refine((v) => !v || /linkedin\.com\//i.test(v), "Use your linkedin.com profile link"),
});

/** Teachers edit their own public instructor profile. */
export async function PATCH(req: Request) {
  try {
    const { userId, orgRole } = auth();
    if (!userId || !isTeacher(orgRole)) return new NextResponse("Unauthorized", { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse(parsed.error.issues[0]?.message ?? "Invalid profile", { status: 400 });

    const profile = await db.teacherProfile.upsert({
      where: { userId },
      update: parsed.data,
      create: { userId, ...parsed.data },
    });
    return NextResponse.json(profile);
  } catch (error) {
    console.log("[TEACHER_PROFILE]", error);
    return new NextResponse("Couldn't save your profile.", { status: 500 });
  }
}
