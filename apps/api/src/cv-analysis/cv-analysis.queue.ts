export const CV_ANALYSIS_QUEUE = {
  name: "cv-analysis-queue",
  actions: {
    ANALYZE_CV: "ANALYZE_CV" as const,
  },
};

export type CvAnalysisQueueJobPayloads = {
  ANALYZE_CV: {
    analysisId: string;
  };
};
