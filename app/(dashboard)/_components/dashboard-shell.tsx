"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

/** Lays out navbar / sidebar / content and animates them together when the sidebar collapses. */
export const DashboardShell = ({
  navbar,
  sidebar,
  children,
}: {
  navbar: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { collapsed } = useSidebar();
  const pad = collapsed ? "md:pl-[76px]" : "md:pl-64";

  return (
    <div className="h-full">
      <div className={cn("fixed inset-x-0 top-0 z-40 h-[80px] w-full transition-[padding] duration-300", pad)}>{navbar}</div>
      <aside
        className={cn(
          "fixed inset-y-0 z-50 hidden flex-col transition-[width] duration-300 ease-out md:flex",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        {sidebar}
      </aside>
      <main className={cn("h-full pt-[80px] transition-[padding] duration-300", pad)}>{children}</main>
    </div>
  );
};
