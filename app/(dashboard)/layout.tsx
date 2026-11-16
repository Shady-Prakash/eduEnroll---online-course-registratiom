import { cookies } from "next/headers";

import Navbar from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { SidebarProvider } from "./_components/sidebar-context";
import { SIDEBAR_COOKIE } from "./_components/sidebar-cookie";
import { DashboardShell } from "./_components/dashboard-shell";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // Read the saved state on the server so the first paint already has the right width.
  const initialCollapsed = cookies().get(SIDEBAR_COOKIE)?.value === "1";

  return (
    <SidebarProvider initialCollapsed={initialCollapsed}>
      <DashboardShell navbar={<Navbar />} sidebar={<Sidebar />}>
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
};

export default DashboardLayout;
