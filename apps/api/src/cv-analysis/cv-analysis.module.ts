import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { FileStorageModule } from "src/file-storage";
import { CvAnalysisController } from "./api/cv-analysis.controller";
import { CvAnalysisService } from "./cv-analysis.service";
import { CvAnalysisProducer } from "./cv-analysis.producer";
import { CvAnalysisConsumer } from "./cv-analysis.consumer";
import { CV_ANALYSIS_QUEUE } from "./cv-analysis.queue";
import { TextExtractionService } from "./text-extraction/text-extraction.service";
import { CvAiAdapter } from "./ai/cv-ai.adapter";
import { AnthropicCvAiAdapter } from "./ai/anthropic-cv-ai.adapter";
import { MockCvAiAdapter } from "./ai/mock-cv-ai.adapter";

@Module({
  imports: [
    ConfigModule,
    FileStorageModule,
    BullModule.registerQueue({
      name: CV_ANALYSIS_QUEUE.name,
    }),
    BullBoardModule.forFeature({
      name: CV_ANALYSIS_QUEUE.name,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [CvAnalysisController],
  providers: [
    CvAnalysisService,
    CvAnalysisProducer,
    CvAnalysisConsumer,
    TextExtractionService,
    {
      provide: CvAiAdapter,
      useFactory: (configService: ConfigService) => {
        const adapter = configService.get<string>("ai.AI_ADAPTER");

        if (adapter === "mock") {
          return new MockCvAiAdapter();
        }

        if (adapter === "anthropic") {
          const apiKey = configService.get<string>("ai.ANTHROPIC_API_KEY");
          const model = configService.get<string>("ai.ANTHROPIC_MODEL")!;

          if (!apiKey) {
            throw new Error(
              "ANTHROPIC_API_KEY is required when AI_ADAPTER=anthropic. Set the key or use AI_ADAPTER=mock.",
            );
          }

          return new AnthropicCvAiAdapter(apiKey, model);
        }

        throw new Error(`Unknown AI adapter: ${adapter}`);
      },
      inject: [ConfigService],
    },
  ],
  exports: [CvAnalysisService],
})
export class CvAnalysisModule {}
