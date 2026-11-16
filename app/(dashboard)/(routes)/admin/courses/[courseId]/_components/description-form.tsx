"use client";

import { useState } from "react";

import { Editor } from "@/components/editor";
import { hasRichContent } from "@/lib/rich-text";
import { SaveBar } from "../../../_components/form-bits";
import { useSave } from "../../../_components/use-save";

interface DescriptionFormProps {
  courseId: string;
  initialData: { description: string | null };
}


export const DescriptionForm = ({ courseId, initialData }: DescriptionFormProps) => {
  const initial = initialData.description ?? "";
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const { save, isSaving } = useSave(`/api/courses/${courseId}`);

  // Quill emits "<p><br></p>" for an empty editor, so compare visible text too.
  const dirty = value !== saved && !(!hasRichContent(value) && !hasRichContent(saved));

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await save({ description: hasRichContent(value) ? value : null }, "Description saved")) {
          setSaved(value);
        }
      }}
    >
      <Editor
        value={value}
        onChange={setValue}
        placeholder="What will students learn? Who is it for? Any prerequisites?"
      />
      <p className="text-xs text-ink-500">
        Tip: use headings and bullet lists to make it easy to scan. You can also embed a YouTube or Vimeo intro video.
      </p>
      <SaveBar dirty={dirty} saving={isSaving} onReset={() => setValue(saved)} />
    </form>
  );
};
