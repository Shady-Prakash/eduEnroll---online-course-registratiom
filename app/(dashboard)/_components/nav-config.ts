import {
  BarChart3,
  BookOpen,
  Compass,
  LayoutDashboard,
  LucideIcon,
  PlusCircle,
  Sparkles,
  Star,
  UserCog,
  UserRound,
  Library,
} from "lucide-react";

import { FEATURES } from "@/lib/roles";

export type NavChild = { label: string; href: string; icon?: LucideIcon };
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  locked?: boolean;
  /** Expandable sub-pages (accordion when expanded, flyout when collapsed). */
  children?: NavChild[];
};
export type NavSection = { id: string; title: string; items: NavItem[] };

export const learnSections: NavSection[] = [
  {
    id: "learning",
    title: "Learning",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      {
        label: "Browse",
        href: "/search",
        icon: Compass,
        children: [
          { label: "All courses", href: "/search", icon: Library },
          { label: "Free courses", href: "/search?price=free", icon: Sparkles },
          { label: "Top rated", href: "/search?sort=rating", icon: Star },
        ],
      },
    ],
  },
];

export const teachSections = (superAdmin: boolean): NavSection[] => [
  {
    id: "teaching",
    title: "Teaching",
    items: [
      {
        label: "Courses",
        href: "/admin/courses",
        icon: BookOpen,
        children: [
          { label: "All courses", href: "/admin/courses", icon: Library },
          { label: "Create course", href: "/admin/courses/create", icon: PlusCircle },
        ],
      },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [{ label: "My profile", href: "/admin/profile", icon: UserRound }],
  },
  ...(superAdmin
    ? [
        {
          id: "admin",
          title: "Administration",
          items: [{ label: "Users", href: "/admin/users", icon: UserCog, locked: !FEATURES.userManagement }],
        },
      ]
    : []),
];
