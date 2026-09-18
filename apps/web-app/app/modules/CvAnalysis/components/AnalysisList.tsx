import { FileText, RotateCcw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { enUS, pl } from "date-fns/locale";

import { isProcessing, type CvAnalysisListItem } from "~/api/cv-analysis.types";
import { useDeleteCvAnalysis } from "~/api/mutations/useDeleteCvAnalysis";
import { useRetryCvAnalysis } from "~/api/mutations/useRetryCvAnalysis";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";
import { AnalysisStatusBadge } from "./AnalysisStatusBadge";
import { MatchScore } from "./MatchScore";
import { formatBytes } from "./UploadDropzone";

function verdictForScore(score: number) {
  if (score >= 80) return "strong_match" as const;
  if (score >= 60) return "good_match" as const;
  if (score >= 40) return "partial_match" as const;
  return "weak_match" as const;
}

export function AnalysisListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function AnalysisList({ analyses }: { analyses: CvAnalysisListItem[] }) {
  const { t, i18n } = useTranslation();
  const retry = useRetryCvAnalysis();
  const remove = useDeleteCvAnalysis();
  const dateLocale = i18n.resolvedLanguage === "pl" ? pl : enUS;

  return (
    <ul className="space-y-3">
      {analyses.map((analysis) => {
        const processing = isProcessing(analysis.status);

        return (
          <li
            key={analysis.id}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={`/dashboard/cv-analyses/${analysis.id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                {analysis.matchScore !== null ? (
                  <MatchScore
                    size="sm"
                    score={analysis.matchScore}
                    verdict={verdictForScore(analysis.matchScore)}
                  />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FileText className="size-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{analysis.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {analysis.cvFile.originalName} ·{" "}
                    {formatBytes(analysis.cvFile.byteSize)} ·{" "}
                    {formatDistanceToNow(new Date(analysis.createdAt), {
                      addSuffix: true,
                      locale: dateLocale
                    })}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <AnalysisStatusBadge status={analysis.status} />
                {analysis.status === "failed" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={retry.isPending}
                    onClick={() => retry.mutate(analysis.id)}
                  >
                    <RotateCcw />
                    {t("cvAnalysis.actions.retry")}
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={t("cvAnalysis.actions.delete")}
                      disabled={processing || remove.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("cvAnalysis.actions.deleteConfirm.title")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("cvAnalysis.actions.deleteConfirm.description", {
                          title: analysis.title
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t("cvAnalysis.actions.cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove.mutate(analysis.id)}>
                        {t("cvAnalysis.actions.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {processing && (
              <div className="mt-3 flex items-center gap-3">
                <Progress value={analysis.progress} className="h-1.5" />
                <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                  {analysis.progress}%
                </span>
              </div>
            )}

            {analysis.status === "failed" && analysis.errorMessage && (
              <p className="mt-3 line-clamp-2 text-xs text-destructive">
                {analysis.errorMessage}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
