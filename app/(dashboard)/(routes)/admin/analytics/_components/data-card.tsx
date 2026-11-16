import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  hintTone?: "neutral" | "positive" | "negative";
}

const DataCard = ({
  label,
  value,
  icon: Icon,
  hint,
  hintTone = "neutral",
}: DataCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-x-2">
          <p className="text-xs sm:text-sm font-medium text-ink-500 truncate">
            {label}
          </p>
          <div className="rounded-full bg-brand-100 p-1.5 sm:p-2 shrink-0">
            <Icon className="h-4 w-4 text-brand-700" aria-hidden />
          </div>
        </div>
        <p className="mt-2 text-xl sm:text-2xl font-bold text-ink-900 tabular-nums truncate">
          {value}
        </p>
        {hint && (
          <p
            className={cn(
              "mt-1 text-xs truncate",
              hintTone === "neutral" && "text-ink-500",
              hintTone === "positive" && "text-success-700",
              hintTone === "negative" && "text-danger-700"
            )}
          >
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DataCard;
