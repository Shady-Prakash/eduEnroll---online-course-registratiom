/** 754 → "12:34", 3725 → "1:02:05" (per-lecture). */
export const formatClock = (seconds?: number | null) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return h ? `${h}:${m.toString().padStart(2, "0")}:${s}` : `${m}:${s}`;
};

/** 8040 → "2h 14m", 1380 → "23m", 40 → "1m" (totals). */
export const formatLength = (seconds?: number | null) => {
  if (!seconds) return null;
  const totalMin = Math.max(1, Math.round(seconds / 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
};
