"use client";

import { OrganizationSwitcher, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { isSuperAdmin } from "@/lib/roles";

/**
 * Organization management lives in the admin sidebar and is shown only to
 * super admins. Students and regular admins never see it: their organization
 * is activated automatically (see components/auto-select-org.tsx), so the
 * navbar stays clean with just the profile button.
 */
export const SidebarOrgSwitcher = () => {
  const { orgRole } = useAuth();
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith("/admin");

  if (!isSuperAdmin(orgRole) || !isAdminPage) {
    return null;
  }

  return (
    <div className="shrink-0 border-t border-ink-100 p-4">
      <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-ink-500">
        Organization
      </p>
      <OrganizationSwitcher
        hidePersonal
        afterSelectOrganizationUrl="/admin/courses"
        afterCreateOrganizationUrl="/admin/courses"
        appearance={{
          elements: {
            rootBox: "w-full",
            organizationSwitcherTrigger:
              "w-full justify-between rounded-md border border-ink-200 px-3 py-2 hover:bg-ink-50",
          },
        }}
      />
    </div>
  );
};
