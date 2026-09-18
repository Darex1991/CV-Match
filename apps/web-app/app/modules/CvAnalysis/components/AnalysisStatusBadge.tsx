import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "~/components/ui/badge";
import type { CvAnalysisStatus } from "~/api/cv-analysis.types";

const STATUS_STYLES: Record<
  CvAnalysisStatus,
  { variant: "secondary" | "default" | "destructive" | "outline"; className?: string }
> = {
  pending: { variant: "outline" },
  extracting: { variant: "secondary" },
  analyzing: { variant: "secondary" },
  completed: {
    variant: "default",
    className: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950"
  },
  failed: { variant: "destructive" }
};

function StatusIcon({ status }: { status: CvAnalysisStatus }) {
  switch (status) {
    case "pending":
      return <Clock />;
    case "extracting":
    case "analyzing":
      return <Loader2 className="animate-spin" />;
    case "completed":
      return <CheckCircle2 />;
    case "failed":
      return <AlertCircle />;
  }
}

export function AnalysisStatusBadge({ status }: { status: CvAnalysisStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLES[status];

  return (
    <Badge variant={style.variant} className={style.className}>
      <StatusIcon status={status} />
      {t(`cvAnalysis.status.${status}`)}
    </Badge>
  );
}
