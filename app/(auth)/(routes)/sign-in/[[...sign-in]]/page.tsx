import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { AuthHeading } from "../../../_components/auth-heading";
import { clerkAppearance } from "../../../_components/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function Page() {
  return (
    <div className="space-y-7">
      <AuthHeading
        title="Welcome back"
        subtitle="Sign in to your eduEnroll account to access your courses."
      />
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
