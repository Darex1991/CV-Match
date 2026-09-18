import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { and, desc, eq, InferSelectModel } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { DatabasePg } from "src/common";
import { FileStorageService, StoredFile } from "src/file-storage";
import { file } from "src/file-storage/files-schema";
import { cvAnalysis } from "./cv-analysis-schema";
import { CvAnalysisProducer } from "./cv-analysis.producer";
import { CvAiAdapter } from "./ai/cv-ai.adapter";
import {
  isSupportedDocument,
  TextExtractionService,
} from "./text-extraction/text-extraction.service";
import {
  CreateCvAnalysisBody,
  CvAnalysisDetail,
  CvAnalysisListItem,
  CvAnalysisStatus,
} from "./schemas/cv-analysis.schema";

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_JOB_DESCRIPTION_LENGTH = 30;
const MIN_EXTRACTED_TEXT_LENGTH = 50;

const STEP_PROGRESS: Record<CvAnalysisStatus, number> = {
  pending: 0,
  extracting: 20,
  analyzing: 55,
  completed: 100,
  failed: 0,
};

type CvAnalysisRow = InferSelectModel<typeof cvAnalysis>;

type CreateCvAnalysisInput = CreateCvAnalysisBody & {
  userId: string;
  cvFile?: Express.Multer.File;
  jobDescriptionFile?: Express.Multer.File;
};

@Injectable()
export class CvAnalysisService {
  private readonly logger = new Logger(CvAnalysisService.name);

  constructor(
    @Inject("DB") private readonly db: DatabasePg,
    private readonly fileStorageService: FileStorageService,
    private readonly producer: CvAnalysisProducer,
    private readonly textExtraction: TextExtractionService,
    private readonly ai: CvAiAdapter,
  ) {}

  public async create(input: CreateCvAnalysisInput): Promise<CvAnalysisDetail> {
    const { userId, cvFile, jobDescriptionFile } = input;
    const jobDescriptionText = input.jobDescriptionText?.trim() || null;

    if (!cvFile?.buffer) {
      throw new BadRequestException("CV file is required");
    }

    this.assertSupportedDocument(cvFile, "CV");

    if (jobDescriptionFile) {
      this.assertSupportedDocument(jobDescriptionFile, "Job description");
    } else if (
      !jobDescriptionText ||
      jobDescriptionText.length < MIN_JOB_DESCRIPTION_LENGTH
    ) {
      throw new BadRequestException(
        `Provide a job description file or at least ${MIN_JOB_DESCRIPTION_LENGTH} characters of job description text`,
      );
    }

    const analysisId = randomUUID();
    const entityRef = this.fileStorageService.generateEntityRef(
      "cv-analysis",
      analysisId,
    );

    const storedCv = await this.storeDocument(
      cvFile,
      `cv-analyses/${userId}/${analysisId}/cv-${this.safeName(cvFile.originalname)}`,
      entityRef,
    );

    const storedJob = jobDescriptionFile
      ? await this.storeDocument(
          jobDescriptionFile,
          `cv-analyses/${userId}/${analysisId}/job-${this.safeName(jobDescriptionFile.originalname)}`,
          entityRef,
        )
      : null;

    const title = input.title?.trim() || this.defaultTitle(cvFile.originalname);

    await this.db.insert(cvAnalysis).values({
      id: analysisId,
      userId,
      title,
      status: "pending",
      progress: 0,
      cvFileId: storedCv.id,
      jobDescriptionFileId: storedJob?.id ?? null,
      jobDescriptionText: storedJob ? null : jobDescriptionText,
    });

    await this.producer.enqueueAnalysis({ analysisId });

    return this.getById(analysisId, userId);
  }

  public async listForUser(userId: string): Promise<CvAnalysisListItem[]> {
    const rows = await this.db
      .select({
        id: cvAnalysis.id,
        title: cvAnalysis.title,
        status: cvAnalysis.status,
        progress: cvAnalysis.progress,
        result: cvAnalysis.result,
        errorMessage: cvAnalysis.errorMessage,
        createdAt: cvAnalysis.createdAt,
        updatedAt: cvAnalysis.updatedAt,
        cvFile: {
          id: file.id,
          originalName: file.originalName,
          mimeType: file.mimeType,
          byteSize: file.byteSize,
        },
      })
      .from(cvAnalysis)
      .innerJoin(file, eq(file.id, cvAnalysis.cvFileId))
      .where(eq(cvAnalysis.userId, userId))
      .orderBy(desc(cvAnalysis.createdAt));

    return rows.map(({ result, ...row }) => ({
      ...row,
      matchScore: result?.matchScore ?? null,
    }));
  }

  public async getById(id: string, userId: string): Promise<CvAnalysisDetail> {
    const jobFile = alias(file, "job_file");

    const [row] = await this.db
      .select({
        id: cvAnalysis.id,
        title: cvAnalysis.title,
        status: cvAnalysis.status,
        progress: cvAnalysis.progress,
        errorMessage: cvAnalysis.errorMessage,
        jobDescriptionText: cvAnalysis.jobDescriptionText,
        result: cvAnalysis.result,
        createdAt: cvAnalysis.createdAt,
        updatedAt: cvAnalysis.updatedAt,
        cvFile: {
          id: file.id,
          originalName: file.originalName,
          mimeType: file.mimeType,
          byteSize: file.byteSize,
        },
        jobDescriptionFile: {
          id: jobFile.id,
          originalName: jobFile.originalName,
          mimeType: jobFile.mimeType,
          byteSize: jobFile.byteSize,
        },
      })
      .from(cvAnalysis)
      .innerJoin(file, eq(file.id, cvAnalysis.cvFileId))
      .leftJoin(jobFile, eq(jobFile.id, cvAnalysis.jobDescriptionFileId))
      .where(and(eq(cvAnalysis.id, id), eq(cvAnalysis.userId, userId)));

    if (!row) {
      throw new NotFoundException("Analysis not found");
    }

    return {
      ...row,
      jobDescriptionFile: row.jobDescriptionFile?.id
        ? row.jobDescriptionFile
        : null,
      result: row.result ?? null,
    };
  }

  public async retry(id: string, userId: string): Promise<CvAnalysisDetail> {
    const row = await this.ensureOwned(id, userId);

    if (row.status !== "failed") {
      throw new ConflictException("Only failed analyses can be retried");
    }

    await this.db
      .update(cvAnalysis)
      .set({ status: "pending", progress: 0, errorMessage: null, result: null })
      .where(eq(cvAnalysis.id, id));

    await this.producer.enqueueAnalysis({ analysisId: id });

    return this.getById(id, userId);
  }

  public async delete(id: string, userId: string): Promise<void> {
    const row = await this.ensureOwned(id, userId);

    if (row.status === "extracting" || row.status === "analyzing") {
      throw new ConflictException(
        "Analysis is being processed, try again in a moment",
      );
    }

    const fileIds = [row.cvFileId, row.jobDescriptionFileId].filter(
      (fileId): fileId is string => Boolean(fileId),
    );

    await this.db.delete(cvAnalysis).where(eq(cvAnalysis.id, id));

    for (const fileId of fileIds) {
      const stored = await this.fileStorageService.getFileById(fileId);

      if (stored && !stored.deletedAt) {
        await this.fileStorageService.deleteFile(stored.storageKey);
      }
    }
  }

  /**
   * Executed by the BullMQ worker. Every stage persists its status so the UI
   * can poll for progress; any thrown error marks the analysis as failed and
   * is rethrown so the job itself is marked failed too.
   */
  public async runPipeline(
    analysisId: string,
    onProgress: (progress: number) => Promise<unknown> | unknown = () => {},
  ): Promise<void> {
    const [row] = await this.db
      .select()
      .from(cvAnalysis)
      .where(eq(cvAnalysis.id, analysisId));

    if (!row) {
      this.logger.warn(`Analysis ${analysisId} vanished before processing`);
      return;
    }

    try {
      await this.transition(analysisId, "extracting");
      await onProgress(STEP_PROGRESS.extracting);

      const cvText = await this.extractStoredDocument(row.cvFileId);
      const jobText = row.jobDescriptionFileId
        ? await this.extractStoredDocument(row.jobDescriptionFileId)
        : (row.jobDescriptionText ?? "");

      if (cvText.length < MIN_EXTRACTED_TEXT_LENGTH) {
        throw new Error(
          "Could not extract readable text from the CV. Scanned PDFs without a text layer are not supported.",
        );
      }

      if (jobText.length < MIN_JOB_DESCRIPTION_LENGTH) {
        throw new Error(
          "Could not extract readable text from the job description.",
        );
      }

      await this.db
        .update(cvAnalysis)
        .set({
          cvText,
          jobText,
          status: "analyzing",
          progress: STEP_PROGRESS.analyzing,
        })
        .where(eq(cvAnalysis.id, analysisId));
      await onProgress(STEP_PROGRESS.analyzing);

      const result = await this.ai.analyze({ cvText, jobText });

      await this.db
        .update(cvAnalysis)
        .set({
          result,
          status: "completed",
          progress: STEP_PROGRESS.completed,
          errorMessage: null,
        })
        .where(eq(cvAnalysis.id, analysisId));
      await onProgress(STEP_PROGRESS.completed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Analysis ${analysisId} failed: ${message}`);

      await this.db
        .update(cvAnalysis)
        .set({ status: "failed", errorMessage: message })
        .where(eq(cvAnalysis.id, analysisId));

      throw error;
    }
  }

  private async transition(analysisId: string, status: CvAnalysisStatus) {
    await this.db
      .update(cvAnalysis)
      .set({ status, progress: STEP_PROGRESS[status] })
      .where(eq(cvAnalysis.id, analysisId));
  }

  private async extractStoredDocument(fileId: string): Promise<string> {
    const stored = await this.fileStorageService.getFileById(fileId);

    if (!stored) {
      throw new Error(`Stored file ${fileId} not found`);
    }

    const body = await this.fileStorageService.downloadFile(stored.storageKey);

    return this.textExtraction.extract(
      body,
      stored.mimeType,
      stored.originalName,
    );
  }

  private async ensureOwned(
    id: string,
    userId: string,
  ): Promise<CvAnalysisRow> {
    const [row] = await this.db
      .select()
      .from(cvAnalysis)
      .where(and(eq(cvAnalysis.id, id), eq(cvAnalysis.userId, userId)));

    if (!row) {
      throw new NotFoundException("Analysis not found");
    }

    return row;
  }

  private assertSupportedDocument(
    document: Express.Multer.File,
    label: string,
  ) {
    if (!isSupportedDocument(document.mimetype, document.originalname)) {
      throw new BadRequestException(
        `${label} must be a PDF, DOCX, TXT or Markdown file`,
      );
    }

    if (document.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException(`${label} exceeds the 10 MB limit`);
    }
  }

  private async storeDocument(
    document: Express.Multer.File,
    key: string,
    entityRef: string,
  ): Promise<StoredFile> {
    const { file: stored } = await this.fileStorageService.uploadFile({
      key,
      body: document.buffer,
      contentType: document.mimetype,
      metadata: { originalName: document.originalname },
      originalName: document.originalname,
      byteSize: document.size,
      entityRef,
    });

    return stored;
  }

  private safeName(name: string): string {
    return name.replace(/[^\w.-]+/g, "_").slice(-100);
  }

  private defaultTitle(fileName: string): string {
    return (
      fileName
        .replace(/\.[^.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim() || "CV analysis"
    );
  }
}
