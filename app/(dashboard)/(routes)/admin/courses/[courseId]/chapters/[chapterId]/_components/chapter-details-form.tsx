"use client";

import { useState } from "react";

import { Editor } from "@/components/editor";
import { hasRichContent } from "@/lib/rich-text";
import { Field, SaveBar, fieldClass } from "../../../../../_components/form-bits";
import { useSave } from "../../../../../_components/use-save";

interface ChapterDetailsFormProps {
  courseId: string;
  chapterId: string;
  initialData: { title: string; description: string | null };
}


/** Chapter title + rich-text description in one form with a single save. */
export const ChapterDetailsForm = ({ courseId, chapterId, initialData }: ChapterDetailsFormProps) => {
  const initial = { title: initialData.title, description: initialData.description ?? "" };
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [saved, setSaved] = useState(initial);
  const { save, isSaving } = useSave(`/api/courses/${courseId}/chapters/${chapterId}`);

  const titleError = title.trim().length === 0 ? "Title is required" : undefined;
  const descDirty =
    description !== saved.description && !(!hasRichContent(description) && !hasRichContent(saved.description));
  const dirty = title !== saved.title || descDirty;

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (titleError) return;
        const ok = await save(
          { title: title.trim(), description: hasRichContent(description) ? description : null },
          "Chapter saved"
        );
        if (ok) setSaved({ title: title.trim(), description });
      }}
    >
      <Field label="Chapter title" htmlFor="chapter-title" error={dirty ? titleError : undefined} counter={{ value: title.length, max: 160 }}>
        <input
          id="chapter-title"
          value={title}
          maxLength={160}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Week 2: UX research and personas"
          className={fieldClass}
        />
      </Field>

      <div className="space-y-1.5">
        <span className="text-sm font-medium text-ink-700">Description</span>
        <Editor
          value={description}
          onChange={setDescription}
          placeholder="Summarise the lesson, key concepts, readings or tasks…"
        />
        <p className="text-xs text-ink-500">Tip: embed a YouTube/Vimeo clip or a diagram to support the main lesson video.</p>
      </div>

      <SaveBar
        dirty={dirty && !titleError}
        saving={isSaving}
        onReset={() => { setTitle(saved.title); setDescription(saved.description); }}
      />
    </form>
  );
};
