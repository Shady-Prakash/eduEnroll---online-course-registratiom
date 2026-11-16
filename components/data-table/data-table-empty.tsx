import { LucideIcon, SearchX } from "lucide-react";

interface DataTableEmptyProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Empty / no-results state shared by table and card layouts. */
export const DataTableEmpty = ({
  icon: Icon = SearchX,
  title,
  description,
  action,
}: DataTableEmptyProps) => (
  <div className="flex flex-col items-center justify-center gap-y-3 px-4 py-12 text-center">
    <div className="rounded-full bg-ink-100 p-3">
      <Icon className="h-6 w-6 text-ink-500" aria-hidden />
    </div>
    <div>
      <p className="font-medium text-ink-900">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
    </div>
    {action}
  </div>
);
