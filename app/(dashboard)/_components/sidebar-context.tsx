"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { SIDEBAR_COOKIE } from "./sidebar-cookie";


type SidebarState = { collapsed: boolean; toggle: () => void };

const SidebarContext = createContext<SidebarState>({ collapsed: false, toggle: () => {} });

/**
 * Desktop sidebar collapsed/expanded state. Persisted in a cookie so the server
 * renders the right width on first paint (no layout jump). Shortcut: Ctrl/⌘ + B.
 */
export const SidebarProvider = ({ initialCollapsed, children }: { initialCollapsed: boolean; children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      document.cookie = `${SIDEBAR_COOKIE}=${!c ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      return !c;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        const target = e.target as HTMLElement | null;
        if (target?.closest("input, textarea, [contenteditable=true], .ql-editor")) return; // don't steal Bold in editors
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return <SidebarContext.Provider value={{ collapsed, toggle }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
