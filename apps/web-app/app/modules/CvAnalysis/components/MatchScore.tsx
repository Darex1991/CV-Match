import { useTranslation } from "react-i18next";

import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type { CvAnalysisVerdict } from "~/api/cv-analysis.types";

const VERDICT_COLORS: Record<CvAnalysisVerdict, string> = {
  strong_match: "text-emerald-600 dark:text-emerald-400",
  good_match: "text-sky-600 dark:text-sky-400",
  partial_match: "text-amber-600 dark:text-amber-400",
  weak_match: "text-rose-600 dark:text-rose-400"
};

type MatchScoreProps = {
  score: number;
  verdict: CvAnalysisVerdict;
  size?: "sm" | "lg";
};

export function MatchScore({ score, verdict, size = "lg" }: MatchScoreProps) {
  const { t } = useTranslation();
  const radius = size === "lg" ? 52 : 18;
  const stroke = size === "lg" ? 8 : 4;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const box = (radius + stroke) * 2;

  return (
    <div className={cn("flex items-center gap-4", size === "sm" && "gap-2")}>
      <svg
        width={box}
        height={box}
        viewBox={`0 0 ${box} ${box}`}
        role="img"
        aria-label={t("cvAnalysis.result.scoreLabel", { score })}
        className="shrink-0 -rotate-90"
      >
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "stroke-current transition-[stroke-dashoffset] duration-700",
            VERDICT_COLORS[verdict]
          )}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className={cn(
            "origin-center rotate-90 fill-foreground font-semibold",
            size === "lg" ? "text-2xl" : "text-[10px]"
          )}
        >
          {score}
        </text>
      </svg>
      {size === "lg" && (
        <div>
          <p className="text-sm text-muted-foreground">
            {t("cvAnalysis.result.matchScore")}
          </p>
          <Badge variant="outline" className={cn("mt-1", VERDICT_COLORS[verdict])}>
            {t(`cvAnalysis.verdict.${verdict}`)}
          </Badge>
        </div>
      )}
    </div>
  );
}
