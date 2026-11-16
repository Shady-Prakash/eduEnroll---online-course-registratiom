import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { BrandPanel } from "./_components/brand-panel";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Split-screen auth layout.
 *  - lg+: brand panel (left) + form (right)
 *  - mobile: soft gradient backdrop, logo on top, form in a card
 */
const AuthLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <BrandPanel />

      <main className="relative flex min-h-full flex-col bg-white">
        {/* mobile-only soft backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-50 via-iris-50/40 to-transparent lg:hidden" />

        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:hidden">
          <Link href="/" aria-label="eduEnroll home">
            <BrandLogo />
          </Link>
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-10 pt-2 sm:px-8 lg:py-12">
          <div className="w-full max-w-[420px] rounded-2xl border border-ink-200/80 bg-white/90 p-6 shadow-xl shadow-ink-200/60 backdrop-blur sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            {children}
          </div>
        </div>

        <footer className="relative z-10 flex flex-col items-center gap-2 px-5 pb-6 text-xs text-ink-400 sm:flex-row sm:justify-center sm:gap-4">
          <span className="inline-flex items-center gap-x-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Secured by Clerk · Payments by Stripe
          </span>
          <span className="lg:hidden">© {new Date().getFullYear()} eduEnroll</span>
        </footer>
      </main>
    </div>
  );
}

export default AuthLayout;
