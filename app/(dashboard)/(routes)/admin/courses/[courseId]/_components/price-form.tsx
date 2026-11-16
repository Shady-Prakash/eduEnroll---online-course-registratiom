"use client";

import { useState } from "react";
import { Gift, Lock, Percent, Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { getPricing, timeLeftLabel } from "@/lib/pricing";
import { Field, SaveBar, Switch, fieldClass } from "../../../_components/form-bits";
import { useSave } from "../../../_components/use-save";

interface PriceFormProps {
  courseId: string;
  initialData: { price: number | null; salePrice: number | null; saleEndsAt: Date | null };
  /** Co-teachers can see pricing but only the owner can change it. */
  readOnly?: boolean;
}

type Mode = "paid" | "free";

const toLocalInput = (d: Date | null) => {
  if (!d) return "";
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** Free or paid, plus an optional limited-time offer with a live preview. */
export const PriceForm = ({ courseId, initialData, readOnly = false }: PriceFormProps) => {
  const init = {
    mode: (initialData.price === 0 ? "free" : "paid") as Mode,
    amount: initialData.price && initialData.price > 0 ? String(initialData.price) : "",
    offer: initialData.salePrice != null,
    sale: initialData.salePrice != null ? String(initialData.salePrice) : "",
    endsAt: toLocalInput(initialData.saleEndsAt),
    isSet: initialData.price !== null,
  };
  const [state, setState] = useState(init);
  const [saved, setSaved] = useState(init);
  const { save, isSaving } = useSave(`/api/courses/${courseId}`);
  const set = (patch: Partial<typeof init>) => setState((s) => ({ ...s, ...patch }));

  const price = Number(state.amount);
  const sale = Number(state.sale);
  const endsAt = state.endsAt ? new Date(state.endsAt) : null;

  const priceInvalid = state.mode === "paid" && (state.amount === "" || !(price > 0));
  const saleInvalid =
    state.mode === "paid" && state.offer && (state.sale === "" || !(sale >= 0) || sale >= price);
  const endInvalid = state.mode === "paid" && state.offer && !!endsAt && endsAt <= new Date();
  const invalid = priceInvalid || saleInvalid || endInvalid;

  const dirty = !saved.isSet || JSON.stringify({ ...state, isSet: 0 }) !== JSON.stringify({ ...saved, isSet: 0 });

  const preview = getPricing({
    price: state.mode === "free" ? 0 : price || 0,
    salePrice: state.offer && !saleInvalid ? sale : null,
    saleEndsAt: endsAt,
  });

  const options: { value: Mode; label: string; description: string; icon: typeof Tag }[] = [
    { value: "paid", label: "Paid", description: "One-time purchase via Stripe", icon: Tag },
    { value: "free", label: "Free", description: "Open enrolment for everyone", icon: Gift },
  ];

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (invalid || readOnly) return;
        const free = state.mode === "free";
        const payload = {
          price: free ? 0 : Math.round(price * 100) / 100,
          salePrice: !free && state.offer ? Math.round(sale * 100) / 100 : null,
          saleEndsAt: !free && state.offer && endsAt ? endsAt.toISOString() : null,
        };
        if (await save(payload, "Pricing saved")) setSaved({ ...state, isSet: true });
      }}
    >
      {readOnly && (
        <p className="flex items-center gap-x-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
          <Lock className="h-3.5 w-3.5" aria-hidden /> Only the course owner can change pricing.
        </p>
      )}

      <fieldset disabled={readOnly} className="space-y-5 disabled:opacity-70">
        <div role="radiogroup" aria-label="Pricing model" className="grid grid-cols-2 gap-3">
          {options.map(({ value, label, description, icon: Icon }) => {
            const active = state.mode === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set({ mode: value })}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition sm:p-4",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15",
                  active ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-500" : "border-ink-200 hover:border-ink-300"
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-brand-700" : "text-ink-400")} aria-hidden />
                <span className="font-medium text-ink-900">{label}</span>
                <span className="text-xs text-ink-500">{description}</span>
              </button>
            );
          })}
        </div>

        {state.mode === "paid" && (
          <>
            <Field
              label="Regular price (USD)"
              htmlFor="price"
              error={state.amount !== "" && priceInvalid ? "Enter a price greater than 0" : undefined}
              hint="One-time payment for lifetime access. eduEnroll Pass subscribers also get access."
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">$</span>
                <input id="price" type="number" inputMode="decimal" min="0.5" step="0.01" value={state.amount} onChange={(e) => set({ amount: e.target.value })} placeholder="e.g. 49.99" className={cn(fieldClass, "pl-7 tabular-nums")} />
              </div>
            </Field>

            <div className="rounded-xl border border-ink-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-x-3">
                  <Percent className="mt-0.5 h-5 w-5 text-danger-500" aria-hidden />
                  <div>
                    <label htmlFor="offer" className="text-sm font-medium text-ink-900">Limited-time offer</label>
                    <p className="text-xs text-ink-500">Show a discount with the regular price struck through and a countdown.</p>
                  </div>
                </div>
                <Switch id="offer" checked={state.offer} onCheckedChange={(v) => set({ offer: v })} disabled={readOnly} />
              </div>

              {state.offer && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Offer price (USD)" htmlFor="sale" error={state.sale !== "" && saleInvalid ? "Must be lower than the regular price" : undefined}>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">$</span>
                      <input id="sale" type="number" inputMode="decimal" min="0" step="0.01" value={state.sale} onChange={(e) => set({ sale: e.target.value })} placeholder="e.g. 14.99" className={cn(fieldClass, "pl-7 tabular-nums")} />
                    </div>
                  </Field>
                  <Field label="Offer ends" htmlFor="endsAt" optional hint={!endsAt ? "No end date: runs until you turn it off." : undefined} error={endInvalid ? "Pick a time in the future" : undefined}>
                    <input id="endsAt" type="datetime-local" value={state.endsAt} onChange={(e) => set({ endsAt: e.target.value })} className={fieldClass} />
                  </Field>
                </div>
              )}
            </div>

            {/* Live preview of what students will see */}
            {price > 0 && (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg bg-ink-50 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-400">Students see</span>
                <span className="text-xl font-bold tabular-nums text-ink-900">{formatPrice(preview.current)}</span>
                {preview.onSale && (
                  <>
                    <span className="text-sm text-ink-400 line-through tabular-nums">{formatPrice(preview.original)}</span>
                    <span className="text-sm font-semibold text-danger-600">{preview.discountPct}% off</span>
                    {timeLeftLabel(preview.endsAt) && <span className="text-xs text-danger-600">⏰ {timeLeftLabel(preview.endsAt)}</span>}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </fieldset>

      {!readOnly && <SaveBar dirty={dirty && !invalid} saving={isSaving} onReset={() => setState(saved)} />}
    </form>
  );
};
