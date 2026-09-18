import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import {
  CV_ANALYSIS_QUEUE,
  CvAnalysisQueueJobPayloads,
} from "./cv-analysis.queue";
import { CvAnalysisService } from "./cv-analysis.service";

type AnalyzeCvJob = Job<
  CvAnalysisQueueJobPayloads["ANALYZE_CV"],
  unknown,
  typeof CV_ANALYSIS_QUEUE.actions.ANALYZE_CV
>;

@Processor(CV_ANALYSIS_QUEUE.name, { concurrency: 2 })
export class CvAnalysisConsumer extends WorkerHost {
  private readonly logger = new Logger(CvAnalysisConsumer.name);

  constructor(private readonly cvAnalysisService: CvAnalysisService) {
    super();
  }

  async process(job: AnalyzeCvJob): Promise<unknown> {
    switch (job.name) {
      case CV_ANALYSIS_QUEUE.actions.ANALYZE_CV:
        return this.analyze(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async analyze(job: AnalyzeCvJob) {
    const { analysisId } = job.data;

    this.logger.log(`Processing CV analysis ${analysisId} (job ${job.id})`);

    await this.cvAnalysisService.runPipeline(analysisId, (progress) =>
      job.updateProgress(progress),
    );

    return { analysisId };
  }
}
