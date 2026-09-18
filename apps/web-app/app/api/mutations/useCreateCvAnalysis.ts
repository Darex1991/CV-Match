import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { cvAnalysisApi } from "../cv-analysis.api";
import type { CreateCvAnalysisInput } from "../cv-analysis.types";
import { queryClient } from "../queryClient";
import { cvAnalysesQueryKey } from "../queries/useCvAnalyses";

export function useCreateCvAnalysis() {
  return useMutation({
    mutationFn: (input: CreateCvAnalysisInput) => cvAnalysisApi.create(input),
    onSuccess: () => {
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
