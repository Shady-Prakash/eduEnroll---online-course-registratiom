"use client";

import Link from "next/link";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { CourseRow } from "./types";

export const CourseRowActions = ({ course }: { course: CourseRow }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-ink-500">
        <span className="sr-only">Actions for {course.title}</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44">
      <DropdownMenuItem asChild>
        <Link href={`/admin/courses/${course.id}`} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          Edit course
        </Link>
      </DropdownMenuItem>
      {course.isPublished && (
        <DropdownMenuItem asChild>
          <Link href={`/courses/${course.id}`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View as student
          </Link>
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);
