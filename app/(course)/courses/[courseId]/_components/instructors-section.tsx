import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronRight, MessageSquare, Star, Users } from "lucide-react";
import { Heading } from "@/components/ui/typography";

type Instructor = {
  id: string;
  name: string;
  imageUrl: string | null;
  role: "owner" | "co";
  stats: { rating: number; reviews: number; students: number; courses: number };
};

/** Udemy-style instructor cards: every teacher on the course with their overall stats. */
export const InstructorsSection = ({ instructors, code }: { instructors: Instructor[]; code: string | null }) => {
  if (!instructors.length) return null;

  return (
    <section aria-labelledby="instructor-heading" className="space-y-4">
      <Heading as="h2" id="instructor-heading" size="section">
        {instructors.length > 1 ? "Instructors" : "Instructor"}
      </Heading>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {instructors.map((t) => (
          <li key={t.id} className="group relative rounded-xl border border-ink-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md">
            <Link
              href={`/instructors/${t.id}`}
              className="text-base font-bold text-brand-800 underline-offset-2 after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-500/40"
            >
              {t.name}
            </Link>
            <ChevronRight className="absolute right-4 top-5 h-5 w-5 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
            <p className="text-sm text-ink-500">
              {t.role === "owner" ? (code ? `${code} unit coordinator` : "Lead teacher") : "Co-teacher"}
            </p>
            <div className="mt-3 flex items-center gap-4">
              {t.imageUrl ? (
                <Image src={t.imageUrl} alt="" width={80} height={80} className="h-20 w-20 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-iris-600 text-2xl font-semibold text-white">
                  {t.name.charAt(0)}
                </span>
              )}
              <ul className="space-y-1 text-sm text-ink-700">
                <li className="flex items-center gap-x-2">
                  <Star className="h-4 w-4 fill-warning-400 text-warning-400" aria-hidden />
                  {t.stats.reviews ? <>{t.stats.rating.toFixed(1)} instructor rating</> : "No ratings yet"}
                </li>
                <li className="flex items-center gap-x-2">
                  <MessageSquare className="h-4 w-4 text-ink-400" aria-hidden />
                  {t.stats.reviews.toLocaleString("en-US")} review{t.stats.reviews === 1 ? "" : "s"}
                </li>
                <li className="flex items-center gap-x-2">
                  <Users className="h-4 w-4 text-ink-400" aria-hidden />
                  {t.stats.students.toLocaleString("en-US")} student{t.stats.students === 1 ? "" : "s"}
                </li>
                <li className="flex items-center gap-x-2">
                  <BookOpen className="h-4 w-4 text-ink-400" aria-hidden />
                  {t.stats.courses} course{t.stats.courses === 1 ? "" : "s"}
                </li>
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
