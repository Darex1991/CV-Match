CREATE TYPE "public"."cv_analysis_status" AS ENUM('pending', 'extracting', 'analyzing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "cv_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"status" "cv_analysis_status" DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"cv_file_id" uuid NOT NULL,
	"job_description_file_id" uuid,
	"job_description_text" text,
	"cv_text" text,
	"job_text" text,
	"result" jsonb,
	"error_message" text,
	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cv_analysis" ADD CONSTRAINT "cv_analysis_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_analysis" ADD CONSTRAINT "cv_analysis_cv_file_id_file_id_fk" FOREIGN KEY ("cv_file_id") REFERENCES "public"."file"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_analysis" ADD CONSTRAINT "cv_analysis_job_description_file_id_file_id_fk" FOREIGN KEY ("job_description_file_id") REFERENCES "public"."file"("id") ON DELETE restrict ON UPDATE no action;