"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Read/update search filters in the URL (shareable, back-button friendly). */
export const useSearchUrl = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = (key: string) => searchParams.get(key) ?? undefined;

  const update = (changes: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const clearFilters = () => update({ categoryId: null, level: null, price: null });

  return { get, update, clearFilters, isPending };
};
