import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { AuthHeading } from "../../../_components/auth-heading";
import { clerkAppearance } from "../../../_components/clerk-appearance";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function Page() {
  return (
    <div className="space-y-7">
      <AuthHeading
        title="Create your account"
        subtitle="Register to enroll in KOI courses or start teaching."
      />
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
