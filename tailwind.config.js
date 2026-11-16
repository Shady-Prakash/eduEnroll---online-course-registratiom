import { withUt } from "uploadthing/tw";
const { palette, theme, fontSize, fontFamily } = require("./lib/design-tokens");

/** @type {import('tailwindcss').Config} */
module.exports = withUt({
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Design-token scales (lib/design-tokens.js)
        brand: palette.brand,
        iris: palette.iris,
        highlight: palette.highlight,
        ink: palette.ink,
        success: palette.success,
        warning: palette.warning,
        danger: palette.danger,
        info: palette.info,

        // shadcn/ui semantic roles, mapped onto the same tokens
        border: palette.ink[200],
        input: palette.ink[200],
        ring: palette.brand[500],
        background: theme.background,
        foreground: palette.ink[950],
        primary: { DEFAULT: palette.ink[900], foreground: palette.ink[50] },
        secondary: { DEFAULT: palette.ink[100], foreground: palette.ink[900] },
        destructive: { DEFAULT: palette.danger[600], foreground: "#ffffff" },
        muted: { DEFAULT: palette.ink[100], foreground: palette.ink[500] },
        accent: { DEFAULT: palette.ink[100], foreground: palette.ink[900] },
        popover: { DEFAULT: theme.background, foreground: palette.ink[950] },
        card: { DEFAULT: theme.background, foreground: palette.ink[950] },
      },
      fontFamily,
      fontSize,
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
});