"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { cn } from "@/lib/utils";

interface CourseProgressButtonProps {
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
}

export const CourseProgressButton = ({
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
}: CourseProgressButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
        isCompleted: !isCompleted
      });

      if (isCompleted) {
        toast("Marked as not completed", { icon: "↩️" });
      } else if (nextChapterId) {
        toast.success("Chapter completed. On to the next one!");
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      } else {
        confetti.onOpen();
        toast.success("Course completed! 🎉");
      }

      router.refresh();
    } catch {
      toast.error("Couldn't update your progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      type="button"
      size="lg"
      variant={isCompleted ? "outline" : "success"}
      aria-pressed={!!isCompleted}
      className={cn("w-full lg:w-auto", isCompleted && "text-ink-700")}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
      ) : isCompleted ? (
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
      ) : (
        <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
      )}
      {isCompleted ? "Mark as not completed" : nextChapterId ? "Complete & continue" : "Complete course"}
    </Button>
  );
};
