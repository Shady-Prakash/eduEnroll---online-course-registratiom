/** Languages Mux can auto-generate captions for (speech recognition). */
export const CAPTION_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "ru", label: "Russian" },
  { code: "uk", label: "Ukrainian" },
  { code: "tr", label: "Turkish" },
  { code: "sv", label: "Swedish" },
  { code: "no", label: "Norwegian" },
  { code: "da", label: "Danish" },
  { code: "fi", label: "Finnish" },
  { code: "cs", label: "Czech" },
  { code: "sk", label: "Slovak" },
  { code: "hr", label: "Croatian" },
  { code: "ro", label: "Romanian" },
  { code: "bg", label: "Bulgarian" },
  { code: "el", label: "Greek" },
  { code: "ca", label: "Catalan" },
] as const;

export type CaptionLanguage = (typeof CAPTION_LANGUAGES)[number]["code"];

export const isCaptionLanguage = (code: unknown): code is CaptionLanguage =>
  CAPTION_LANGUAGES.some((l) => l.code === code);

export const languageLabel = (code?: string | null) =>
  CAPTION_LANGUAGES.find((l) => l.code === code)?.label ?? code ?? "Unknown";

export type CaptionTrack = {
  id: string;
  name: string;
  languageCode: string;
  status: "preparing" | "ready" | "errored" | string;
  source: "generated" | "uploaded";
};
