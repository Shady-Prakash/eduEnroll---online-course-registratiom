import type { Metadata } from "next";
import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ExternalLink, Globe, Linkedin, MessageSquare, Pencil, Star, Users } from "lucide-react";

import { getInstructorProfile } from "@/actions/get-instructor-profile";
import { getUserProfiles } from "@/lib/clerk-users";
import { Button } from "@/components/ui/button";
import { ProfileTabs } from "./_components/profile-tabs";
import { Heading } from "@/components/ui/typography";

type Props = { params: { instructorId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = (await getUserProfiles([params.instructorId])).get(params.instructorId)?.name;
  return { title: name ? `${name} · Instructor` : "Instructor" };
}

const safeUrl = (url: string | null) => (url && /^https:\/\//i.test(url) ? url : null);

const InstructorPage = async ({ params }: Props) => {
  const { userId } = auth();
  if (!userId) return redirect("/sign-in");

  const profile = await getInstructorProfile(params.instructorId, userId);
  if (!profile) return notFound();

  const website = safeUrl(profile.website);
  const linkedin = safeUrl(profile.linkedin);

  const tiles = [
    { icon: Star, label: "Instructor rating", value: profile.stats.reviews ? profile.stats.rating.toFixed(1) : "–", tone: "text-warning-500" },
    { icon: MessageSquare, label: "Reviews", value: profile.stats.reviews.toLocaleString("en-US"), tone: "text-brand-600" },
    { icon: Users, label: "Students", value: profile.stats.students.toLocaleString("en-US"), tone: "text-success-600" },
    { icon: BookOpen, label: "Courses", value: String(profile.stats.courses), tone: "text-highlight-600" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Profile card */}
      <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
        <div aria-hidden className="h-28 bg-gradient-to-r from-brand-600 via-iris-600 to-highlight-600 sm:h-36">
          <div className="h-full w-full opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>

        <div className="px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
              {profile.imageUrl ? (
                <Image
                  src={profile.imageUrl}
                  alt=""
                  width={112}
                  height={112}
                  priority
                  className="-mt-12 h-24 w-24 shrink-0 rounded-full border-4 border-white object-cover shadow-md sm:-mt-14 sm:h-28 sm:w-28"
                />
              ) : (
                <span className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-brand-500 to-iris-600 text-3xl font-bold text-white shadow-md sm:-mt-14 sm:h-28 sm:w-28">
                  {profile.name.charAt(0)}
                </span>
              )}
              <div className="sm:pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Instructor</p>
                <Heading>{profile.name}</Heading>
                {profile.headline && <p className="mt-0.5 text-sm text-ink-600 sm:text-base">{profile.headline}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:pb-1">
              {website && (
                <Button asChild variant="outline" size="sm">
                  <a href={website} target="_blank" rel="noopener noreferrer nofollow">
                    <Globe className="mr-1.5 h-4 w-4" aria-hidden /> Website <ExternalLink className="ml-1 h-3 w-3 opacity-60" aria-hidden />
                  </a>
                </Button>
              )}
              {linkedin && (
                <Button asChild variant="outline" size="sm">
                  <a href={linkedin} target="_blank" rel="noopener noreferrer nofollow">
                    <Linkedin className="mr-1.5 h-4 w-4" aria-hidden /> LinkedIn
                  </a>
                </Button>
              )}
              {profile.isYou && (
                <Button asChild size="sm">
                  <Link href="/admin/profile">
                    <Pencil className="mr-1.5 h-4 w-4" aria-hidden /> Edit profile
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Stat tiles: 2×2 on phones, a row of 4 on larger screens */}
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map(({ icon: Icon, label, value, tone }) => (
              <div key={label} className="rounded-xl bg-ink-50 p-3 sm:p-4">
                <dt className="flex items-center gap-x-1.5 text-xs font-medium text-ink-500">
                  <Icon className={`h-4 w-4 ${tone}`} aria-hidden /> {label}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-ink-900 sm:text-2xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ProfileTabs profile={profile} />
    </div>
  );
};

export default InstructorPage;
