import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { cvAnalysisApi } from "../cv-analysis.api";
import { queryClient } from "../queryClient";
import { cvAnalysesQueryKey } from "../queries/useCvAnalyses";
import { cvAnalysisQueryKey } from "../queries/useCvAnalysis";

export function useRetryCvAnalysis() {
  return useMutation({
    mutationFn: (id: string) => cvAnalysisApi.retry(id),
    onSuccess: (analysis) => {
      queryClient.setQueryData(cvAnalysisQueryKey(analysis.id), analysis);
      void queryClient.invalidateQueries({ queryKey: cvAnalysesQueryKey });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data?.message ?? error.message);
      }
      toast.error(error.message);
    }
  });
}
