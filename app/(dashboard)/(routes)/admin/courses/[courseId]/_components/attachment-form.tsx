"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { FileText, Loader2, Plus, Trash2, X } from "lucide-react";
import { Attachment } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { errorMessage } from "../../../_components/use-save";

interface AttachmentFormProps {
  courseId: string;
  attachments: Attachment[];
}

/** Course resources (Moodle-style files): list + upload. */
export const AttachmentForm = ({ courseId, attachments }: AttachmentFormProps) => {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(attachments.length === 0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onUploaded = async (url?: string, name?: string) => {
    if (!url) return;
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, { url, name });
      toast.success("Resource added");
      setIsAdding(false);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success("Resource removed");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {attachments.length > 0 && (
        <ul className="divide-y divide-ink-100 rounded-lg border border-ink-200">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-x-3 px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <FileText className="h-4 w-4" aria-hidden />
              </span>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm font-medium text-ink-800 hover:text-brand-700"
                title={a.name}
              >
                {a.name}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-ink-400 hover:bg-danger-50 hover:text-danger-600"
                onClick={() => onDelete(a.id)}
                disabled={deletingId === a.id}
                aria-label={`Remove ${a.name}`}
              >
                {deletingId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {isAdding ? (
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/60 p-2">
            <FileUpload endpoint="courseAttachment" onChange={onUploaded} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-ink-500">Slides, readings, templates: anything students need for the unit.</p>
            {attachments.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                <X className="mr-1 h-4 w-4" aria-hidden /> Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Add resource
        </Button>
      )}
    </div>
  );
};
