"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  FolderInput,
  FolderPlus,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Video,
  VideoOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { cn } from "@/lib/utils";
import { formatClock, formatLength } from "@/lib/duration";
import { fieldClass } from "../../../_components/form-bits";
import { errorMessage } from "../../../_components/use-save";

export type BoardChapter = {
  id: string;
  title: string;
  isPublished: boolean;
  isFree: boolean;
  videoUrl: string | null;
  duration: number | null;
  sectionId: string | null;
};
export type BoardSection = { id: string; title: string };

type Group = { id: string | null; title: string; chapters: BoardChapter[] };

const UNASSIGNED = "unassigned";

const buildGroups = (sections: BoardSection[], chapters: BoardChapter[]): Group[] => {
  const known = new Set(sections.map((s) => s.id));
  const groups: Group[] = [];
  const unassigned = chapters.filter((c) => !c.sectionId || !known.has(c.sectionId));
  if (unassigned.length || !sections.length) groups.push({ id: null, title: "Unassigned lectures", chapters: unassigned });
  sections.forEach((s) => groups.push({ id: s.id, title: s.title, chapters: chapters.filter((c) => c.sectionId === s.id) }));
  return groups;
};

interface CurriculumBoardProps {
  courseId: string;
  sections: BoardSection[];
  chapters: BoardChapter[];
}

/** Udemy-style curriculum builder: sections → lectures, drag & drop + touch-friendly controls. */
export const CurriculumBoard = ({ courseId, sections, chapters }: CurriculumBoardProps) => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>(() => buildGroups(sections, chapters));
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionDraft, setSectionDraft] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newLecture, setNewLecture] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  useEffect(() => setGroups(buildGroups(sections, chapters)), [sections, chapters]);

  const hasSections = sections.length > 0;
  const realSections = useMemo(() => groups.filter((g) => g.id), [groups]);
  const total = chapters.length;
  const totalLength = chapters.reduce((sum, c) => sum + (c.duration ?? 0), 0);

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    try {
      setBusy(true);
      await fn();
      if (success) toast.success(success);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      setGroups(buildGroups(sections, chapters)); // roll back optimistic UI
      return false;
    } finally {
      setBusy(false);
    }
  };

  /** Persist the full lecture order (+ section membership) after any move. */
  const saveOrder = (next: Group[]) => {
    setGroups(next);
    let position = 0;
    const list = next.flatMap((g) => g.chapters.map((c) => ({ id: c.id, position: position++, sectionId: g.id })));
    return run(() => axios.put(`/api/courses/${courseId}/chapters/reorder`, { list }), "Curriculum updated");
  };

  const moveChapter = (fromGroup: number, fromIndex: number, toGroup: number, toIndex: number) => {
    const next = groups.map((g) => ({ ...g, chapters: [...g.chapters] }));
    const [item] = next[fromGroup].chapters.splice(fromIndex, 1);
    next[toGroup].chapters.splice(toIndex, 0, { ...item, sectionId: next[toGroup].id });
    return saveOrder(next);
  };

  const onDragEnd = (r: DropResult) => {
    if (!r.destination) return;
    const from = groups.findIndex((g) => (g.id ?? UNASSIGNED) === r.source.droppableId);
    const to = groups.findIndex((g) => (g.id ?? UNASSIGNED) === r.destination!.droppableId);
    if (from === to && r.source.index === r.destination.index) return;
    moveChapter(from, r.source.index, to, r.destination.index);
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const ids = realSections.map((s) => s.id!);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const reordered = ids.map((id) => groups.find((g) => g.id === id)!);
    const next = [...groups.filter((g) => !g.id), ...reordered];
    setGroups(next);
    run(
      () => axios.put(`/api/courses/${courseId}/sections/reorder`, { list: ids.map((id, i) => ({ id, position: i + 1 })) }),
      "Section order saved"
    ); // the server also renumbers lectures to match the new section order
  };

  const addSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSection.trim();
    if (!title) return;
    if (await run(() => axios.post(`/api/courses/${courseId}/sections`, { title }), `Section "${title}" added`)) setNewSection("");
  };

  const renameSection = async (id: string) => {
    const title = sectionDraft.trim();
    setEditingSection(null);
    if (!title || title === groups.find((g) => g.id === id)?.title) return;
    await run(() => axios.patch(`/api/courses/${courseId}/sections/${id}`, { title }), "Section renamed");
  };

  const addLecture = async (e: React.FormEvent, sectionId: string | null) => {
    e.preventDefault();
    const key = sectionId ?? UNASSIGNED;
    const title = (newLecture[key] ?? "").trim();
    if (!title) return;
    if (await run(() => axios.post(`/api/courses/${courseId}/chapters`, { title, sectionId }), `Lecture "${title}" added`)) {
      setNewLecture((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div className={cn("space-y-4", busy && "pointer-events-none")}>
      {/* Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500">
        <span className="tabular-nums">
          {hasSections && <>{sections.length} section{sections.length === 1 ? "" : "s"} · </>}
          {total} lecture{total === 1 ? "" : "s"}
          {formatLength(totalLength) && <> · {formatLength(totalLength)} total</>}
        </span>
        <span className="flex items-center gap-x-1.5">
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" aria-hidden />}
          <span className="hidden sm:inline">Drag lectures between sections</span>
        </span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {groups.map((group, gIndex) => {
          const key = group.id ?? UNASSIGNED;
          const isCollapsed = collapsed.has(key);
          const sectionIndex = realSections.findIndex((s) => s.id === group.id);
          const length = group.chapters.reduce((sum, c) => sum + (c.duration ?? 0), 0);
          const showHeader = hasSections;

          return (
            <div
              key={key}
              className={cn(
                "overflow-hidden rounded-xl border",
                group.id ? "border-ink-200 bg-ink-50/70" : "border-dashed border-ink-300 bg-white"
              )}
            >
              {showHeader && (
                <div className="flex items-center gap-2 border-b border-ink-200 bg-white px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                  >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    {group.id && editingSection === group.id ? (
                      <input
                        autoFocus
                        value={sectionDraft}
                        maxLength={160}
                        onChange={(e) => setSectionDraft(e.target.value)}
                        onBlur={() => renameSection(group.id!)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameSection(group.id!);
                          if (e.key === "Escape") setEditingSection(null);
                        }}
                        className={cn(fieldClass, "h-9")}
                        aria-label="Section title"
                      />
                    ) : (
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {group.id ? (
                          <>
                            <span className="text-ink-400">Section {sectionIndex + 1}:</span> {group.title}
                          </>
                        ) : (
                          <span className="text-ink-500">Unassigned lectures</span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-ink-500 tabular-nums">
                      {group.chapters.length} lecture{group.chapters.length === 1 ? "" : "s"}
                      {formatLength(length) && <> · {formatLength(length)}</>}
                    </p>
                  </div>

                  {group.id && (
                    <div className="flex shrink-0 items-center">
                      <button type="button" onClick={() => moveSection(sectionIndex, -1)} disabled={sectionIndex === 0} className="rounded p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30" aria-label="Move section up">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveSection(sectionIndex, 1)} disabled={sectionIndex === realSections.length - 1} className="rounded p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30" aria-label="Move section down">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => { setEditingSection(group.id); setSectionDraft(group.title); }} className="rounded p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Rename section">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(group)} className="rounded p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-600" aria-label="Delete section">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isCollapsed && (
                <div className="space-y-2 p-2 sm:p-3">
                  <Droppable droppableId={key}>
                    {(provided, snapshot) => (
                      <ol
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "min-h-[8px] space-y-2 rounded-lg transition-colors",
                          snapshot.isDraggingOver && "bg-brand-50 ring-2 ring-dashed ring-brand-300"
                        )}
                      >
                        {group.chapters.map((chapter, index) => (
                          <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                            {(drag, dragSnap) => (
                              <li
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                className={cn(
                                  "group flex items-stretch overflow-hidden rounded-lg border bg-white",
                                  dragSnap.isDragging ? "border-brand-300 shadow-lg ring-2 ring-brand-500/20" : "border-ink-200 hover:border-ink-300"
                                )}
                              >
                                <div {...drag.dragHandleProps} className="flex w-8 shrink-0 cursor-grab items-center justify-center border-r border-ink-100 bg-ink-50 text-ink-400 hover:text-ink-600" aria-label={`Drag ${chapter.title}`}>
                                  <GripVertical className="h-4 w-4" />
                                </div>

                                <Link href={`/admin/courses/${courseId}/chapters/${chapter.id}`} className="flex min-w-0 flex-1 items-center gap-x-3 px-3 py-2.5">
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-ink-900 group-hover:text-brand-700">{chapter.title}</span>
                                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                      <span className={cn("inline-flex items-center gap-x-1 rounded-full px-1.5 py-px font-medium", chapter.isPublished ? "bg-success-50 text-success-700" : "bg-ink-100 text-ink-500")}>
                                        <span className={cn("h-1.5 w-1.5 rounded-full", chapter.isPublished ? "bg-success-500" : "bg-ink-400")} />
                                        {chapter.isPublished ? "Published" : "Draft"}
                                      </span>
                                      {chapter.isFree && (
                                        <span className="inline-flex items-center gap-x-1 text-highlight-700"><Eye className="h-3 w-3" aria-hidden /> Preview</span>
                                      )}
                                      <span className={cn("inline-flex items-center gap-x-1", chapter.videoUrl ? "text-ink-500" : "text-warning-700")}>
                                        {chapter.videoUrl ? <Video className="h-3 w-3" aria-hidden /> : <VideoOff className="h-3 w-3" aria-hidden />}
                                        {chapter.videoUrl ? formatClock(chapter.duration) ?? "Processing" : "No video"}
                                      </span>
                                    </span>
                                  </span>
                                </Link>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button type="button" className="flex w-10 shrink-0 items-center justify-center border-l border-ink-100 text-ink-400 hover:bg-ink-50 hover:text-ink-700" aria-label={`Actions for ${chapter.title}`}>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/admin/courses/${courseId}/chapters/${chapter.id}`}><Pencil className="mr-2 h-4 w-4" /> Edit lecture</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={index === 0} onSelect={() => moveChapter(gIndex, index, gIndex, index - 1)}>
                                      <ChevronUp className="mr-2 h-4 w-4" /> Move up
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={index === group.chapters.length - 1} onSelect={() => moveChapter(gIndex, index, gIndex, index + 1)}>
                                      <ChevronDown className="mr-2 h-4 w-4" /> Move down
                                    </DropdownMenuItem>
                                    {hasSections && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="flex items-center gap-x-1.5 text-xs font-medium text-ink-500">
                                          <FolderInput className="h-3.5 w-3.5" /> Move to section
                                        </DropdownMenuLabel>
                                        {groups.map((target, tIndex) =>
                                          tIndex === gIndex ? null : (
                                            <DropdownMenuItem key={target.id ?? UNASSIGNED} onSelect={() => moveChapter(gIndex, index, tIndex, target.chapters.length)}>
                                              <span className="truncate">{target.id ? target.title : "Unassigned"}</span>
                                            </DropdownMenuItem>
                                          )
                                        )}
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ol>
                    )}
                  </Droppable>

                  {group.chapters.length === 0 && (
                    <p className="px-2 py-1 text-xs text-ink-400">No lectures yet. Add one below or drag one here.</p>
                  )}

                  <form onSubmit={(e) => addLecture(e, group.id)} className="flex flex-col gap-2 sm:flex-row">
                    <label htmlFor={`new-lecture-${key}`} className="sr-only">New lecture title</label>
                    <input
                      id={`new-lecture-${key}`}
                      value={newLecture[key] ?? ""}
                      onChange={(e) => setNewLecture((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={group.id ? `Add a lecture to "${group.title}"` : `Lecture ${total + 1} title`}
                      maxLength={160}
                      className={cn(fieldClass, "h-10")}
                    />
                    <Button type="submit" variant="outline" disabled={!(newLecture[key] ?? "").trim()} className="h-10 shrink-0">
                      <Plus className="mr-1.5 h-4 w-4" aria-hidden /> Lecture
                    </Button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </DragDropContext>

      {/* Add section */}
      <form onSubmit={addSection} className="flex flex-col gap-2 rounded-xl border border-dashed border-ink-300 bg-white p-3 sm:flex-row sm:items-center">
        <FolderPlus className="hidden h-5 w-5 shrink-0 text-ink-400 sm:block" aria-hidden />
        <label htmlFor="new-section" className="sr-only">New section title</label>
        <input
          id="new-section"
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          placeholder={hasSections ? `Section ${sections.length + 1} title, e.g. "Week ${sections.length + 1}: Prototyping"` : 'Group lectures into sections, e.g. "Week 1: Introduction"'}
          maxLength={160}
          className={cn(fieldClass, "h-10")}
        />
        <Button type="submit" disabled={!newSection.trim()} className="h-10 shrink-0">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> Section
        </Button>
      </form>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        destructive
        title={`Delete "${deleteTarget?.title}"?`}
        description="The section is removed. Its lectures are kept and moved to “Unassigned lectures”."
        confirmLabel="Delete section"
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (target?.id) run(() => axios.delete(`/api/courses/${courseId}/sections/${target.id}`), "Section deleted");
        }}
      />
    </div>
  );
};
