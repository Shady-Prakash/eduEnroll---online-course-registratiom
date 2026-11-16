"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, MessageSquare, UserRound } from "lucide-react";

import { CourseCard } from "@/components/course-card";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/utils";
import type { InstructorProfile } from "@/actions/get-instructor-profile";
import { Heading } from "@/components/ui/typography";

type Tab = "courses" | "reviews" | "about";

const timeAgo = (date: Date) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
  return `${Math.floor(days / 365)} year${days < 730 ? "" : "s"} ago`;
};

export const ProfileTabs = ({ profile }: { profile: InstructorProfile }) => {
  const [tab, setTab] = useState<Tab>("courses");
  const firstName = profile.name.split(" ")[0];

  const tabs: { value: Tab; label: string; icon: typeof BookOpen; count?: number }[] = [
    { value: "courses", label: "Courses", icon: BookOpen, count: profile.courses.length },
    { value: "reviews", label: "Reviews", icon: MessageSquare, count: profile.reviews.length },
    { value: "about", label: "About", icon: UserRound },
  ];

  return (
    <div className="space-y-6">
      {/* Segmented tabs: full width on phones, compact on desktop */}
      <div role="tablist" aria-label={`${profile.name}'s profile`} className="sticky top-[80px] z-10 -mx-4 border-b border-ink-200 bg-ink-50/95 px-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
        <div className="flex gap-1 sm:inline-flex sm:rounded-xl sm:border sm:border-ink-200 sm:bg-white sm:p-1 sm:shadow-sm">
          {tabs.map(({ value, label, icon: Icon, count }) => {
            const active = tab === value;
            return (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`panel-${value}`}
                onClick={() => setTab(value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-x-1.5 border-b-2 px-3 py-3 text-sm font-medium transition sm:flex-none sm:rounded-lg sm:border-0 sm:py-2",
                  active
                    ? "border-brand-600 text-brand-800 sm:bg-brand-50"
                    : "border-transparent text-ink-500 hover:text-ink-900 sm:hover:bg-ink-50"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                {count !== undefined && (
                  <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-brand-100 text-brand-800" : "bg-ink-100 text-ink-500")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "courses" && (
        <div id="panel-courses" role="tabpanel">
          {profile.courses.length ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.courses.map((c) => (
                <li key={c.id} className="relative">
                  {c.role === "co" && (
                    <span className="absolute right-2 top-2 z-10 rounded-full bg-highlight-600 px-2 py-0.5 text-3xs font-semibold uppercase tracking-wide text-white shadow">
                      Co-teacher
                    </span>
                  )}
                  <CourseCard
                    id={c.id}
                    title={c.title}
                    imageUrl={c.imageUrl}
                    chaptersLength={c.chapters}
                    price={c.price}
                    originalPrice={c.originalPrice}
                    progress={null}
                    category={c.category}
                    code={c.code}
                    level={c.level}
                    rating={c.rating}
                    ratingCount={c.ratingCount}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-ink-300 bg-white p-8 text-center text-sm text-ink-500">
              {firstName} hasn&apos;t published a course yet.
            </p>
          )}
        </div>
      )}

      {tab === "reviews" && (
        <div id="panel-reviews" role="tabpanel">
          {profile.reviews.length ? (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {profile.reviews.map((r) => (
                <li key={r.id} className="flex flex-col rounded-xl border border-ink-200 bg-white p-4">
                  <div className="flex items-center gap-x-3">
                    {r.authorImage ? (
                      <Image src={r.authorImage} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-white">
                        {r.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{r.author}</p>
                      <p className="flex items-center gap-x-2 text-xs text-ink-500">
                        <Stars rating={r.rating} size="xs" /> <span suppressHydrationWarning>{timeAgo(r.updatedAt)}</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-5 flex-1 text-sm leading-relaxed text-ink-700">&ldquo;{r.comment}&rdquo;</p>
                  <Link href={`/courses/${r.course.id}`} className="mt-3 truncate text-xs font-medium text-brand-700 hover:underline">
                    on {r.course.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-ink-300 bg-white p-8 text-center text-sm text-ink-500">
              No written reviews yet.
            </p>
          )}
        </div>
      )}

      {tab === "about" && (
        <div id="panel-about" role="tabpanel" className="rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
          <Heading as="h2" size="card">About {firstName}</Heading>
          {profile.bio ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700 sm:text-base">{profile.bio}</p>
          ) : (
            <p className="mt-3 text-sm text-ink-500">
              {profile.isYou ? (
                <>
                  Tell students about your background and teaching style.{" "}
                  <Link href="/admin/profile" className="font-medium text-brand-700 hover:underline">Add a bio</Link>
                </>
              ) : (
                `${firstName} hasn't added a bio yet.`
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
