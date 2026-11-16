"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { isTeacher } from "@/lib/roles";

import { SearchInput } from "./search-input";
import { AutoSelectOrg } from "./auto-select-org";
import { ModeSwitch } from "./mode-switch";

/** Where "back" goes on immersive pages (lecture / course details), instead of a blanket "Exit". */
const getBackLink = (pathname: string | null) => {
  if (!pathname) return null;
  const lecture = pathname.match(/^\/courses\/([^/]+)\/chapters\/[^/]+/);
  if (lecture) return { href: `/courses/${lecture[1]}`, label: "Course overview" };
  if (/^\/courses\/[^/]+\/?$/.test(pathname)) return { href: "/", label: "My learning" };
  return null;
};

export const NavbarRoutes = () => {
  const { orgRole } = useAuth();
  const pathname = usePathname();

  const isSearchPage = pathname === "/search";
  const back = getBackLink(pathname);
  const teacher = isTeacher(orgRole);

  return (
    <>
      <AutoSelectOrg />

      {back && (
        <Link
          href={back.href}
          className="group inline-flex h-9 items-center gap-x-1.5 rounded-full px-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 sm:px-3"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          <span className="hidden sm:inline">{back.label}</span>
          <span className="sr-only sm:hidden">{back.label}</span>
        </Link>
      )}

      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}

      <div className="ml-auto flex items-center gap-x-3">
        {teacher && <ModeSwitch />}
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{ elements: { avatarBox: "h-9 w-9 ring-2 ring-white shadow-sm" } }}
        />
      </div>
    </>
  );
};
