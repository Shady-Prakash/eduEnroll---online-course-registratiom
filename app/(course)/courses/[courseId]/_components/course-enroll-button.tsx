"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CourseEnrollButtonProps {
  price: number | null;
  courseId: string;
  chapterId?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export const CourseEnrollButton = ({
  price,
  courseId,
  chapterId,
  className,
  size = "default",
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isFree = !price || price <= 0;

  const onClick = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(`/api/courses/${courseId}/checkout`, { chapterId });
      // Keep the button in its loading state while the browser navigates away.
      window.location.assign(data.url);
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "string" && error.response.data
          ? error.response.data
          : "We couldn't start checkout. Please try again.";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size={size}
      aria-busy={isLoading}
      className={cn("w-full md:w-auto", className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          {isFree ? "Enrolling…" : "Redirecting to checkout…"}
        </>
      ) : (
        <>
          {!isFree && <Lock className="mr-2 h-4 w-4" aria-hidden />}
          {isFree ? "Enroll for free" : `Enroll for ${formatPrice(price)}`}
        </>
      )}
    </Button>
  );
};
