"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SaveBar, fieldClass } from "../../../_components/form-bits";
import { useSave } from "../../../_components/use-save";

const MAX = 12;
const MAX_LEN = 160;

interface OutcomesFormProps {
  courseId: string;
  initialOutcomes: string[];
}

/** Udemy-style "What you'll learn": an editable, reorderable list. */
export const OutcomesForm = ({ courseId, initialOutcomes }: OutcomesFormProps) => {
  const start = initialOutcomes.length ? initialOutcomes : ["", ""];
  const [items, setItems] = useState<string[]>(start);
  const [saved, setSaved] = useState<string[]>(initialOutcomes);
  const { save, isSaving } = useSave(`/api/courses/${courseId}`);

  const cleaned = items.map((i) => i.trim()).filter(Boolean);
  const dirty = JSON.stringify(cleaned) !== JSON.stringify(saved);
  const tooLong = items.some((i) => i.trim().length > MAX_LEN);

  const update = (index: number, value: string) =>
    setItems((prev) => prev.map((v, i) => (i === index ? value : v)));
  const remove = (index: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [""]));
  const move = (index: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (tooLong) return;
        if (await save({ outcomes: cleaned.length ? cleaned : null }, "Learning outcomes saved")) {
          setSaved(cleaned);
          setItems(cleaned.length ? cleaned : ["", ""]);
        }
      }}
    >
      <ol className="space-y-2">
        {items.map((item, index) => {
          const over = item.trim().length > MAX_LEN;
          return (
            <li key={index} className="flex items-start gap-x-2">
              <CheckCircle2 className="mt-3 h-4 w-4 shrink-0 text-success-500" aria-hidden />
              <div className="min-w-0 flex-1">
                <input
                  value={item}
                  onChange={(e) => update(index, e.target.value)}
                  onKeyDown={(e) => {
                    // Enter on the last row adds a new outcome instead of submitting.
                    if (e.key === "Enter" && index === items.length - 1 && item.trim() && items.length < MAX) {
                      e.preventDefault();
                      setItems((prev) => [...prev, ""]);
                    }
                  }}
                  aria-label={`Learning outcome ${index + 1}`}
                  placeholder={index === 0 ? "e.g. Conduct user research and build personas" : "Add another outcome"}
                  className={cn(fieldClass, over && "border-danger-400 focus-visible:border-danger-500 focus-visible:ring-danger-500/15")}
                />
                {over && <p className="mt-1 text-xs text-danger-600">Keep each outcome under {MAX_LEN} characters.</p>}
              </div>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="hidden h-11 w-8 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30 sm:flex"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="hidden h-11 w-8 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30 sm:flex"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex h-11 w-9 items-center justify-center rounded-md text-ink-400 hover:bg-danger-50 hover:text-danger-600"
                  aria-label={`Remove outcome ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setItems((prev) => [...prev, ""])}
          disabled={items.length >= MAX}
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Add outcome
        </Button>
        <span className="text-xs text-ink-500 tabular-nums">
          {cleaned.length}/{MAX} · aim for 4–6 clear, measurable outcomes
        </span>
      </div>

      <SaveBar dirty={dirty && !tooLong} saving={isSaving} onReset={() => setItems(saved.length ? saved : ["", ""])} />
    </form>
  );
};
