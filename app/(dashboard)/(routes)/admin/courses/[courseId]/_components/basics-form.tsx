"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { COURSE_LEVELS } from "@/lib/validations/course";
import { cn } from "@/lib/utils";
import { Field, SaveBar, fieldClass } from "../../../_components/form-bits";
import { useSave } from "../../../_components/use-save";

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  subtitle: z.string().trim().max(160, "Keep it under 160 characters"),
  code: z.string().trim().max(20, "Keep it under 20 characters"),
  term: z.string().trim().max(60, "Keep it under 60 characters"),
  categoryId: z.string(),
  level: z.string(),
});

type Values = z.infer<typeof schema>;

interface BasicsFormProps {
  courseId: string;
  initialData: {
    title: string;
    subtitle: string | null;
    code: string | null;
    term: string | null;
    categoryId: string | null;
    level: string | null;
  };
  categories: { id: string; name: string }[];
}

/** Title, subtitle (Udemy-style landing page) + unit code, term (Moodle-style) + category & level. */
export const BasicsForm = ({ courseId, initialData, categories }: BasicsFormProps) => {
  const { save, isSaving } = useSave(`/api/courses/${courseId}`);

  const defaults: Values = {
    title: initialData.title,
    subtitle: initialData.subtitle ?? "",
    code: initialData.code ?? "",
    term: initialData.term ?? "",
    categoryId: initialData.categoryId ?? "",
    level: initialData.level ?? "",
  };

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults });
  const { register, handleSubmit, formState, watch, reset } = form;
  const { errors, isDirty } = formState;

  const onSubmit = async (values: Values) => {
    const ok = await save(
      {
        title: values.title,
        subtitle: values.subtitle,
        code: values.code,
        term: values.term,
        categoryId: values.categoryId || null,
        level: values.level || null,
      },
      "Course details saved"
    );
    if (ok) reset(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field
        label="Course title"
        htmlFor="title"
        error={errors.title?.message}
        counter={{ value: watch("title").length, max: 120 }}
      >
        <input id="title" className={fieldClass} placeholder="e.g. User Experience and Mobile App Development" {...register("title")} />
      </Field>

      <Field
        label="Subtitle"
        htmlFor="subtitle"
        optional
        hint="One line that sells the course on its card and landing page."
        error={errors.subtitle?.message}
        counter={{ value: watch("subtitle").length, max: 160 }}
      >
        <input id="subtitle" className={fieldClass} placeholder="e.g. Design, prototype and test mobile apps people love" {...register("subtitle")} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Unit code" htmlFor="code" optional hint="Shown on cards and searchable, e.g. ICT725." error={errors.code?.message}>
          <input
            id="code"
            className={cn(fieldClass, "uppercase placeholder:normal-case")}
            placeholder="e.g. ICT725"
            autoCapitalize="characters"
            {...register("code")}
          />
        </Field>
        <Field label="Teaching period" htmlFor="term" optional error={errors.term?.message}>
          <input id="term" className={fieldClass} placeholder="e.g. Trimester 3, 2026" {...register("term")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="categoryId" hint="Helps students find your course.">
          <select id="categoryId" className={fieldClass} {...register("categoryId")}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Level" htmlFor="level" optional>
          <select id="level" className={fieldClass} {...register("level")}>
            <option value="">Select a level</option>
            {COURSE_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <SaveBar dirty={isDirty} saving={isSaving} onReset={() => reset(defaults)} />
    </form>
  );
};
