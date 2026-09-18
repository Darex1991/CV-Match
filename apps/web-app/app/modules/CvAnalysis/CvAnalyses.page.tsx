import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { useCvAnalyses } from "~/api/queries/useCvAnalyses";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "~/components/ui/empty";
import { FileSearch } from "lucide-react";
import type { Route } from "./+types/CvAnalyses.page";
import { requireSession } from "./authMiddleware";
import { DashboardHeader } from "../dashboard/components/DashboardHeader";
import { AnalysisList, AnalysisListSkeleton } from "./components/AnalysisList";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireSession];

export default function CvAnalysesPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch, isFetching } = useCvAnalyses();

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: t("cvAnalysis.nav.dashboard"), to: "/dashboard" },
          { label: t("cvAnalysis.nav.analyses") }
        ]}
        actions={
          <Button asChild size="sm">
            <Link to="/dashboard/cv-analyses/new">
              <Plus />
              {t("cvAnalysis.actions.new")}
            </Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>{t("cvAnalysis.list.title")}</CardTitle>
            <CardDescription>{t("cvAnalysis.list.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <AnalysisListSkeleton />
            ) : isError ? (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                <p className="text-sm font-medium">{t("cvAnalysis.list.error")}</p>
                <p className="text-xs opacity-80">{error?.message}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isFetching}
                  onClick={() => void refetch()}
                >
                  {t("cvAnalysis.actions.retry")}
                </Button>
              </div>
            ) : data && data.length > 0 ? (
              <AnalysisList analyses={data} />
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileSearch />
                  </EmptyMedia>
                  <EmptyTitle>{t("cvAnalysis.list.empty.title")}</EmptyTitle>
                  <EmptyDescription>
                    {t("cvAnalysis.list.empty.description")}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild>
                    <Link to="/dashboard/cv-analyses/new">
                      <Plus />
                      {t("cvAnalysis.actions.new")}
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
