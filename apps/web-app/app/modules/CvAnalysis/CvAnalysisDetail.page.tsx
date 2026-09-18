import { AlertCircle, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { isProcessing } from "~/api/cv-analysis.types";
import { useRetryCvAnalysis } from "~/api/mutations/useRetryCvAnalysis";
import { useCvAnalysis } from "~/api/queries/useCvAnalysis";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { Route } from "./+types/CvAnalysisDetail.page";
import { requireSession } from "./authMiddleware";
import { DashboardHeader } from "../dashboard/components/DashboardHeader";
import { AnalysisResult } from "./components/AnalysisResult";
import { AnalysisStatusBadge } from "./components/AnalysisStatusBadge";
import { ProcessingTimeline } from "./components/ProcessingTimeline";
import { formatBytes } from "./components/UploadDropzone";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireSession];

export default function CvAnalysisDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: analysis, isLoading, isError, error } = useCvAnalysis(id);
  const retry = useRetryCvAnalysis();

  const title = analysis?.title ?? t("cvAnalysis.detail.loading");

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: t("cvAnalysis.nav.dashboard"), to: "/dashboard" },
          { label: t("cvAnalysis.nav.analyses"), to: "/dashboard/cv-analyses" },
          { label: title }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>{t("cvAnalysis.detail.notFound.title")}</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{error?.message ?? t("cvAnalysis.detail.notFound.description")}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void navigate("/dashboard/cv-analyses")}
              >
                {t("cvAnalysis.actions.backToList")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {analysis && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-semibold tracking-tight">
                    {analysis.title}
                  </h1>
                  <AnalysisStatusBadge status={analysis.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("cvAnalysis.detail.files.cv")}: {analysis.cvFile.originalName} (
                  {formatBytes(analysis.cvFile.byteSize)})
                  {analysis.jobDescriptionFile && (
                    <>
                      {" · "}
                      {t("cvAnalysis.detail.files.job")}:{" "}
                      {analysis.jobDescriptionFile.originalName}
                    </>
                  )}
                </p>
              </div>
              {analysis.status === "failed" && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={retry.isPending}
                  onClick={() => retry.mutate(analysis.id)}
                >
                  <RotateCcw />
                  {t("cvAnalysis.actions.retry")}
                </Button>
              )}
            </div>

            {isProcessing(analysis.status) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("cvAnalysis.detail.processing.title")}</CardTitle>
                  <CardDescription>
                    {t("cvAnalysis.detail.processing.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProcessingTimeline
                    status={analysis.status}
                    progress={analysis.progress}
                  />
                </CardContent>
              </Card>
            )}

            {analysis.status === "failed" && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>{t("cvAnalysis.detail.failed.title")}</AlertTitle>
                <AlertDescription>
                  {analysis.errorMessage ?? t("cvAnalysis.detail.failed.description")}
                </AlertDescription>
              </Alert>
            )}

            {analysis.status === "completed" && analysis.result && (
              <AnalysisResult result={analysis.result} />
            )}

            {analysis.jobDescriptionText && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("cvAnalysis.detail.jobDescription")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {analysis.jobDescriptionText}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
