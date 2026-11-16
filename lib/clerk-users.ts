import { clerkClient } from "@clerk/nextjs/server";

export type UserProfile = { name: string; imageUrl: string | null; email: string | null };

/** Display profiles for many users in ONE Clerk request. Never throws. */
export const getUserProfiles = async (userIds: string[]) => {
  const map = new Map<string, UserProfile>();
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (!ids.length) return map;
  try {
    const users = await clerkClient.users.getUserList({ userId: ids, limit: ids.length });
    users.forEach((u) => {
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "eduEnroll member";
      map.set(u.id, { name, imageUrl: u.imageUrl ?? null, email: u.emailAddresses?.[0]?.emailAddress ?? null });
    });
  } catch {
    /* show content without names/avatars */
  }
  return map;
};
