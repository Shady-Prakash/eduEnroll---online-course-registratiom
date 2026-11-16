/** Flattened, serialisable row for the teacher's course table. */
export type CourseRow = {
  id: string;
  title: string;
  code: string | null;
  /** The viewer's role on this course. */
  role: "owner" | "co";
  imageUrl: string | null;
  price: number | null;
  isPublished: boolean;
  category: string | null;
  chaptersTotal: number;
  chaptersPublished: number;
  updatedAt: Date;
};

export type StatusFilter = "all" | "published" | "draft";
