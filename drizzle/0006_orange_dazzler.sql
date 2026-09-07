CREATE TABLE "academic_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_admission_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academic_sessions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "semesters" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cgpa_records" ADD COLUMN "total_earned_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "type" text DEFAULT 'Core' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "contributes_to_gpa" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "contributes_to_cgpa" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "contributes_to_credit_units" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "ca_breakdown" jsonb;--> statement-breakpoint
ALTER TABLE "semester_gpa_records" ADD COLUMN "total_earned_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_session_id_academic_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."academic_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "session_semester_name_idx" ON "semesters" USING btree ("session_id","name");