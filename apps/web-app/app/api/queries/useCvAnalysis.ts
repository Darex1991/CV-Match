import { queryOptions, useQuery } from "@tanstack/react-query";
import { cvAnalysisApi } from "../cv-analysis.api";
import { isProcessing } from "../cv-analysis.types";
import { POLL_INTERVAL_MS } from "./useCvAnalyses";

export const cvAnalysisQueryKey = (id: string) => ["cv-analyses", id] as const;

export const cvAnalysisQueryOptions = (id: string) =>
  queryOptions({
    queryKey: cvAnalysisQueryKey(id),
    queryFn: () => cvAnalysisApi.get(id),
    refetchInterval: (query) =>
      query.state.data && isProcessing(query.state.data.status) ? POLL_INTERVAL_MS : false
  });

export function useCvAnalysis(id: string) {
  return useQuery(cvAnalysisQueryOptions(id));
}
