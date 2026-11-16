import { theme } from "@/lib/design-tokens";

/**
 * Shared Clerk appearance for <SignIn /> and <SignUp />.
 * Clerk's own card chrome and header are removed so the form blends into
 * our layout; our page renders the heading itself.
 */
export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
    logoPlacement: "none" as const,
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: theme.primary,
    colorText: theme.foreground,
    colorTextSecondary: theme.mutedForeground,
    colorInputText: theme.foreground,
    colorDanger: theme.danger,
    borderRadius: "0.625rem",
    fontFamily: "inherit",
    fontSize: "0.9375rem",
  },
  elements: {
    rootBox: "w-full",
    card: "w-full max-w-none bg-transparent shadow-none p-0 m-0 gap-6",
    header: "hidden",
    socialButtonsBlockButton:
      "h-11 border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 shadow-sm transition-colors",
    socialButtonsBlockButtonText: "font-medium text-sm",
    dividerLine: "bg-ink-200",
    dividerText: "text-xs uppercase tracking-wider text-ink-400",
    formFieldLabel: "text-sm font-medium text-ink-700",
    formFieldInput:
      "h-11 rounded-[0.625rem] border-ink-200 bg-white text-ink-900 shadow-sm transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
    formFieldInputShowPasswordButton: "text-ink-400 hover:text-ink-600",
    formFieldAction: "text-brand-700 hover:text-brand-800 font-medium",
    formButtonPrimary:
      "h-11 bg-gradient-to-r from-brand-600 to-iris-600 text-sm font-semibold normal-case shadow-md shadow-brand-600/20 transition hover:from-brand-700 hover:to-iris-700 hover:shadow-lg focus:ring-4 focus:ring-brand-500/25",
    footer: "justify-center",
    footerActionText: "text-ink-500",
    footerActionLink: "font-semibold text-brand-700 hover:text-brand-800",
    identityPreview: "border-ink-200 bg-ink-50",
    identityPreviewEditButton: "text-brand-700",
    otpCodeFieldInput: "border-ink-300 focus:border-brand-500",
    formResendCodeLink: "text-brand-700 font-medium",
    alertText: "text-sm",
  },
};
