"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SearchFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible label; defaults to the placeholder. */
  label?: string;
  containerClassName?: string;
}

/**
 * Search input with a leading icon and a clear button.
 * Escape clears the field. Used by the admin tables and the student course search.
 */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ value, onValueChange, label, placeholder = "Search…", className, containerClassName, onKeyDown, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        />
        <input
          ref={ref}
          type="search"
          role="searchbox"
          aria-label={label ?? placeholder}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              e.preventDefault();
              onValueChange("");
            }
            onKeyDown?.(e);
          }}
          className={cn(
            "h-10 w-full rounded-md border border-ink-200 bg-white pl-9 pr-9 text-sm text-ink-900",
            "placeholder:text-ink-400 transition-shadow",
            "focus-visible:outline-none focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/20",
            // hide the browser's native clear button; we render our own
            "[&::-webkit-search-cancel-button]:appearance-none",
            className
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
SearchField.displayName = "SearchField";
