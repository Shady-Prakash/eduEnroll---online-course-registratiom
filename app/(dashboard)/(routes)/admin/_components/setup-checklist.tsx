import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui/typography";

export type ChecklistItem = { id: string; label: string; done: boolean; required: boolean };

interface SetupChecklistProps {
  items: ChecklistItem[];
  title?: string;
}

const Row = ({ item }: { item: ChecklistItem }) => (
  <li>
    <a
      href={`#${item.id}`}
      className="group flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm transition hover:bg-ink-50"
    >
      {item.done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success-600" aria-hidden />
      ) : (
        <Circle className={cn("h-4 w-4 shrink-0", item.required ? "text-warning-500" : "text-ink-300")} aria-hidden />
      )}
      <span className={cn("truncate", item.done ? "text-ink-400 line-through decoration-ink-300" : "text-ink-700 group-hover:text-ink-900")}>
        {item.label}
      </span>
      <span className="sr-only">{item.done ? "(done)" : item.required ? "(required)" : "(recommended)"}</span>
    </a>
  </li>
);

/** Required + recommended steps with jump links to each section. */
export const SetupChecklist = ({ items, title = "Setup checklist" }: SetupChecklistProps) => {
  const required = items.filter((i) => i.required);
  const optional = items.filter((i) => !i.required);
  const done = required.filter((i) => i.done).length;
  const pct = required.length ? Math.round((done / required.length) * 100) : 100;

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Heading as="h2" size="label">{title}</Heading>
        <span className="text-xs font-medium tabular-nums text-ink-500">
          {done}/{required.length} required
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Required steps complete"
      >
        <div
          className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-success-500" : "bg-brand-600")}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-4 px-2 text-2xs font-semibold uppercase tracking-wider text-ink-400">Required to publish</p>
      <ul className="mt-1">
        {required.map((item) => <Row key={item.label} item={item} />)}
      </ul>

      {optional.length > 0 && (
        <>
          <p className="mt-3 px-2 text-2xs font-semibold uppercase tracking-wider text-ink-400">Recommended</p>
          <ul className="mt-1">
            {optional.map((item) => <Row key={item.label} item={item} />)}
          </ul>
        </>
      )}
    </div>
  );
};
