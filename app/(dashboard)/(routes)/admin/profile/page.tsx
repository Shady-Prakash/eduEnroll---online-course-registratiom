import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, UserRound } from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { SetupSection } from "../_components/setup-section";
import { ProfileForm } from "./_components/profile-form";
import { Heading } from "@/components/ui/typography";

export const metadata = { title: "My instructor profile" };

const ProfilePage = async () => {
  const { userId } = auth();
  if (!userId) return redirect("/");

  const profile = await db.teacherProfile.findUnique({ where: { userId } });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading>Instructor profile</Heading>
          <p className="text-sm text-ink-500">What students see when they click your name. Your name and photo come from your account.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/instructors/${userId}`}>
            View public profile <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
      <SetupSection id="profile" icon={UserRound} title="About you" description="Headline, bio and links.">
        <ProfileForm
          initial={{
            headline: profile?.headline ?? "",
            bio: profile?.bio ?? "",
            website: profile?.website ?? "",
            linkedin: profile?.linkedin ?? "",
          }}
        />
      </SetupSection>
    </div>
  );
};

export default ProfilePage;
