"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, MoreVertical, Rocket, Trash2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { errorMessage } from "./use-save";

interface PublishControlProps {
  entity: "course" | "chapter";
  isPublished: boolean;
  canPublish: boolean;
  missing: { id: string; label: string }[];
  baseUrl: string;            // e.g. /api/courses/:id or /api/courses/:id/chapters/:chapterId
  afterDeleteHref: string;
  previewHref?: string;
}

/**
 * Publish / unpublish + overflow menu (preview, delete).
 * When the item isn't ready, "Publish" opens a popover listing what's missing
 * (with jump links) instead of being a dead, disabled button.
 */
export const PublishControl = ({
  entity,
  isPublished,
  canPublish,
  missing,
  baseUrl,
  afterDeleteHref,
  previewHref,
}: PublishControlProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const togglePublish = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.patch(`${baseUrl}/unpublish`);
        toast(`${entity === "course" ? "Course" : "Chapter"} unpublished. Students can no longer see it.`, { icon: "🙈" });
      } else {
        await axios.patch(`${baseUrl}/publish`);
        toast.success(entity === "course" ? "Course published! Students can now enroll." : "Chapter published");
        if (entity === "course") confetti.onOpen();
      }
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(baseUrl);
      toast.success(`${entity === "course" ? "Course" : "Chapter"} deleted`);
      router.push(afterDeleteHref);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      setIsLoading(false);
    }
  };

  const publishButton = (
    <Button
      type="button"
      onClick={canPublish || isPublished ? togglePublish : undefined}
      disabled={isLoading}
      variant={isPublished ? "outline" : "default"}
      className="flex-1 sm:flex-none"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
      ) : isPublished ? (
        <EyeOff className="mr-2 h-4 w-4" aria-hidden />
      ) : (
        <Rocket className="mr-2 h-4 w-4" aria-hidden />
      )}
      {isPublished ? "Unpublish" : "Publish"}
    </Button>
  );

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      {previewHref && isPublished && (
        <Button asChild variant="outline" className="hidden sm:inline-flex">
          <Link href={previewHref}>
            <Eye className="mr-2 h-4 w-4" aria-hidden />
            Preview
          </Link>
        </Button>
      )}

      {canPublish || isPublished ? (
        publishButton
      ) : (
        <Popover>
          <PopoverTrigger asChild>{publishButton}</PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-4">
            <p className="flex items-center gap-x-2 text-sm font-semibold text-ink-900">
              <AlertCircle className="h-4 w-4 text-warning-500" aria-hidden />
              Almost there
            </p>
            <p className="mt-1 text-sm text-ink-500">Complete these before publishing:</p>
            <ul className="mt-3 space-y-1">
              {missing.map((item) => (
                <li key={item.label}>
                  <a href={`#${item.id}`} className="block rounded-md px-2 py-1.5 text-sm text-brand-700 hover:bg-brand-50">
                    → {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More actions" disabled={isLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {previewHref && isPublished && (
            <>
              <DropdownMenuItem asChild className="sm:hidden">
                <Link href={previewHref}>
                  <Eye className="mr-2 h-4 w-4" /> Preview as student
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
            </>
          )}
          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-danger-600 focus:bg-danger-50 focus:text-danger-700"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete {entity}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rendered outside the menu so it doesn't unmount when the menu closes. */}
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={onDelete}
        destructive
        title={`Delete this ${entity}?`}
        description={
          entity === "course"
            ? "The course, its chapters, videos and attachments will be permanently removed. Enrolled students will lose access."
            : "This chapter and its video will be permanently removed."
        }
        confirmLabel={`Delete ${entity}`}
      />
    </div>
  );
};
