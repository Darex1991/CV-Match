import { Injectable } from "@nestjs/common";
import { CvAiAdapter, CvAiAnalyzeInput } from "./cv-ai.adapter";
import { CvAnalysisResult } from "../schemas/cv-analysis.schema";
import { clampScore, verdictForScore } from "./cv-analysis-result.validator";

const STOP_WORDS = new Set([
  "and",
  "the",
  "with",
  "for",
  "you",
  "our",
  "are",
  "will",
  "this",
  "that",
  "have",
  "from",
  "your",
  "oraz",
  "lub",
  "dla",
  "jest",
  "nie",
  "się",
  "w",
  "z",
  "na",
  "do",
  "i",
  "a",
  "o",
  "experience",
  "years",
  "team",
  "work",
  "skills",
  "knowledge",
  "doświadczenie",
  "lat",
  "zespół",
  "praca",
]);

/**
 * Deterministic, dependency-free stand-in for the real model. It scores the
 * CV by keyword overlap with the job description so the whole pipeline (upload,
 * queue, extraction, result rendering) can be exercised without an API key.
 */
@Injectable()
export class MockCvAiAdapter extends CvAiAdapter {
  async analyze({
    cvText,
    jobText,
  }: CvAiAnalyzeInput): Promise<CvAnalysisResult> {
    const cvTokens = new Set(this.tokenize(cvText));
    const jobKeywords = this.topKeywords(jobText, 20);

    const matchedSkills = jobKeywords.filter((keyword) =>
      cvTokens.has(keyword),
    );
    const missingSkills = jobKeywords.filter(
      (keyword) => !cvTokens.has(keyword),
    );

    const ratio = jobKeywords.length
      ? matchedSkills.length / jobKeywords.length
      : 0;
    const matchScore = clampScore(35 + ratio * 60);

    return {
      matchScore,
      verdict: verdictForScore(matchScore),
      summary: `Mock analysis: the CV mentions ${matchedSkills.length} of ${jobKeywords.length} key terms from the job description. Configure AI_ADAPTER=anthropic to get a real assessment.`,
      candidateProfile: {
        name: this.guessName(cvText),
        currentTitle: null,
        yearsOfExperience: this.guessYears(cvText),
        location: null,
      },
      matchedSkills,
      missingSkills,
      strengths: matchedSkills
        .slice(0, 3)
        .map(
          (skill) =>
            `CV explicitly references "${skill}", which the role asks for.`,
        ),
      gaps: missingSkills
        .slice(0, 3)
        .map(
          (skill) =>
            `The job description mentions "${skill}" but the CV does not.`,
        ),
      redFlags: [],
      feedbackForCandidate: missingSkills
        .slice(0, 3)
        .map(
          (skill) =>
            `If you have experience with "${skill}", make it explicit in the CV.`,
        ),
      interviewQuestions: [
        ...matchedSkills.slice(0, 2).map((skill) => ({
          category: "technical" as const,
          question: `Describe the most complex problem you solved using ${skill}.`,
          rationale: `Verifies depth behind the "${skill}" keyword in the CV.`,
        })),
        ...missingSkills.slice(0, 2).map((skill) => ({
          category: "gap_probe" as const,
          question: `The role requires ${skill}. What is your exposure to it so far?`,
          rationale: `The CV does not mention "${skill}".`,
        })),
        {
          category: "experience" as const,
          question:
            "Walk me through the project on your CV you are most proud of and your exact role in it.",
          rationale:
            "Establishes ownership and impact behind listed experience.",
        },
        {
          category: "behavioral" as const,
          question:
            "Tell me about a time you disagreed with a technical decision. How did you handle it?",
          rationale: "Assesses collaboration and communication.",
        },
      ],
    };
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[^\p{L}\p{N}+#.]+/u)
      .map((token) => token.replace(/^[.]+|[.]+$/g, ""))
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  }

  private topKeywords(text: string, limit: number): string[] {
    const counts = new Map<string, number>();

    for (const token of this.tokenize(text)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([token]) => token);
  }

  private guessName(cvText: string): string | null {
    const firstLine = cvText.split("\n").find((line) => line.trim().length > 0);

    if (!firstLine) return null;

    const trimmed = firstLine.trim();

    return trimmed.length <= 60 && /^[\p{L}\s.'-]+$/u.test(trimmed)
      ? trimmed
      : null;
  }

  private guessYears(cvText: string): number | null {
    const match = cvText.match(/(\d{1,2})\+?\s*(years|lat|lata)/i);

    return match ? Number(match[1]) : null;
  }
}
