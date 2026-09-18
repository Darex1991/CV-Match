import { FileSearch, LayoutDashboard, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "~/components/ui/sidebar";

type NavCvProps = {
  currentPath: string;
};

export function NavCv({ currentPath }: NavCvProps) {
  const { t } = useTranslation();

  const items = [
    {
      title: t("cvAnalysis.nav.dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: currentPath === "/dashboard"
    },
    {
      title: t("cvAnalysis.nav.analyses"),
      url: "/dashboard/cv-analyses",
      icon: FileSearch,
      isActive:
        currentPath.startsWith("/dashboard/cv-analyses") &&
        currentPath !== "/dashboard/cv-analyses/new"
    },
    {
      title: t("cvAnalysis.nav.new"),
      url: "/dashboard/cv-analyses/new",
      icon: Plus,
      isActive: currentPath === "/dashboard/cv-analyses/new"
    }
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("cvAnalysis.nav.group")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
              <Link to={item.url}>
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
