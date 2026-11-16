"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  /** Trigger element (uncontrolled usage). Omit when controlling with `open`. */
  children?: React.ReactNode;
  onConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
};

export const ConfirmModal = ({
  children,
  onConfirm,
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Continue",
  destructive = false,
}: ConfirmModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(destructive && "bg-danger-600 text-white hover:bg-danger-700")}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
