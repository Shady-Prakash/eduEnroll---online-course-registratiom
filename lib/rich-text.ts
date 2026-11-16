/** True when rich-text HTML has visible text OR embedded media (images, videos). */
export const hasRichContent = (html?: string | null): boolean =>
  !!html && (/<(img|iframe)\b/i.test(html) || html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim().length > 0);
