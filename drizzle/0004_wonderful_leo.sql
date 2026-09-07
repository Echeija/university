CREATE TABLE "exam_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"exam_date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"venue" text NOT NULL,
	"invigilator_id" integer,
	"instructions" text,
	"status" text DEFAULT 'Scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_invigilator_id_users_id_fk" FOREIGN KEY ("invigilator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;