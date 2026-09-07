CREATE TABLE "assignment_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"marks_awarded" integer,
	"feedback" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"lecturer_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"due_date" timestamp NOT NULL,
	"total_marks" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lecturer_id_users_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;