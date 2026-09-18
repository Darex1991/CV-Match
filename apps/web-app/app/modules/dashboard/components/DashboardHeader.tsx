import { Fragment } from "react";
import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";

export type BreadcrumbEntry = {
  label: string;
  to?: string;
};

type DashboardHeaderProps = {
  breadcrumbs: BreadcrumbEntry[];
  actions?: React.ReactNode;
};

export function DashboardHeader({ breadcrumbs, actions }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 pr-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((entry, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <Fragment key={`${entry.label}-${index}`}>
                  <BreadcrumbItem className={isLast ? undefined : "hidden md:block"}>
                    {isLast || !entry.to ? (
                      <BreadcrumbPage className="max-w-[40vw] truncate">
                        {entry.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={entry.to}>{entry.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
