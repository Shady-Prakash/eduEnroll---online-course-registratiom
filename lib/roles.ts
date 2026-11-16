/**
 * Role-based access for the LMS, derived from the user's Clerk organization role.
 *
 *  Clerk org role      →  App role      →  Portal access
 *  org:super_admin     →  super_admin   →  Teacher portal (+ org management)
 *  org:admin           →  teacher       →  Teacher portal
 *  org:member / none   →  student       →  Student portal
 *
 * Teachers can also open the student portal (to preview courses).
 * Students can never open the teacher portal (/admin) or teacher APIs.
 */
export type AppRole = "super_admin" | "teacher" | "student";

export const getAppRole = (orgRole?: string | null): AppRole => {
  if (orgRole === "org:super_admin") return "super_admin";
  if (orgRole === "org:admin") return "teacher";
  return "student";
};

/** Can create/edit/publish courses and open the teacher portal (/admin). */
export const isTeacher = (orgRole?: string | null) =>
  getAppRole(orgRole) !== "student";

export const isSuperAdmin = (orgRole?: string | null) =>
  getAppRole(orgRole) === "super_admin";

/** Feature flags for areas that are not open yet. */
export const FEATURES = {
  userManagement: false,
} as const;
