"use client";

import { useUser } from "@clerk/nextjs";
import { Heading } from "@/components/ui/typography";

const partOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/**
 * Client-side so the page doesn't wait on a Clerk API call to render,
 * and so the time of day uses the viewer's own clock.
 */
export const Greeting = ({ subtitle }: { subtitle: string }) => {
  const { user, isLoaded } = useUser();

  return (
    <div>
      <Heading suppressHydrationWarning>
        {partOfDay()}
        {isLoaded && user?.firstName ? `, ${user.firstName}` : ""} 👋
      </Heading>
      <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
    </div>
  );
};
