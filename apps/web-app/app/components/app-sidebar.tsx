import * as React from "react";
import { useLocation } from "react-router";

import { useCurrentUser } from "~/api/queries/useCurrentUser";
import { NavAdmin } from "~/components/nav-admin";
import { NavCv } from "~/components/nav-cv";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "~/components/ui/sidebar";

const teams = [
  {
    name: "CV Match",
    logo: () => <img src="/brand.svg" alt="CV Match" />,
    plan: "AI recruiting assistant"
  }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();
  const location = useLocation();
  const isAdmin = user.data?.role === "admin";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavCv currentPath={location.pathname} />
        <NavAdmin isAdmin={isAdmin} currentPath={location.pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            email: user.data?.email || "",
            name: user.data?.name || "",
            avatar: user.data?.image || ""
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
