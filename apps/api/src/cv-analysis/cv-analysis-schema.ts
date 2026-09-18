import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "src/storage/schema/utils";
import { user } from "src/auth/auth-schema";
import { file } from "src/file-storage/files-schema";
import type { CvAnalysisResult } from "./schemas/cv-analysis.schema";

export const cvAnalysisStatusEnum = pgEnum("cv_analysis_status", [
  "pending",
  "extracting",
  "analyzing",
  "completed",
  "failed",
]);

export const cvAnalysis = pgTable("cv_analysis", {
  ...id,
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: cvAnalysisStatusEnum("status").notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  cvFileId: uuid("cv_file_id")
    .notNull()
    .references(() => file.id, { onDelete: "restrict" }),
  jobDescriptionFileId: uuid("job_description_file_id").references(
    () => file.id,
    { onDelete: "restrict" },
  ),
  jobDescriptionText: text("job_description_text"),
  cvText: text("cv_text"),
  jobText: text("job_text"),
  result: jsonb("result").$type<CvAnalysisResult>(),
  errorMessage: text("error_message"),
  ...timestamps,
});
