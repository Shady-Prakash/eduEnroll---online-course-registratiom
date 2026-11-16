"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import axios from "axios";
import toast from "react-hot-toast";
import { Crown, Loader2, LogOut, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { cn } from "@/lib/utils";
import { fieldClass } from "../../../_components/form-bits";
import { errorMessage } from "../../../_components/use-save";

export type TeacherRow = {
  userId: string;
  name: string;
  email: string | null;
  imageUrl: string | null;
  role: "owner" | "co";
  isYou: boolean;
};

interface InstructorsFormProps {
  courseId: string;
  teachers: TeacherRow[];
  viewerRole: "owner" | "co";
}

/** Collaborative teaching: owner invites co-teachers by email; co-teachers can leave. */
export const InstructorsForm = ({ courseId, teachers, viewerRole }: InstructorsFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<TeacherRow | null>(null);
  const isOwner = viewerRole === "owner";

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy("add");
      const { data } = await axios.post(`/api/courses/${courseId}/instructors`, { email });
      toast.success(`${data.name} can now edit this course`);
      setEmail("");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (t: TeacherRow) => {
    try {
      setBusy(t.userId);
      await axios.delete(`/api/courses/${courseId}/instructors/${t.userId}`);
      if (t.isYou) {
        toast.success("You left the course");
        router.push("/admin/courses");
      } else {
        toast.success(`${t.name} removed`);
      }
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-ink-100 rounded-lg border border-ink-200">
        {teachers.map((t) => (
          <li key={t.userId} className="flex items-center gap-3 px-3 py-2.5">
            {t.imageUrl ? (
              <Image src={t.imageUrl} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-iris-600 text-sm font-semibold text-white">
                {t.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-x-1.5 truncate text-sm font-medium text-ink-900">
                {t.name}
                {t.isYou && <span className="text-xs font-normal text-ink-400">(you)</span>}
              </p>
              {t.email && <p className="truncate text-xs text-ink-500">{t.email}</p>}
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-medium",
                t.role === "owner" ? "bg-warning-50 text-warning-800" : "bg-highlight-50 text-highlight-700"
              )}
            >
              {t.role === "owner" && <Crown className="h-3 w-3" aria-hidden />}
              {t.role === "owner" ? "Owner" : "Co-teacher"}
            </span>
            {t.role === "co" && (isOwner || t.isYou) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-ink-400 hover:bg-danger-50 hover:text-danger-600"
                onClick={() => setConfirm(t)}
                disabled={busy !== null}
                aria-label={t.isYou ? "Leave course" : `Remove ${t.name}`}
              >
                {busy === t.userId ? <Loader2 className="h-4 w-4 animate-spin" /> : t.isYou ? <LogOut className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            )}
          </li>
        ))}
      </ul>

      {isOwner ? (
        <form onSubmit={add} className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="teacher-email" className="sr-only">Teacher email</label>
            <input
              id="teacher-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@koi.edu.au"
              className={cn(fieldClass, "h-10")}
            />
            <Button type="submit" disabled={!email.trim() || busy !== null} className="h-10 shrink-0">
              {busy === "add" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <UserPlus className="mr-1.5 h-4 w-4" aria-hidden />}
              Add teacher
            </Button>
          </div>
          <p className="text-xs text-ink-500">
            Co-teachers can edit details, curriculum, lectures, resources and captions. Publishing, pricing, teachers and deletion stay with you.
            They need an eduEnroll account and the teacher role.
          </p>
        </form>
      ) : (
        <p className="text-xs text-ink-500">You&apos;re a co-teacher: you can edit content. The owner manages publishing, pricing and teachers.</p>
      )}

      <ConfirmModal
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        destructive
        title={confirm?.isYou ? "Leave this course?" : `Remove ${confirm?.name}?`}
        description={confirm?.isYou ? "You'll lose edit access to this course." : "They'll no longer be able to edit this course."}
        confirmLabel={confirm?.isYou ? "Leave course" : "Remove teacher"}
        onConfirm={() => {
          const t = confirm;
          setConfirm(null);
          if (t) remove(t);
        }}
      />
    </div>
  );
};
