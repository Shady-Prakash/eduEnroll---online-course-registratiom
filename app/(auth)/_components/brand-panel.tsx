import { BarChart3, BookOpenCheck, ClipboardList, GraduationCap, PlayCircle, Presentation } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Heading } from "@/components/ui/typography";

const roles = [
  {
    icon: GraduationCap,
    title: "For students",
    points: [
      { icon: ClipboardList, text: "Browse and enroll in your KOI courses" },
      { icon: PlayCircle, text: "Learn through video chapters and resources" },
      { icon: BookOpenCheck, text: "Track progress across every unit" },
    ],
  },
  {
    icon: Presentation,
    title: "For teachers",
    points: [
      { icon: ClipboardList, text: "Create courses and publish chapters" },
      { icon: PlayCircle, text: "Upload lectures, slides and attachments" },
      { icon: BarChart3, text: "See enrolments and course analytics" },
    ],
  },
];

/** Decorative brand side of the auth screens (desktop only). */
export const BrandPanel = () => (
  <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col">
    {/* background: gradient, glow blobs, subtle grid */}
    <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-700 via-iris-800 to-ink-950" />
    <div aria-hidden className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />
    <div aria-hidden className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-iris-500/30 blur-3xl" />
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]"
    />

    <div className="relative z-10 flex flex-1 flex-col justify-between gap-8 p-8 xl:p-14">
      <BrandLogo tone="light" />

      <div className="max-w-lg space-y-7 xl:space-y-10">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/20">
            Course registration &amp; enrollment for KOI
          </span>
          <Heading as="h2" size="display" tone="inverse">
            Your courses,
            <span className="block text-brand-200">all in one place.</span>
          </Heading>
          <p className="text-base leading-relaxed text-ink-300">
            Structured units like a campus LMS, with engaging video courses like an online
            marketplace. One portal for students and teachers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {roles.map(({ icon: RoleIcon, title, points }) => (
            <section
              key={title}
              className="rounded-2xl bg-white/[0.07] p-4 ring-1 xl:p-5 ring-white/15 backdrop-blur-sm"
            >
              <Heading as="h3" size="sub" tone="inverse" className="flex items-center gap-x-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <RoleIcon className="h-5 w-5 text-brand-200" aria-hidden />
                </span>
                {title}
              </Heading>
              <ul className="mt-3 space-y-2 xl:mt-4 xl:space-y-3">
                {points.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-x-2.5 text-sm leading-snug text-ink-300">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-400">© {new Date().getFullYear()} eduEnroll · Built for KOI students and teachers</p>
    </div>
  </aside>
);
