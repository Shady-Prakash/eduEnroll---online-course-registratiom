"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { MonthlyPoint } from "@/actions/get-analytics";
import { palette, theme } from "@/lib/design-tokens";

type Metric = "revenue" | "sales";

interface ChartProps {
  data: MonthlyPoint[];
}

const compactCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const ChartTooltip = ({
  active,
  payload,
  metric,
}: TooltipProps<number, string> & { metric: Metric }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as MonthlyPoint;

  return (
    <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-ink-900">{point.label}</p>
      <p className="mt-1 text-ink-600 tabular-nums">
        {metric === "revenue"
          ? formatPrice(point.revenue)
          : `${point.sales} ${point.sales === 1 ? "sale" : "sales"}`}
      </p>
    </div>
  );
};

/** Single-series monthly bar chart (last 6 months) with a revenue/sales toggle. */
export const Chart = ({ data }: ChartProps) => {
  const [metric, setMetric] = useState<Metric>("revenue");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Chart metric"
        className="mb-4 inline-flex rounded-md border bg-ink-50 p-0.5 text-xs font-medium"
      >
        {(["revenue", "sales"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={metric === m}
            onClick={() => setMetric(m)}
            className={cn(
              "rounded px-3 py-1.5 capitalize transition-colors",
              metric === m
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="h-[220px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={theme.border} />
            <XAxis
              dataKey="label"
              stroke={theme.mutedForeground}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={theme.mutedForeground}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={48}
              allowDecimals={false}
              tickFormatter={(v: number) =>
                metric === "revenue" ? compactCurrency(v) : String(v)
              }
            />
            <Tooltip
              cursor={{ fill: palette.ink[100] }}
              content={<ChartTooltip metric={metric} />}
            />
            <Bar
              dataKey={metric}
              fill={palette.brand[700]}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
