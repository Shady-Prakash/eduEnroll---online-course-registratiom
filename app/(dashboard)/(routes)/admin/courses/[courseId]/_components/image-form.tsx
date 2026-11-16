"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useSave } from "../../../_components/use-save";

interface ImageFormProps {
  courseId: string;
  initialData: { imageUrl: string | null; title: string };
}

export const ImageForm = ({ courseId, initialData }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(!initialData.imageUrl);
  const { save } = useSave(`/api/courses/${courseId}`);

  if (initialData.imageUrl && !isEditing) {
    return (
      <div className="space-y-3">
        <div className="group relative aspect-video overflow-hidden rounded-lg bg-ink-100 ring-1 ring-ink-200">
          <Image
            src={initialData.imageUrl}
            alt={`Cover image for ${initialData.title}`}
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">Shown on course cards, search results and checkout.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
            Replace image
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/60 p-2">
        <FileUpload
          endpoint="courseImage"
          onChange={async (url) => {
            if (url && (await save({ imageUrl: url }, "Cover image updated"))) setIsEditing(false);
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-x-1.5 text-xs text-ink-500">
          <ImagePlus className="h-3.5 w-3.5" aria-hidden />
          16:9 recommended (e.g. 1280×720), JPG or PNG, up to 4MB.
        </p>
        {initialData.imageUrl && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <X className="mr-1 h-4 w-4" aria-hidden /> Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
