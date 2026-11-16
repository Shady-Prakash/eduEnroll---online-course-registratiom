import * as z from "zod";

export const COURSE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all", label: "All levels" },
] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number]["value"];

export const levelLabel = (level?: string | null) =>
  COURSE_LEVELS.find((l) => l.value === level)?.label ?? null;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters`)
    .transform((v) => (v === "" ? null : v))
    .nullable();

/** Fields a teacher may change on a course via PATCH /api/courses/:id (whitelist). */
export const courseUpdateSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
    code: optionalText(20).transform((v) => (v ? v.toUpperCase().replace(/\s+/g, "") : v)),
    term: optionalText(60),
    subtitle: optionalText(160),
    level: z.enum(["beginner", "intermediate", "advanced", "all"]).nullable(),
    outcomes: z
      .array(z.string().trim().min(1).max(160))
      .max(12, "Up to 12 outcomes")
      .nullable(),
    description: z.string().max(20000).nullable(),
    imageUrl: z.string().url().nullable(),
    categoryId: z.string().min(1).nullable(),
    price: z.coerce.number().min(0, "Price can't be negative").max(100000).nullable(),
    salePrice: z.coerce.number().min(0, "Sale price can't be negative").max(100000).nullable(),
    saleEndsAt: z.coerce.date().nullable(),
  })
  .partial()
  .strict();

export const courseCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  code: optionalText(20)
    .optional()
    .transform((v) => (v ? v.toUpperCase().replace(/\s+/g, "") : null)),
  categoryId: z.string().min(1).nullable().optional(),
});

/** Fields a teacher may change on a chapter via PATCH (whitelist). */
export const chapterUpdateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(160),
    description: z.string().max(20000).nullable(),
    videoUrl: z.string().url().nullable(),
    isFree: z.boolean(),
    sectionId: z.string().min(1).nullable(),
  })
  .partial()
  .strict();

export const parseOutcomes = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
