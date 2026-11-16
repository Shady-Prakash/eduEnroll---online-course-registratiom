import { db } from "@/lib/db";

/**
 * Keep chapter.position in the same order students see:
 * lectures without a section first, then each section (by section order),
 * each group in its existing order. "Next lecture", progress and the
 * sidebar all rely on this single global order.
 */
export const normalizeChapterOrder = async (courseId: string) => {
  const [sections, chapters] = await Promise.all([
    db.section.findMany({ where: { courseId }, orderBy: { position: "asc" }, select: { id: true } }),
    db.chapter.findMany({ where: { courseId }, orderBy: { position: "asc" }, select: { id: true, position: true, sectionId: true } }),
  ]);

  const known = new Set(sections.map((s) => s.id));
  const ordered = [
    ...chapters.filter((c) => !c.sectionId || !known.has(c.sectionId)),
    ...sections.flatMap((s) => chapters.filter((c) => c.sectionId === s.id)),
  ];

  const updates = ordered
    .map((c, index) => ({ id: c.id, position: index + 1, changed: c.position !== index + 1 }))
    .filter((u) => u.changed);

  if (updates.length) {
    await db.$transaction(updates.map((u) => db.chapter.update({ where: { id: u.id }, data: { position: u.position } })));
  }
};
