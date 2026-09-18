import { Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import type { CvAnalysisStatus } from "~/api/cv-analysis.types";

const STEPS = ["pending", "extracting", "analyzing", "completed"] as const;

type Step = (typeof STEPS)[number];

function stepIndex(status: CvAnalysisStatus) {
  if (status === "failed") return -1;
  return STEPS.indexOf(status);
}

export function ProcessingTimeline({
  status,
  progress
}: {
  status: CvAnalysisStatus;
  progress: number;
}) {
  const { t } = useTranslation();
  const current = stepIndex(status);

  return (
    <div className="space-y-4">
      <Progress value={progress} aria-label={t("cvAnalysis.timeline.progress")} />
      <ol className="grid gap-3 sm:grid-cols-4">
        {STEPS.map((step, index) => {
          const isDone = current > index || status === "completed";
          const isActive = current === index && status !== "completed";

          return (
            <li
              key={step}
              className={cn(
                "flex items-start gap-2 rounded-lg border p-3 text-sm",
                isActive && "border-primary bg-primary/5",
                isDone && "border-emerald-500/40 bg-emerald-500/5",
                !isDone && !isActive && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  isDone && "border-emerald-500 bg-emerald-500 text-white",
                  isActive && "border-primary text-primary"
                )}
              >
                {isDone ? (
                  <Check className="size-3" />
                ) : isActive ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  index + 1
                )}
              </span>
              <div>
                <p className="font-medium">
                  {t(`cvAnalysis.timeline.steps.${step as Step}.title`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`cvAnalysis.timeline.steps.${step as Step}.description`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
