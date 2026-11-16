import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Typography primitives. Use these instead of hand-rolling heading/text
 * classes so sizes, weights and colours stay consistent app-wide.
 *
 *   <Heading>Page title</Heading>                    // h1, "page" size
 *   <Heading as="h2" size="section">Reviews</Heading>
 *   <Text tone="muted" size="sm">Updated today</Text>
 *   <Eyebrow>Chapter 3</Eyebrow>
 *
 * The class builders (headingVariants, textVariants) are exported for the
 * rare case where the element can't be swapped (e.g. a Radix Title).
 */

export const headingVariants = cva("text-balance font-semibold tracking-tight", {
  variants: {
    size: {
      /** Marketing / auth splash headlines. */
      display: "text-3xl leading-tight sm:text-4xl xl:text-5xl",
      /** Course & chapter hero titles. */
      hero: "text-2xl leading-tight sm:text-3xl lg:text-4xl",
      /** One per page: the page title. */
      page: "text-2xl leading-tight sm:text-3xl",
      /** Content sections within a page ("Description", "Reviews"). */
      section: "text-xl leading-snug",
      /** Cards, panels, editor headers. */
      card: "text-lg leading-snug",
      /** Small panels, sidebar and list-item titles. */
      sub: "text-base leading-snug",
      /** Dense UI: checklists, compact cards. */
      label: "text-sm leading-snug",
    },
    tone: {
      default: "text-ink-900",
      inverse: "text-white",
      brand: "text-brand-700",
    },
  },
  defaultVariants: { size: "page", tone: "default" },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Tag = "h1", size, tone, className, ...props }, ref) => (
    <Tag ref={ref} className={cn(headingVariants({ size, tone }), className)} {...props} />
  )
);
Heading.displayName = "Heading";

export const textVariants = cva("", {
  variants: {
    size: {
      lg: "text-lg leading-relaxed",
      base: "text-base leading-relaxed",
      sm: "text-sm leading-6",
      xs: "text-xs leading-5",
    },
    tone: {
      default: "text-ink-700",
      strong: "text-ink-900",
      muted: "text-ink-500",
      subtle: "text-ink-400",
      inverse: "text-white",
      brand: "text-brand-700",
      success: "text-success-700",
      warning: "text-warning-700",
      danger: "text-danger-600",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
  },
  defaultVariants: { size: "base", tone: "default", weight: "normal" },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "small" | "label";
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Tag = "p", size, tone, weight, className, ...props }, ref) => (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(textVariants({ size, tone, weight }), className)}
      {...props}
    />
  )
);
Text.displayName = "Text";

/** Small uppercase label above a heading ("Chapter 3", "Overview"). */
export const Eyebrow = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-2xs font-semibold uppercase tracking-wider text-brand-700", className)}
    {...props}
  />
);
