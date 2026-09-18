import { BadRequestException, Injectable } from "@nestjs/common";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
] as const;

export type SupportedDocumentMimeType =
  (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number];

const EXTENSION_TO_MIME: Record<string, SupportedDocumentMimeType> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  md: "text/markdown",
};

export function isSupportedDocument(mimeType: string, fileName: string) {
  return resolveDocumentMimeType(mimeType, fileName) !== null;
}

/**
 * Browsers are inconsistent with MIME types for .md/.docx files, so we fall
 * back to the file extension when the declared type is generic.
 */
export function resolveDocumentMimeType(
  mimeType: string,
  fileName: string,
): SupportedDocumentMimeType | null {
  if ((SUPPORTED_DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return mimeType as SupportedDocumentMimeType;
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  return EXTENSION_TO_MIME[extension] ?? null;
}

@Injectable()
export class TextExtractionService {
  async extract(
    body: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<string> {
    const resolved = resolveDocumentMimeType(mimeType, fileName);

    if (!resolved) {
      throw new BadRequestException(
        `Unsupported document type "${mimeType}" (${fileName}). Upload a PDF, DOCX, TXT or Markdown file.`,
      );
    }

    switch (resolved) {
      case "application/pdf":
        return this.normalize(await this.extractPdf(body));
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return this.normalize(await this.extractDocx(body));
      case "text/plain":
      case "text/markdown":
        return this.normalize(body.toString("utf8"));
    }
  }

  private async extractPdf(body: Buffer): Promise<string> {
    const pdf = await getDocumentProxy(new Uint8Array(body));
    const { text } = await extractText(pdf, { mergePages: true });

    return text;
  }

  private async extractDocx(body: Buffer): Promise<string> {
    const { value } = await mammoth.extractRawText({ buffer: body });

    return value;
  }

  private normalize(text: string): string {
    return text
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
}
