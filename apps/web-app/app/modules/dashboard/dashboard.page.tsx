import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Loader2,
  Plus,
  XCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { isProcessing } from "~/api/cv-analysis.types";
import { useCvAnalyses } from "~/api/queries/useCvAnalyses";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { Route } from "./+types/dashboard.page";
import { requireSession } from "../CvAnalysis/authMiddleware";
import {
  AnalysisList,
  AnalysisListSkeleton
} from "../CvAnalysis/components/AnalysisList";
import { DashboardHeader } from "./components/DashboardHeader";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireSession];

function StatTile({
  label,
  value,
  icon: Icon,
  isLoading
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-12" />
          ) : (
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
          )}
        </div>
        <Icon className="size-8 text-muted-foreground/60" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useCvAnalyses();

  const analyses = data ?? [];
  const stats = {
    total: analyses.length,
    processing: analyses.filter((analysis) => isProcessing(analysis.status)).length,
    completed: analyses.filter((analysis) => analysis.status === "completed").length,
    failed: analyses.filter((analysis) => analysis.status === "failed").length
  };
  const recent = analyses.slice(0, 5);

  return (
    <>
      <DashboardHeader
        breadcrumbs={[{ label: t("cvAnalysis.nav.dashboard") }]}
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label={t("cvAnalysis.overview.total")}
            value={stats.total}
            icon={FileSearch}
            isLoading={isLoading}
          />
          <StatTile
            label={t("cvAnalysis.overview.processing")}
            value={stats.processing}
            icon={Loader2}
            isLoading={isLoading}
          />
          <StatTile
            label={t("cvAnalysis.overview.completed")}
            value={stats.completed}
            icon={CheckCircle2}
            isLoading={isLoading}
          />
          <StatTile
            label={t("cvAnalysis.overview.failed")}
            value={stats.failed}
            icon={XCircle}
            isLoading={isLoading}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{t("cvAnalysis.overview.recent.title")}</CardTitle>
              <CardDescription>
                {t("cvAnalysis.overview.recent.description")}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/cv-analyses">
                {t("cvAnalysis.overview.recent.all")}
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <AnalysisListSkeleton rows={2} />
            ) : recent.length ? (
              <AnalysisList analyses={recent} />
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-6">
                <p className="text-sm text-muted-foreground">
                  {t("cvAnalysis.overview.recent.empty")}
                </p>
                <Button asChild size="sm">
                  <Link to="/dashboard/cv-analyses/new">
                    <Plus />
                    {t("cvAnalysis.actions.new")}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
