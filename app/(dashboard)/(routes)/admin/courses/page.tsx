import { auth } from "@clerk/nextjs";
import { taughtBy } from "@/lib/course-owner";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

import { CoursesTable } from "./_components/courses-table";
import type { CourseRow } from "./_components/types";
import { Heading } from "@/components/ui/typography";

const CoursesPage = async () => {
  const { userId } = auth();

  if(!userId) {
    return redirect("/");
  }

  const courses = await db.course.findMany({
    where: taughtBy(userId),
    select: {
      userId: true,
      id: true,
      title: true,
      code: true,
      imageUrl: true,
      price: true,
      isPublished: true,
      updatedAt: true,
      category: { select: { name: true } },
      chapters: { select: { isPublished: true } },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const rows: CourseRow[] = courses.map(({ category, chapters, userId: ownerId, ...course }) => ({
    ...course,
    role: ownerId === userId ? "owner" : "co",
    category: category?.name ?? null,
    chaptersTotal: chapters.length,
    chaptersPublished: chapters.filter((ch) => ch.isPublished).length,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading>Courses</Heading>
          <p className="text-sm text-ink-500">
            Create, edit and publish your courses.
          </p>
        </div>
        {rows.length > 0 && (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/courses/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              New course
            </Link>
          </Button>
        )}
      </div>

      <CoursesTable courses={rows} />
    </div>
  );
}

export default CoursesPage;
