"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchField } from "@/components/ui/search-field";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  className?: string;
}

/**
 * Course search synced with `?q=` (filters and sort in the URL are kept).
 * Debounced; uses router.replace so typing doesn't flood browser history.
 */
export const SearchInput = ({ className }: SearchInputProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlQuery = searchParams.get("q") ?? searchParams.get("title") ?? "";
  const [value, setValue] = useState(urlQuery);
  const debouncedValue = useDebounce(value, 300);
  const lastPushed = useRef(urlQuery);

  // Keep the field in sync when the URL changes elsewhere (clear filters, back button).
  useEffect(() => {
    if (urlQuery !== lastPushed.current) {
      lastPushed.current = urlQuery;
      setValue(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    const next = debouncedValue.trim();
    if (next === lastPushed.current) return;
    lastPushed.current = next;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("title"); // legacy name
    if (next) params.set("q", next);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedValue, pathname, router, searchParams]);

  return (
    <SearchField
      value={value}
      onValueChange={setValue}
      placeholder="Search courses or unit codes"
      label="Search courses"
      containerClassName={cn("md:w-[340px]", className)}
      className="rounded-full bg-ink-100 border-transparent focus-visible:bg-white"
    />
  );
};
