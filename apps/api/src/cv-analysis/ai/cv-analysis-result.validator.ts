import { TypeCompiler } from "@sinclair/typebox/compiler";
import {
  CvAnalysisResult,
  cvAnalysisResultSchema,
} from "../schemas/cv-analysis.schema";

const compiled = TypeCompiler.Compile(cvAnalysisResultSchema);

export class InvalidCvAnalysisResultError extends Error {
  constructor(public readonly issues: string[]) {
    super(
      `AI returned a result that does not match the expected schema: ${issues.join("; ")}`,
    );
    this.name = "InvalidCvAnalysisResultError";
  }
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function verdictForScore(score: number): CvAnalysisResult["verdict"] {
  if (score >= 80) return "strong_match";
  if (score >= 60) return "good_match";
  if (score >= 40) return "partial_match";
  return "weak_match";
}

/**
 * Validates an untrusted value against the result schema and normalises the
 * fields we do not want to leave to the model (score range, verdict bucket).
 */
export function validateCvAnalysisResult(value: unknown): CvAnalysisResult {
  if (!compiled.Check(value)) {
    const issues = [...compiled.Errors(value)].map(
      (error) => `${error.path || "/"}: ${error.message}`,
    );
    throw new InvalidCvAnalysisResultError(issues);
  }

  const matchScore = clampScore(value.matchScore);

  return {
    ...value,
    matchScore,
    verdict: verdictForScore(matchScore),
  };
}
