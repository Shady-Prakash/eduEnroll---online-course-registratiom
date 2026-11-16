/**
 * eduEnroll design tokens: the single source of truth for colour and type.
 *
 * - tailwind.config.js reads this file, so every token is a Tailwind class:
 *   `bg-brand-600`, `text-ink-500`, `border-success-200`, `text-2xs`, ...
 * - Code that needs a raw value (charts, Clerk, Mux, the top loader) imports
 *   `palette` / `theme` from "@/lib/design-tokens" instead of hard-coding hex.
 *
 * To re-skin the app, change the scales here. Never use Tailwind's raw
 * palette names (sky, slate, emerald, ...) in components.
 *
 * Plain CommonJS with literal values so it works in both the Tailwind config
 * (Node) and the browser bundle.
 */

/** @typedef {{50:string,100:string,200:string,300:string,400:string,500:string,600:string,700:string,800:string,900:string,950:string}} Scale */

const palette = {
  /** Primary brand colour: links, active states, focus rings, CTAs. */
  brand: {
    50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8",
    500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e", 950: "#082f49",
  },
  /** Secondary brand colour, paired with brand in gradients and the logo. */
  iris: {
    50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8",
    500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81", 950: "#1e1b4b",
  },
  /** Premium / highlight accent: pass, plans, badges, media chips. */
  highlight: {
    50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa",
    500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95", 950: "#2e1065",
  },
  /** Neutral scale: text, surfaces, borders. */
  ink: {
    50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8",
    500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a", 950: "#020617",
  },
  /** Status colours. */
  success: {
    50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399",
    500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22",
  },
  warning: {
    50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24",
    500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03",
  },
  danger: {
    50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185",
    500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519",
  },
  info: {
    50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa",
    500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554",
  },
};

/** Semantic roles: what a colour is *for*. Prefer these in JS consumers. */
const theme = {
  background: "#ffffff",
  foreground: palette.ink[900],
  mutedForeground: palette.ink[500],
  border: palette.ink[200],
  surfaceMuted: palette.ink[50],
  primary: palette.brand[600],
  primaryHover: palette.brand[700],
  link: palette.brand[700],
  focusRing: palette.brand[500],
  danger: palette.danger[600],
  success: palette.success[600],
  videoBackdrop: palette.ink[950],
};

/** Type scale additions (Tailwind's xs..9xl remain available). */
const fontSize = {
  "3xs": ["0.625rem", { lineHeight: "0.875rem" }], // 10px: micro labels
  "2xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px: eyebrows, chips
};

const fontFamily = {
  sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
};

module.exports = { palette, theme, fontSize, fontFamily };
