import { CheckCircle2, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui/typography";

interface SetupSectionProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  status?: "required" | "optional" | "done";
  children: React.ReactNode;
  className?: string;
}

const statusChip = {
  done: { label: "Complete", className: "bg-success-50 text-success-700 ring-success-600/20" },
  required: { label: "Required", className: "bg-warning-50 text-warning-800 ring-warning-600/20" },
  optional: { label: "Recommended", className: "bg-ink-100 text-ink-600 ring-ink-500/20" },
};

/** Card wrapper for one area of a setup page; `id` is the in-page anchor used by the setup nav. */
export const SetupSection = ({
  id,
  icon: Icon,
  title,
  description,
  status,
  children,
  className,
}: SetupSectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    className={cn("scroll-mt-[220px] lg:scroll-mt-[184px] rounded-xl border border-ink-200 bg-white shadow-sm", className)}
  >
    <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-4 py-4 sm:px-6">
      <div className="flex min-w-0 items-start gap-x-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="min-w-0">
          <Heading as="h2" id={`${id}-title`} size="sub">
            {title}
          </Heading>
          {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
        </div>
      </div>
      {status && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            statusChip[status].className
          )}
        >
          {status === "done" && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
          {statusChip[status].label}
        </span>
      )}
    </header>
    <div className="px-4 py-5 sm:px-6">{children}</div>
  </section>
);
