import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCourseAccess } from "@/lib/access";


import { CourseSidebar } from "../_components/course-sidebar";
import { CourseNavbar } from "../_components/course-navbar";

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {

  const { userId } = auth();

    if(!userId) {
      return redirect("/");
    }

    const [course, purchase] = await Promise.all([
      db.course.findUnique({
      where: {
        id: params.courseId,
      },
      include: {
        sections: { orderBy: { position: "asc" }, select: { id: true, title: true } },
        chapters: {
          where: {
            isPublished: true,
          },
          include: {
            userProgress: {
              where: {
                userId,
              }
            }
          },
          orderBy: {
            position: "asc"
          }
        },
      }
      }),
      getCourseAccess(userId, params.courseId),
    ]);

    if (!course) {
      return redirect("/");
    }

    // Progress is derived from the chapters' userProgress already loaded above (no extra queries).
    const completedChapters = course.chapters.filter((ch) => ch.userProgress?.[0]?.isCompleted).length;
    const progressCount = course.chapters.length
      ? (completedChapters / course.chapters.length) * 100
      : 0;

    return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={course}
          progressCount={progressCount}
          isPurchased={purchase.hasAccess}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
          isPurchased={purchase.hasAccess}
        />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">
        {children}
      </main>
    </div>
  )
}

export default CourseLayout