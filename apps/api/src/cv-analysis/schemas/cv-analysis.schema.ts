import { Static, Type } from "@sinclair/typebox";
import { UUIDSchema } from "src/common";

export const CV_ANALYSIS_STATUSES = [
  "pending",
  "extracting",
  "analyzing",
  "completed",
  "failed",
] as const;

export type CvAnalysisStatus = (typeof CV_ANALYSIS_STATUSES)[number];

export const cvAnalysisStatusSchema = Type.Union(
  CV_ANALYSIS_STATUSES.map((status) => Type.Literal(status)),
);

const nullableString = Type.Union([Type.String(), Type.Null()]);
const nullableNumber = Type.Union([Type.Number(), Type.Null()]);

/**
 * Result produced by the AI step. This schema doubles as the JSON schema sent
 * to Claude as the structured-output format, so it must stay a plain object
 * schema: every property required, `additionalProperties: false`, and no
 * numeric range constraints (ranges are described in prose and clamped in code).
 */
export const cvAnalysisResultSchema = Type.Object(
  {
    matchScore: Type.Integer({
      description:
        "Overall fit of the candidate for the role, from 0 (no fit) to 100 (perfect fit).",
    }),
    verdict: Type.Union(
      [
        Type.Literal("strong_match"),
        Type.Literal("good_match"),
        Type.Literal("partial_match"),
        Type.Literal("weak_match"),
      ],
      {
        description:
          "strong_match: 80-100, good_match: 60-79, partial_match: 40-59, weak_match: 0-39.",
      },
    ),
    summary: Type.String({
      description:
        "Three to five sentences for the recruiter summarising the fit, written in the language of the job description.",
    }),
    candidateProfile: Type.Object(
      {
        name: nullableString,
        currentTitle: nullableString,
        yearsOfExperience: nullableNumber,
        location: nullableString,
      },
      { additionalProperties: false },
    ),
    matchedSkills: Type.Array(Type.String(), {
      description:
        "Skills, tools or qualifications required by the job that the CV clearly demonstrates.",
    }),
    missingSkills: Type.Array(Type.String(), {
      description:
        "Skills, tools or qualifications required by the job that the CV does not show.",
    }),
    strengths: Type.Array(Type.String(), {
      description: "Concrete strengths of this candidate for this role.",
    }),
    gaps: Type.Array(Type.String(), {
      description: "Concrete gaps or risks relative to the job requirements.",
    }),
    redFlags: Type.Array(Type.String(), {
      description:
        "Inconsistencies, unexplained gaps, or claims worth verifying. Empty when none.",
    }),
    feedbackForCandidate: Type.Array(Type.String(), {
      description:
        "Actionable suggestions on how the candidate could improve the CV for this role.",
    }),
    interviewQuestions: Type.Array(
      Type.Object(
        {
          category: Type.Union([
            Type.Literal("technical"),
            Type.Literal("behavioral"),
            Type.Literal("experience"),
            Type.Literal("gap_probe"),
          ]),
          question: Type.String(),
          rationale: Type.String({
            description:
              "Why this question matters for this candidate and role.",
          }),
        },
        { additionalProperties: false },
      ),
      {
        description:
          "Six to ten tailored interview questions covering every category.",
      },
    ),
  },
  { additionalProperties: false },
);

export type CvAnalysisResult = Static<typeof cvAnalysisResultSchema>;

const cvAnalysisFileSchema = Type.Object({
  id: UUIDSchema,
  originalName: Type.String(),
  mimeType: Type.String(),
  byteSize: Type.Number(),
});

export const cvAnalysisListItemSchema = Type.Object({
  id: UUIDSchema,
  title: Type.String(),
  status: cvAnalysisStatusSchema,
  progress: Type.Integer(),
  matchScore: Type.Union([Type.Integer(), Type.Null()]),
  errorMessage: Type.Union([Type.String(), Type.Null()]),
  cvFile: cvAnalysisFileSchema,
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export const cvAnalysisListSchema = Type.Array(cvAnalysisListItemSchema);

export const cvAnalysisDetailSchema = Type.Object({
  id: UUIDSchema,
  title: Type.String(),
  status: cvAnalysisStatusSchema,
  progress: Type.Integer(),
  errorMessage: Type.Union([Type.String(), Type.Null()]),
  cvFile: cvAnalysisFileSchema,
  jobDescriptionFile: Type.Union([cvAnalysisFileSchema, Type.Null()]),
  jobDescriptionText: Type.Union([Type.String(), Type.Null()]),
  result: Type.Union([cvAnalysisResultSchema, Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export const createCvAnalysisBodySchema = Type.Object({
  title: Type.Optional(Type.String({ maxLength: 120 })),
  jobDescriptionText: Type.Optional(Type.String({ maxLength: 20000 })),
});

export type CvAnalysisListItem = Static<typeof cvAnalysisListItemSchema>;
export type CvAnalysisDetail = Static<typeof cvAnalysisDetailSchema>;
export type CreateCvAnalysisBody = Static<typeof createCvAnalysisBodySchema>;
