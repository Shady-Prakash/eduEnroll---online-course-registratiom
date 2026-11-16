import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** "dark" for light backgrounds, "light" for dark/brand backgrounds. */
  tone?: "dark" | "light";
  showWordmark?: boolean;
}

/** eduEnroll logo: mark + wordmark, pure SVG/CSS (crisp at any size, no image request). */
export const BrandLogo = ({ className, tone = "dark", showWordmark = true }: BrandLogoProps) => (
  <span className={cn("inline-flex items-center gap-x-2.5", className)}>
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm",
        tone === "dark"
          ? "bg-gradient-to-br from-brand-500 to-iris-600 text-white"
          : "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur"
      )}
    >
      {/* graduation cap with an upward "enroll" chevron */}
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9.5 12 5l10 4.5-10 4.5L2 9.5Z" />
        <path d="M6 11.6V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.4" />
        <path d="M22 9.5V14" />
      </svg>
    </span>
    {showWordmark && (
      <span
        className={cn(
          "text-xl font-semibold tracking-tight",
          tone === "dark" ? "text-ink-900" : "text-white"
        )}
      >
        edu<span className={tone === "dark" ? "text-brand-600" : "text-brand-200"}>Enroll</span>
      </span>
    )}
    <span className="sr-only">eduEnroll</span>
  </span>
);
