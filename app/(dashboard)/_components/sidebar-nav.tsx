"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ChevronDown, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { isSuperAdmin, isTeacher } from "@/lib/roles";
import { HoverFlyout, HoverTip } from "@/components/ui/hover-tip";
import { learnSections, NavItem, NavSection, teachSections } from "./nav-config";

const SECTION_KEY = (id: string) => `eduenroll:nav:section:${id}`;

/** How well an href matches the current URL: -1 no match, higher = more specific. */
const useMatcher = () => {
  const pathname = usePathname() ?? "/";
  const params = useSearchParams();
  return (href: string) => {
    const [path, query] = href.split("?");
    const wanted = new URLSearchParams(query ?? "");
    for (const [k, v] of Array.from(wanted.entries())) if (params.get(k) !== v) return -1;
    if (pathname === path) return 100 + Array.from(wanted.keys()).length;
    if (path !== "/" && pathname.startsWith(`${path}/`)) return path.length;
    return -1;
  };
};

const bestChild = (item: NavItem, score: (href: string) => number) => {
  let best: string | null = null;
  let bestScore = -1;
  item.children?.forEach((c) => {
    const s = score(c.href);
    if (s > bestScore) [best, bestScore] = [c.href, s];
  });
  return best;
};

interface SidebarNavProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

/** Sectioned, collapsible navigation. Collapsed = icon rail with hover labels & flyouts. */
export const SidebarNav = ({ collapsed, onNavigate }: SidebarNavProps) => {
  const pathname = usePathname();
  const { orgRole } = useAuth();
  const score = useMatcher();

  const teachMode = pathname?.startsWith("/admin") && isTeacher(orgRole);
  const sections: NavSection[] = teachMode ? teachSections(isSuperAdmin(orgRole)) : learnSections;

  // Section open/closed (persisted); item accordions (default open when a child is active).
  const [closedSections, setClosedSections] = useState<Set<string>>(new Set());
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setClosedSections(new Set(sections.map((s) => s.id).filter((id) => localStorage.getItem(SECTION_KEY(id)) === "0")));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teachMode]);

  useEffect(() => {
    // Auto-expand the parent of the current page.
    sections.forEach((s) =>
      s.items.forEach((i) => {
        if (i.children && bestChild(i, score)) setOpenItems((prev) => new Set(prev).add(i.href));
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, teachMode]);

  const toggleSection = (id: string) =>
    setClosedSections((prev) => {
      const next = new Set(prev);
      const closing = !next.has(id);
      closing ? next.add(id) : next.delete(id);
      try { localStorage.setItem(SECTION_KEY(id), closing ? "0" : "1"); } catch { /* ignore */ }
      return next;
    });

  const toggleItem = (href: string) =>
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(href) ? next.delete(href) : next.add(href);
      return next;
    });

  const rowBase =
    "group relative flex items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40";

  return (
    <nav aria-label="Main" className={cn("flex flex-col gap-y-4 py-2", collapsed ? "px-3" : "px-3")}>
      {sections.map((section, sIndex) => {
        const sectionOpen = collapsed || !closedSections.has(section.id);
        return (
          <div key={section.id}>
            {collapsed ? (
              sIndex > 0 && <div aria-hidden className="mx-auto mb-3 h-px w-8 bg-ink-200" />
            ) : (
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={sectionOpen}
                className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-ink-400 transition hover:text-ink-600"
              >
                {section.title}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !sectionOpen && "-rotate-90")} aria-hidden />
              </button>
            )}

            {sectionOpen && (
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const activeChild = item.children ? bestChild(item, score) : null;
                  const active = activeChild !== null || score(item.href) >= 0;
                  const Icon = item.icon;
                  const itemOpen = openItems.has(item.href);

                  const iconEl = (
                    <Icon
                      className={cn("h-5 w-5 shrink-0", active ? "text-brand-700" : "text-ink-400 group-hover:text-ink-600", item.locked && "text-ink-300")}
                      aria-hidden
                    />
                  );

                  /* ---------- Collapsed: icon rail ---------- */
                  if (collapsed) {
                    const railClass = cn(
                      rowBase,
                      "mx-auto h-11 w-11 justify-center",
                      active ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-ink-100",
                      item.locked && "cursor-not-allowed hover:bg-transparent"
                    );
                    if (item.children) {
                      return (
                        <li key={item.href}>
                          <HoverFlyout
                            title={item.label}
                            content={(close) => (
                              <ul>
                                {item.children!.map((c) => {
                                  const CIcon = c.icon;
                                  const cActive = activeChild === c.href;
                                  return (
                                    <li key={c.href}>
                                      <Link
                                        href={c.href}
                                        role="menuitem"
                                        onClick={() => { close(); onNavigate?.(); }}
                                        aria-current={cActive ? "page" : undefined}
                                        className={cn(
                                          "flex items-center gap-x-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                                          cActive ? "bg-brand-50 font-medium text-brand-800" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                                        )}
                                      >
                                        {CIcon && <CIcon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />}
                                        {c.label}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          >
                            <Link href={item.href} onClick={onNavigate} aria-label={item.label} aria-haspopup="menu" aria-current={active ? "page" : undefined} className={railClass}>
                              {iconEl}
                              <span aria-hidden className="absolute bottom-1.5 right-1.5 h-1 w-1 rounded-full bg-ink-300" />
                            </Link>
                          </HoverFlyout>
                        </li>
                      );
                    }
                    return (
                      <li key={item.href}>
                        <HoverTip label={item.locked ? `${item.label} · coming soon` : item.label}>
                          {item.locked ? (
                            <span role="link" aria-disabled="true" aria-label={`${item.label} (coming soon)`} className={railClass}>
                              {iconEl}
                            </span>
                          ) : (
                            <Link href={item.href} onClick={onNavigate} aria-label={item.label} aria-current={active ? "page" : undefined} className={railClass}>
                              {iconEl}
                            </Link>
                          )}
                        </HoverTip>
                      </li>
                    );
                  }

                  /* ---------- Expanded ---------- */
                  const rowClass = cn(
                    rowBase,
                    "min-w-0 flex-1 gap-x-3 px-3 py-2.5",
                    active && !item.children ? "bg-brand-50 text-brand-800" : active ? "text-brand-800" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                    item.locked && "cursor-not-allowed text-ink-400 hover:bg-transparent hover:text-ink-400"
                  );

                  return (
                    <li key={item.href}>
                      <div className="flex items-center">
                        {item.locked ? (
                          <span aria-disabled="true" className={rowClass}>
                            {iconEl}
                            <span className="truncate">{item.label}</span>
                            <span className="ml-auto inline-flex items-center gap-x-1 rounded-full bg-ink-100 px-2 py-0.5 text-3xs font-semibold uppercase tracking-wide text-ink-500">
                              <Lock className="h-3 w-3" aria-hidden /> Soon
                            </span>
                          </span>
                        ) : (
                          <Link href={item.children ? item.children[0].href : item.href} onClick={onNavigate} aria-current={active && !item.children ? "page" : undefined} className={rowClass}>
                            {active && !item.children && <span aria-hidden className="absolute inset-y-1.5 left-0 w-1 rounded-r bg-brand-600" />}
                            {iconEl}
                            <span className="truncate">{item.label}</span>
                          </Link>
                        )}
                        {item.children && (
                          <button
                            type="button"
                            onClick={() => toggleItem(item.href)}
                            aria-expanded={itemOpen}
                            aria-label={`${itemOpen ? "Collapse" : "Expand"} ${item.label}`}
                            className="ml-1 rounded-md p-2 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                          >
                            <ChevronDown className={cn("h-4 w-4 transition-transform", !itemOpen && "-rotate-90")} />
                          </button>
                        )}
                      </div>

                      {item.children && itemOpen && (
                        <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-ink-200 pl-3">
                          {item.children.map((c) => {
                            const cActive = activeChild === c.href;
                            return (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  onClick={onNavigate}
                                  aria-current={cActive ? "page" : undefined}
                                  className={cn(
                                    "relative flex items-center rounded-md px-2.5 py-2 text-sm transition",
                                    cActive ? "bg-brand-50 font-medium text-brand-800" : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                                  )}
                                >
                                  {cActive && <span aria-hidden className="absolute -left-[13px] inset-y-1.5 w-0.5 rounded bg-brand-600" />}
                                  {c.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
};
