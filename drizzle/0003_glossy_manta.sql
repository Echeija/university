CREATE TABLE "cgpa_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"total_credit_units" integer NOT NULL,
	"total_quality_points" double precision NOT NULL,
	"cgpa" double precision NOT NULL,
	"academic_standing" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grading_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_score" double precision NOT NULL,
	"max_score" double precision NOT NULL,
	"grade" text NOT NULL,
	"grade_point" double precision NOT NULL,
	"description" text NOT NULL,
	"is_pass" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result_amendments" (
	"id" serial PRIMARY KEY NOT NULL,
	"result_id" integer NOT NULL,
	"requested_by_id" integer NOT NULL,
	"old_ca" double precision,
	"new_ca" double precision,
	"old_exam" double precision,
	"new_exam" double precision,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"student_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"action" text NOT NULL,
	"old_ca" double precision,
	"new_ca" double precision,
	"old_exam" double precision,
	"new_exam" double precision,
	"old_grade" text,
	"new_grade" text,
	"reason" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "semester_gpa_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"academic_session" text NOT NULL,
	"semester" text NOT NULL,
	"total_credit_units" integer NOT NULL,
	"total_quality_points" double precision NOT NULL,
	"gpa" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"generated_by_id" integer NOT NULL,
	"verification_code" text NOT NULL,
	"status" text DEFAULT 'valid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transcripts_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
ALTER TABLE "results" ALTER COLUMN "score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ALTER COLUMN "grade" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "academic_session" text DEFAULT '2025/2026' NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "ca_score" double precision;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "exam_score" double precision;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "grade_point" double precision;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "quality_point" double precision;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "return_reason" text;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "approved_by_hod_id" integer;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "approved_by_registrar_id" integer;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cgpa_records" ADD CONSTRAINT "cgpa_records_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_amendments" ADD CONSTRAINT "result_amendments_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_amendments" ADD CONSTRAINT "result_amendments_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_amendments" ADD CONSTRAINT "result_amendments_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "semester_gpa_records" ADD CONSTRAINT "semester_gpa_records_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_generated_by_id_users_id_fk" FOREIGN KEY ("generated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_approved_by_hod_id_users_id_fk" FOREIGN KEY ("approved_by_hod_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_approved_by_registrar_id_users_id_fk" FOREIGN KEY ("approved_by_registrar_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;