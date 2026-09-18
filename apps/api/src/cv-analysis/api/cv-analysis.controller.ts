import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { memoryStorage } from "multer";
import { Validate } from "nestjs-typebox";
import type { Express } from "express";
import { Session, UserSession } from "src/auth";
import {
  baseResponse,
  BaseResponse,
  nullResponse,
  UUIDSchema,
} from "src/common";
import {
  CreateCvAnalysisBody,
  createCvAnalysisBodySchema,
  CvAnalysisDetail,
  cvAnalysisDetailSchema,
  CvAnalysisListItem,
  cvAnalysisListSchema,
} from "../schemas/cv-analysis.schema";
import {
  CvAnalysisService,
  MAX_DOCUMENT_SIZE_BYTES,
} from "../cv-analysis.service";

type UploadedDocuments = {
  cv?: Express.Multer.File[];
  jobDescription?: Express.Multer.File[];
};

const createBodyValidator = TypeCompiler.Compile(createCvAnalysisBodySchema);

@Controller({
  path: "cv-analyses",
  version: "1",
})
export class CvAnalysisController {
  constructor(private readonly cvAnalysisService: CvAnalysisService) {}

  @Get()
  @Validate({
    response: baseResponse(cvAnalysisListSchema),
  })
  async list(
    @Session() session: UserSession,
  ): Promise<BaseResponse<CvAnalysisListItem[]>> {
    const analyses = await this.cvAnalysisService.listForUser(session.user.id);

    return new BaseResponse(analyses);
  }

  @Get(":id")
  @Validate({
    request: [{ type: "param", name: "id", schema: UUIDSchema }],
    response: baseResponse(cvAnalysisDetailSchema),
  })
  async getById(
    id: string,
    @Session() session: UserSession,
  ): Promise<BaseResponse<CvAnalysisDetail>> {
    const analysis = await this.cvAnalysisService.getById(id, session.user.id);

    return new BaseResponse(analysis);
  }

  /**
   * multipart/form-data:
   *  - cv: PDF/DOCX/TXT/MD (required)
   *  - jobDescription: PDF/DOCX/TXT/MD (optional)
   *  - jobDescriptionText: string (required when no jobDescription file)
   *  - title: string (optional)
   */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "cv", maxCount: 1 },
        { name: "jobDescription", maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES, files: 2 },
      },
    ),
  )
  @Validate({
    response: baseResponse(cvAnalysisDetailSchema),
  })
  async create(
    @UploadedFiles() files: UploadedDocuments,
    @Body() body: unknown,
    @Session() session: UserSession,
  ): Promise<BaseResponse<CvAnalysisDetail>> {
    const analysis = await this.cvAnalysisService.create({
      ...this.parseCreateBody(body),
      userId: session.user.id,
      cvFile: files?.cv?.[0],
      jobDescriptionFile: files?.jobDescription?.[0],
    });

    return new BaseResponse(analysis);
  }

  @Post(":id/retry")
  @Validate({
    request: [{ type: "param", name: "id", schema: UUIDSchema }],
    response: baseResponse(cvAnalysisDetailSchema),
  })
  async retry(
    id: string,
    @Session() session: UserSession,
  ): Promise<BaseResponse<CvAnalysisDetail>> {
    const analysis = await this.cvAnalysisService.retry(id, session.user.id);

    return new BaseResponse(analysis);
  }

  @Delete(":id")
  @Validate({
    request: [{ type: "param", name: "id", schema: UUIDSchema }],
    response: nullResponse(),
  })
  async delete(id: string, @Session() session: UserSession): Promise<null> {
    await this.cvAnalysisService.delete(id, session.user.id);

    return null;
  }

  /**
   * Multipart text fields arrive through multer rather than the JSON body
   * pipeline, so they are validated here instead of via @Validate.
   */
  private parseCreateBody(body: unknown): CreateCvAnalysisBody {
    const candidate = this.stripEmptyStrings(body);

    if (!createBodyValidator.Check(candidate)) {
      const issues = [...createBodyValidator.Errors(candidate)].map(
        (error) => `${error.path}: ${error.message}`,
      );
      throw new BadRequestException(`Invalid form data: ${issues.join("; ")}`);
    }

    return candidate;
  }

  private stripEmptyStrings(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).filter(
        ([, value]) => value !== "" && value !== undefined,
      ),
    );
  }
}
