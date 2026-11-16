"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { GraduationCap, Presentation } from "lucide-react";

import { cn } from "@/lib/utils";

type Mode = "learn" | "teach";

const KEY = (mode: Mode) => `eduenroll:last:${mode}`;
const DEFAULT: Record<Mode, string> = { learn: "/", teach: "/admin/courses" };

const read = (key: string) => {
  try { return window.sessionStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string) => {
  try { window.sessionStorage.setItem(key, value); } catch { /* ignore */ }
};

export const modeFor = (pathname: string | null): Mode => (pathname?.startsWith("/admin") ? "teach" : "learn");

/**
 * Learn | Teach segmented switch for teachers.
 *  - always shows which mode you're in (sliding highlight)
 *  - switching returns you to where you last were in that mode (per tab)
 */
export const ModeSwitch = () => {
  const pathname = usePathname();
  const router = useRouter();
  const mode = modeFor(pathname);

  // Remember the last page visited in each mode.
  useEffect(() => {
    if (!pathname) return;
    const search = typeof window !== "undefined" ? window.location.search : "";
    write(KEY(mode), pathname + search);
  }, [pathname, mode]);

  const go = (target: Mode) => {
    if (target === mode) return;
    router.push(read(KEY(target)) ?? DEFAULT[target]);
  };

  const options: { value: Mode; label: string; icon: typeof GraduationCap; hint: string }[] = [
    { value: "learn", label: "Learn", icon: GraduationCap, hint: "Student view: your courses and progress" },
    { value: "teach", label: "Teach", icon: Presentation, hint: "Teacher tools: courses, analytics, profile" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Switch between learning and teaching"
      className="relative inline-flex h-9 items-center rounded-full border border-ink-200 bg-ink-100 p-0.5 text-sm font-medium"
    >
      {/* sliding highlight */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full shadow-sm transition-transform duration-300 ease-out",
          mode === "teach" ? "translate-x-full bg-ink-900" : "translate-x-0 bg-white"
        )}
      />
      {options.map(({ value, label, icon: Icon, hint }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={hint}
            onClick={() => go(value)}
            className={cn(
              "relative z-10 flex h-full flex-1 items-center justify-center gap-x-1.5 rounded-full px-3 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
              active ? (value === "teach" ? "text-white" : "text-ink-900") : "text-ink-500 hover:text-ink-800"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
            <span className="sr-only sm:hidden">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
