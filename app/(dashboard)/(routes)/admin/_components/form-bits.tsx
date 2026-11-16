"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shared input styling so every setup field looks the same. */
export const fieldClass =
  "h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-400 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/15 disabled:opacity-60";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  counter?: { value: number; max: number };
  children: React.ReactNode;
  className?: string;
}

export const Field = ({ label, htmlFor, hint, error, optional, counter, children, className }: FieldProps) => (
  <div className={cn("space-y-1.5", className)}>
    <div className="flex items-baseline justify-between gap-x-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-700">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-400">(optional)</span>}
      </label>
      {counter && (
        <span
          className={cn(
            "text-xs tabular-nums",
            counter.value > counter.max ? "text-danger-600" : "text-ink-400"
          )}
        >
          {counter.value}/{counter.max}
        </span>
      )}
    </div>
    {children}
    {error ? (
      <p className="text-xs font-medium text-danger-600" role="alert">{error}</p>
    ) : hint ? (
      <p className="text-xs text-ink-500">{hint}</p>
    ) : null}
  </div>
);

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  onReset?: () => void;
  label?: string;
}

/** Save / discard row. Only active when the form has unsaved changes. */
export const SaveBar = ({ dirty, saving, onReset, label = "Save changes" }: SaveBarProps) => (
  <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
    {dirty && !saving && (
      <span className="text-xs text-warning-700 sm:mr-auto">You have unsaved changes</span>
    )}
    {onReset && dirty && (
      <Button type="button" variant="ghost" onClick={onReset} disabled={saving} className="w-full sm:w-auto">
        Discard
      </Button>
    )}
    <Button type="submit" disabled={!dirty || saving} className="w-full sm:w-auto">
      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
      {saving ? "Saving…" : label}
    </Button>
  </div>
);

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  "aria-describedby"?: string;
}

export const Switch = ({ checked, onCheckedChange, disabled, ...props }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 disabled:opacity-50",
      checked ? "bg-brand-600" : "bg-ink-300"
    )}
    {...props}
  >
    <span
      className={cn(
        "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-[22px]" : "translate-x-0.5"
      )}
    />
  </button>
);
