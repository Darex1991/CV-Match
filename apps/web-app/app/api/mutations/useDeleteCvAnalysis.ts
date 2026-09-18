import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { cvAnalysisApi } from "../cv-analysis.api";
import { queryClient } from "../queryClient";
import { cvAnalysesQueryKey } from "../queries/useCvAnalyses";

export function useDeleteCvAnalysis() {
  return useMutation({
    mutationFn: (id: string) => cvAnalysisApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["cv-analyses", id] });
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
