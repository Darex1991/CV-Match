import type { CvAnalysisResult } from "../schemas/cv-analysis.schema";

export type CvAiAnalyzeInput = {
  cvText: string;
  jobText: string;
};

export abstract class CvAiAdapter {
  abstract analyze(input: CvAiAnalyzeInput): Promise<CvAnalysisResult>;
}
