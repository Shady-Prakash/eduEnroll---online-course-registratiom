"use client";

import { useEffect } from "react";
import { useAuth, useOrganizationList } from "@clerk/nextjs";

/**
 * Clerk only populates `orgRole` when an organization is *active* in the session.
 * If the signed-in user belongs to an organization but none is active yet,
 * activate their first membership so admin checks (orgRole) work.
 */
export const AutoSelectOrg = () => {
  const { isSignedIn, orgId } = useAuth();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  useEffect(() => {
    if (!isSignedIn || orgId || !isLoaded || !setActive) return;

    const first = userMemberships?.data?.[0];
    if (first) {
      setActive({ organization: first.organization.id });
    }
  }, [isSignedIn, orgId, isLoaded, setActive, userMemberships?.data]);

  return null;
};
