"use client";

import dynamic from "next/dynamic";

import type { BoardChapter, BoardSection } from "./curriculum-board";

// Drag-and-drop is browser-only and heavy: load the builder client-side in its own chunk.
const CurriculumBoard = dynamic(() => import("./curriculum-board").then((m) => m.CurriculumBoard), {
  ssr: false,
  loading: () => (
    <div className="space-y-3" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl bg-ink-100" />
      ))}
    </div>
  ),
});

interface ChaptersFormProps {
  courseId: string;
  sections: BoardSection[];
  chapters: BoardChapter[];
}

export const ChaptersForm = (props: ChaptersFormProps) => <CurriculumBoard {...props} />;
