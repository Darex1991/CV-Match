import { describe, expect, it } from "vitest";
import { MockCvAiAdapter } from "../ai/mock-cv-ai.adapter";
import {
  InvalidCvAnalysisResultError,
  validateCvAnalysisResult,
  verdictForScore,
} from "../ai/cv-analysis-result.validator";

const CV = `Jan Kowalski
Senior TypeScript developer with 7 years of experience.
Built NestJS and React applications, PostgreSQL, Redis, AWS S3, Docker.`;

const JOB = `We are hiring a Senior Fullstack Engineer.
Requirements: TypeScript, React, NestJS, PostgreSQL, Kubernetes, GraphQL.
Nice to have: AWS, Docker, Terraform.`;

describe("MockCvAiAdapter", () => {
  const adapter = new MockCvAiAdapter();

  it("produces a schema-valid result", async () => {
    const result = await adapter.analyze({ cvText: CV, jobText: JOB });

    expect(() => validateCvAnalysisResult(result)).not.toThrow();
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.matchScore).toBeLessThanOrEqual(100);
    expect(result.verdict).toBe(verdictForScore(result.matchScore));
  });

  it("splits job keywords into matched and missing skills", async () => {
    const result = await adapter.analyze({ cvText: CV, jobText: JOB });

    expect(result.matchedSkills).toContain("typescript");
    expect(result.missingSkills).toContain("kubernetes");
    expect(result.interviewQuestions.length).toBeGreaterThanOrEqual(4);
  });

  it("extracts basic profile hints", async () => {
    const result = await adapter.analyze({ cvText: CV, jobText: JOB });

    expect(result.candidateProfile.name).toBe("Jan Kowalski");
    expect(result.candidateProfile.yearsOfExperience).toBe(7);
  });
});

describe("validateCvAnalysisResult", () => {
  it("clamps the score and recomputes the verdict", async () => {
    const base = await new MockCvAiAdapter().analyze({
      cvText: CV,
      jobText: JOB,
    });
    const result = validateCvAnalysisResult({
      ...base,
      matchScore: 250,
      verdict: "weak_match",
    });

    expect(result.matchScore).toBe(100);
    expect(result.verdict).toBe("strong_match");
  });

  it("rejects payloads that do not match the schema", () => {
    expect(() => validateCvAnalysisResult({ matchScore: "high" })).toThrow(
      InvalidCvAnalysisResultError,
    );
  });
});
