"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { HoverTip } from "@/components/ui/hover-tip";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";
import { SidebarOrgSwitcher } from "./sidebar-org-switcher";
import { useSidebar } from "./sidebar-context";

interface SidebarProps {
  /** Mobile drawer: always full width, no collapse control. */
  forceExpanded?: boolean;
  onNavigate?: () => void;
}

export const Sidebar = ({ forceExpanded = false, onNavigate }: SidebarProps) => {
  const { collapsed: c, toggle } = useSidebar();
  const collapsed = !forceExpanded && c;

  return (
    <div className="flex h-full flex-col border-r border-ink-200 bg-white">
      {/* Brand */}
      <div className={cn("flex h-[80px] shrink-0 items-center border-b border-ink-100", collapsed ? "justify-center px-2" : "px-5")}>
        <Link href="/" onClick={onNavigate} aria-label="eduEnroll home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40">
          <BrandLogo showWordmark={!collapsed} />
        </Link>
      </div>

      {/* Navigation (scrolls; tooltips/flyouts render in a portal so they aren't clipped) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      {!collapsed && <SidebarOrgSwitcher />}

      {/* Collapse toggle (desktop only) */}
      {!forceExpanded && (
        <div className={cn("shrink-0 border-t border-ink-100 p-3", collapsed && "flex justify-center")}>
          <HoverTip label="Expand sidebar (Ctrl/⌘ B)" disabled={!collapsed}>
            <button
              type="button"
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className={cn(
                "flex items-center gap-x-2 rounded-lg text-sm font-medium text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                collapsed ? "h-11 w-11 justify-center" : "w-full px-3 py-2.5"
              )}
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" aria-hidden /> : <PanelLeftClose className="h-5 w-5" aria-hidden />}
              {!collapsed && (
                <>
                  Collapse
                  <kbd className="ml-auto rounded border border-ink-200 px-1.5 font-mono text-3xs text-ink-400">⌘B</kbd>
                </>
              )}
            </button>
          </HoverTip>
        </div>
      )}
    </div>
  );
};
