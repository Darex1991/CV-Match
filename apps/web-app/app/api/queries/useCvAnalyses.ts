import { queryOptions, useQuery } from "@tanstack/react-query";
import { cvAnalysisApi } from "../cv-analysis.api";
import { isProcessing } from "../cv-analysis.types";

export const cvAnalysesQueryKey = ["cv-analyses"] as const;

export const POLL_INTERVAL_MS = 2000;

export const cvAnalysesQueryOptions = queryOptions({
  queryKey: cvAnalysesQueryKey,
  queryFn: cvAnalysisApi.list,
  refetchInterval: (query) =>
    query.state.data?.some((analysis) => isProcessing(analysis.status))
      ? POLL_INTERVAL_MS
      : false
});

export function useCvAnalyses() {
  return useQuery(cvAnalysesQueryOptions);
}
