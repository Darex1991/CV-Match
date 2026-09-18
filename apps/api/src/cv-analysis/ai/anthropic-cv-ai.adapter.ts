import Anthropic from "@anthropic-ai/sdk";
import { Injectable, Logger } from "@nestjs/common";
import { CvAiAdapter, CvAiAnalyzeInput } from "./cv-ai.adapter";
import {
  CvAnalysisResult,
  cvAnalysisResultSchema,
} from "../schemas/cv-analysis.schema";
import { validateCvAnalysisResult } from "./cv-analysis-result.validator";

const SYSTEM_PROMPT = `You are an experienced technical recruiter and hiring manager.
You compare a candidate's CV against a job description and produce a structured, evidence-based assessment.

Ground every statement in the CV or the job description; never invent experience the CV does not mention.
When the CV is silent about a requirement, list it under missingSkills or gaps rather than guessing.
Write summary, strengths, gaps, feedback and interview questions in the language the job description is written in.
Interview questions must be specific to this candidate and role, not generic.`;

export class CvAiRefusalError extends Error {
  constructor(explanation?: string | null) {
    super(
      `The AI declined to analyse this document${explanation ? `: ${explanation}` : "."}`,
    );
    this.name = "CvAiRefusalError";
  }
}

@Injectable()
export class AnthropicCvAiAdapter extends CvAiAdapter {
  private readonly logger = new Logger(AnthropicCvAiAdapter.name);
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async analyze(input: CvAiAnalyzeInput): Promise<CvAnalysisResult> {
    const response = await this.client.beta.messages.create({
      model: this.model,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: this.buildPrompt(input) }],
      output_config: {
        format: { type: "json_schema", schema: cvAnalysisResultSchema },
      },
    });

    if (response.stop_reason === "refusal") {
      throw new CvAiRefusalError(response.stop_details?.explanation);
    }

    if (response.stop_reason === "max_tokens") {
      throw new Error("AI response was cut off before the analysis completed.");
    }

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    this.logger.debug(
      `Analysis done by ${response.model} (input ${response.usage.input_tokens}, output ${response.usage.output_tokens}, cache read ${response.usage.cache_read_input_tokens ?? 0})`,
    );

    return validateCvAnalysisResult(JSON.parse(text));
  }

  private buildPrompt({ cvText, jobText }: CvAiAnalyzeInput): string {
    return [
      "<job_description>",
      jobText,
      "</job_description>",
      "",
      "<cv>",
      cvText,
      "</cv>",
      "",
      "Assess how well this candidate fits the role and produce the structured analysis.",
    ].join("\n");
  }
}
