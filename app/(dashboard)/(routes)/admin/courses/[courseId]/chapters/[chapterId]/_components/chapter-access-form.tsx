"use client";

import { useState } from "react";
import { Eye, Lock } from "lucide-react";

import { Switch } from "../../../../../_components/form-bits";
import { useSave } from "../../../../../_components/use-save";

interface ChapterAccessFormProps {
  courseId: string;
  chapterId: string;
  initialData: { isFree: boolean };
}

/** Free-preview toggle: saves instantly (optimistic, reverts on error). */
export const ChapterAccessForm = ({ courseId, chapterId, initialData }: ChapterAccessFormProps) => {
  const [isFree, setIsFree] = useState(initialData.isFree);
  const { save, isSaving } = useSave(`/api/courses/${courseId}/chapters/${chapterId}`);

  const onToggle = async (next: boolean) => {
    setIsFree(next);
    const ok = await save(
      { isFree: next },
      next ? "Free preview on. Anyone can watch this chapter." : "Free preview off. Enrolled students only."
    );
    if (!ok) setIsFree(!next);
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-x-3">
        <span className={isFree ? "mt-0.5 text-highlight-600" : "mt-0.5 text-ink-400"}>
          {isFree ? <Eye className="h-5 w-5" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}
        </span>
        <div>
          <label htmlFor="free-preview" className="text-sm font-medium text-ink-900">
            Free preview
          </label>
          <p id="free-preview-desc" className="mt-0.5 text-sm text-ink-500">
            {isFree
              ? "Anyone can watch this chapter without enrolling. Great for an intro or week 1."
              : "Only enrolled students can watch this chapter."}
          </p>
        </div>
      </div>
      <Switch
        id="free-preview"
        checked={isFree}
        onCheckedChange={onToggle}
        disabled={isSaving}
        aria-describedby="free-preview-desc"
      />
    </div>
  );
};
