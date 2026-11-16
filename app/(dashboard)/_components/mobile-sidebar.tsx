"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

/** Phone/tablet drawer: always the full (expanded) sidebar; closes after navigating. */
export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="mr-2 rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[288px] bg-white p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar forceExpanded onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};
