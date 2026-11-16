"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { categoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import { Field, fieldClass } from "../../../_components/form-bits";
import { errorMessage } from "../../../_components/use-save";
import { Heading } from "@/components/ui/typography";

interface CreateCourseWizardProps {
  categories: { id: string; name: string }[];
}

const STEPS = ["Name", "Category"] as const;

/** Two quick steps (Udemy-style), then straight into the full setup page. */
export const CreateCourseWizard = ({ categories }: CreateCourseWizardProps) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleValid = title.trim().length >= 3;

  const create = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.post("/api/courses", { title: title.trim(), code, categoryId });
      toast.success("Course created. Let's set it up!");
      router.push(`/admin/courses/${data.id}`);
    } catch (error) {
      toast.error(errorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-x-3" aria-label="Progress">
        {STEPS.map((label, i) => {
          const state = i < step ? "done" : i === step ? "current" : "upcoming";
          return (
            <li key={label} className="flex flex-1 items-center gap-x-3" aria-current={state === "current" ? "step" : undefined}>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition",
                  state === "done" && "bg-brand-600 text-white",
                  state === "current" && "bg-brand-600 text-white ring-4 ring-brand-100",
                  state === "upcoming" && "bg-ink-100 text-ink-400"
                )}
              >
                {state === "done" ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn("text-sm font-medium", state === "upcoming" ? "text-ink-400" : "text-ink-900")}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span className={cn("h-px flex-1", i < step ? "bg-brand-600" : "bg-ink-200")} aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm sm:p-8">
        {step === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (titleValid) setStep(1);
            }}
            className="space-y-6"
          >
            <div>
              <Heading>Name your course</Heading>
              <p className="mt-1 text-sm text-ink-500">
                A clear title helps students find it. You can change everything later.
              </p>
            </div>

            <Field
              label="Course title"
              htmlFor="title"
              counter={{ value: title.length, max: 120 }}
              hint="e.g. 'User Experience and Mobile Application Development'"
            >
              <input
                id="title"
                autoFocus
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What will you teach?"
                className={cn(fieldClass, "h-12 text-base")}
              />
            </Field>

            <Field label="Unit code" htmlFor="code" optional hint="Like Moodle: helps students search for your unit, e.g. ICT725.">
              <input
                id="code"
                value={code}
                maxLength={20}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder="e.g. ICT725"
                className={cn(fieldClass, "sm:max-w-[200px]")}
              />
            </Field>

            <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-5 sm:flex-row sm:justify-between">
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/admin/courses">Cancel</Link>
              </Button>
              <Button type="submit" disabled={!titleValid} className="w-full sm:w-auto">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Heading>Pick a category</Heading>
              <p className="mt-1 text-sm text-ink-500">
                Where does <span className="font-medium text-ink-700">&ldquo;{title.trim()}&rdquo;</span> belong? You can skip this for now.
              </p>
            </div>

            <div role="radiogroup" aria-label="Category" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => {
                const Icon = categoryIcon(c.name);
                const active = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCategoryId(active ? null : c.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left text-sm font-medium transition sm:p-4",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15",
                      active ? "border-brand-500 bg-brand-50/60 text-brand-900 ring-1 ring-brand-500" : "border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50"
                    )}
                  >
                    <Icon size={26} aria-hidden />
                    {c.name}
                    {active && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-5 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep(0)} disabled={isSubmitting} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                Back
              </Button>
              <Button type="button" onClick={create} disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                )}
                {categoryId ? "Create course" : "Skip & create course"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-ink-500">
        Next you&apos;ll add a description, outcomes, cover image, chapters and pricing.
      </p>
    </div>
  );
};
