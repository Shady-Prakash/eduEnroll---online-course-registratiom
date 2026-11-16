"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type Pos = { top: number; left: number };

/** Position a floating element to the right of its trigger (viewport coords, portal to body). */
const useAnchor = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const measure = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ top: r.top + r.height / 2, left: r.right + 10 });
  };
  return { ref, pos, setPos, measure };
};

interface HoverTipProps {
  label: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Tooltip shown on hover/focus to the right of the trigger. Rendered in a portal
 * so it is never clipped by a scrolling sidebar.
 */
export const HoverTip = ({ label, children, disabled }: HoverTipProps) => {
  const { ref, pos, setPos, measure } = useAnchor();
  const show = !disabled && pos;

  return (
    <div ref={ref} onMouseEnter={measure} onMouseLeave={() => setPos(null)} onFocus={measure} onBlur={() => setPos(null)}>
      {children}
      {show &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className="pointer-events-none fixed z-[100] -translate-y-1/2 animate-in fade-in-0 zoom-in-95 whitespace-nowrap rounded-md bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          >
            <span aria-hidden className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-ink-900" />
            {label}
          </div>,
          document.body
        )}
    </div>
  );
};

interface HoverFlyoutProps {
  title: string;
  /** Rendered inside the flyout panel. Receives `close` for links. */
  content: (close: () => void) => React.ReactNode;
  children: React.ReactNode;
}

/**
 * Hover/focus flyout menu for collapsed sidebars (e.g. "Courses" → sub-pages).
 * Stays open while the pointer moves from the icon into the panel.
 */
export const HoverFlyout = ({ title, content, children }: HoverFlyoutProps) => {
  const { ref, pos, setPos, measure } = useAnchor();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const open = () => {
    clearTimeout(timer.current);
    measure();
  };
  const scheduleClose = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPos(null), 150);
  };
  const close = () => setPos(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div
      ref={ref}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocus={open}
      onBlur={(e) => {
        // keep open while focus moves into the panel
        if (!e.currentTarget.contains(e.relatedTarget as Node)) scheduleClose();
      }}
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      {children}
      {pos &&
        createPortal(
          <div
            role="menu"
            aria-label={title}
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
            style={{ top: pos.top, left: pos.left - 4 }}
            className="fixed z-[100] -translate-y-1/2 pl-1"
          >
            <div className={cn("min-w-[200px] overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-xl")}>
              <p className="px-2.5 pb-1.5 pt-1 text-2xs font-semibold uppercase tracking-wider text-ink-400">{title}</p>
              {content(close)}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
