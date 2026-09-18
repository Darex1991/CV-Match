import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import {
  CV_ANALYSIS_QUEUE,
  CvAnalysisQueueJobPayloads,
} from "./cv-analysis.queue";

@Injectable()
export class CvAnalysisProducer {
  constructor(
    @InjectQueue(CV_ANALYSIS_QUEUE.name) private readonly queue: Queue,
  ) {}

  public async enqueueAnalysis(
    payload: CvAnalysisQueueJobPayloads["ANALYZE_CV"],
  ) {
    await this.queue.add(CV_ANALYSIS_QUEUE.actions.ANALYZE_CV, payload, {
      // Failures are surfaced on the analysis row; the user retries explicitly.
      attempts: 1,
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 24 * 3600 },
    });
  }
}
