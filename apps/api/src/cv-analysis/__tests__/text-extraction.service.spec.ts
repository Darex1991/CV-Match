import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import {
  resolveDocumentMimeType,
  TextExtractionService,
} from "../text-extraction/text-extraction.service";

/** Smallest PDF with a text layer we could hand-write; renders "Hello CV" via Helvetica. */
function buildMinimalPdf(text: string): Buffer {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 100] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    null,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  const stream = `BT /F1 12 Tf 10 50 Td (${text}) Tj ET`;
  objects[3] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    body += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body, "latin1");
}

describe("TextExtractionService", () => {
  const service = new TextExtractionService();

  describe("resolveDocumentMimeType", () => {
    it("accepts declared supported MIME types", () => {
      expect(resolveDocumentMimeType("application/pdf", "cv.pdf")).toBe(
        "application/pdf",
      );
    });

    it("falls back to the extension for generic MIME types", () => {
      expect(
        resolveDocumentMimeType("application/octet-stream", "cv.DOCX"),
      ).toBe(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      expect(
        resolveDocumentMimeType("application/octet-stream", "notes.md"),
      ).toBe("text/markdown");
    });

    it("rejects unsupported documents", () => {
      expect(resolveDocumentMimeType("image/png", "photo.png")).toBeNull();
    });
  });

  describe("extract", () => {
    it("normalises plain text", async () => {
      const text = await service.extract(
        Buffer.from("John Doe\r\n\r\n\r\nSenior Developer   \r\n"),
        "text/plain",
        "cv.txt",
      );

      expect(text).toBe("John Doe\n\nSenior Developer");
    });

    it("extracts text from a PDF", async () => {
      const text = await service.extract(
        buildMinimalPdf("Hello CV"),
        "application/pdf",
        "cv.pdf",
      );

      expect(text).toContain("Hello CV");
    });

    it("throws for unsupported types", async () => {
      await expect(
        service.extract(Buffer.from("x"), "image/png", "photo.png"),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
