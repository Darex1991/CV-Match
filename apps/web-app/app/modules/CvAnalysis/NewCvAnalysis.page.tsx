import { useTranslation } from "react-i18next";

import type { Route } from "./+types/NewCvAnalysis.page";
import { requireSession } from "./authMiddleware";
import { DashboardHeader } from "../dashboard/components/DashboardHeader";
import { CreateAnalysisForm } from "./components/CreateAnalysisForm";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireSession];

export default function NewCvAnalysisPage() {
  const { t } = useTranslation();

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: t("cvAnalysis.nav.dashboard"), to: "/dashboard" },
          { label: t("cvAnalysis.nav.analyses"), to: "/dashboard/cv-analyses" },
          { label: t("cvAnalysis.nav.new") }
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("cvAnalysis.form.heading")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("cvAnalysis.form.subheading")}
          </p>
        </div>
        <CreateAnalysisForm />
      </div>
    </>
  );
}
