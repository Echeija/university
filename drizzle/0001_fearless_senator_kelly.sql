CREATE TABLE "academic_calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"event_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"status" text NOT NULL,
	"lecturer_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_loans" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"borrowed_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"category" text NOT NULL,
	"cover_color" text NOT NULL,
	"file_url" text,
	"file_type" text,
	"file_size" integer,
	"available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campus_spaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"capacity" integer NOT NULL,
	"type" text NOT NULL,
	"equipment" text DEFAULT '[]',
	CONSTRAINT "campus_spaces_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "campus_wellness_feed" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"attachment_url" text,
	"attachment_name" text,
	"category" text NOT NULL,
	"author_id" integer,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"doctor_id" integer,
	"appointment_date" timestamp NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'Scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_form_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"data" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"reviewed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"fields" text NOT NULL,
	"created_by" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_lab_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"doctor_id" integer,
	"tests_requested" text NOT NULL,
	"notes" text,
	"status" text DEFAULT 'Pending' NOT NULL,
	"results_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"visit_date" timestamp DEFAULT now() NOT NULL,
	"symptoms" text NOT NULL,
	"diagnosis" text,
	"prescription" text,
	"prescription_status" text DEFAULT 'Pending',
	"status" text DEFAULT 'Completed' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"appointment_id" integer NOT NULL,
	"overall_rating" integer NOT NULL,
	"wait_time_rating" integer NOT NULL,
	"cleanliness_rating" integer NOT NULL,
	"staff_friendliness_rating" integer NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_news_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"image_url" text,
	"date" timestamp,
	"end_date" timestamp,
	"location" text,
	"status" text DEFAULT 'Draft',
	"publish_date" timestamp,
	"author_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"video_url" text,
	"order_index" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"status" text DEFAULT 'Draft',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"lecturer_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"semester" text NOT NULL,
	"allocated_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_discussion_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_discussion_poll_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_discussion_poll_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_discussion_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"attachment_url" text,
	"attachment_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_discussion_reply_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"reply_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_discussions" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"attachment_url" text,
	"attachment_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"uploader_id" integer NOT NULL,
	"course_id" integer,
	"category" text NOT NULL,
	"is_public" text DEFAULT 'false' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"capacity" integer,
	"location" text,
	"status" text DEFAULT 'Available'
);
--> statement-breakpoint
CREATE TABLE "facility_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"purpose" text,
	"status" text DEFAULT 'Pending'
);
--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "favorite_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"document_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_insurance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"provider_name" text NOT NULL,
	"policy_number" text NOT NULL,
	"group_number" text,
	"coverage_start_date" text,
	"coverage_end_date" text,
	"status" text DEFAULT 'Pending Verification' NOT NULL,
	"verification_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hostel_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"hostel_id" integer,
	"room_id" integer,
	"status" text DEFAULT 'Pending' NOT NULL,
	"application_date" timestamp DEFAULT now() NOT NULL,
	"session" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hostel_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"hostel_id" integer NOT NULL,
	"room_number" text NOT NULL,
	"capacity" integer NOT NULL,
	"occupancy" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hostels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"capacity" integer NOT NULL,
	"gender" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'Available' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"course_of_study" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"cover_letter" text,
	"resume_url" text,
	"applied_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text,
	"salary" text,
	"posted_by" integer,
	"status" text DEFAULT 'Open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_equipment_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"quantity_changed" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_equipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"min_threshold" integer DEFAULT 5 NOT NULL,
	"status" text DEFAULT 'Operational' NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "lecturer_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"timetable_id" integer,
	"lecturer_id" integer NOT NULL,
	"course_id" integer,
	"date" timestamp NOT NULL,
	"status" text NOT NULL,
	"marked_by_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"medication_name" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"times" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"course_id" integer,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"attachment_url" text,
	"attachment_name" text,
	"is_read" text DEFAULT 'false' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"is_read" text DEFAULT 'false' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pharmacy_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"description" text,
	"category" text NOT NULL,
	"unit" text NOT NULL,
	"stock_level" integer DEFAULT 0 NOT NULL,
	"reorder_threshold" integer DEFAULT 10 NOT NULL,
	"expiry_date" timestamp,
	"supplier" text,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"date_issued" text,
	"credential_url" text
);
--> statement-breakpoint
CREATE TABLE "portfolio_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"link_url" text
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"bio" text,
	"skills" text,
	"github_url" text,
	"linkedin_url" text,
	"website_url" text,
	"is_public" boolean DEFAULT false NOT NULL,
	CONSTRAINT "portfolios_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "space_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"space_id" integer NOT NULL,
	"purpose" text NOT NULL,
	"date" timestamp NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"booked_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_mandatory_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"document_type" text NOT NULL,
	"title" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"admin_feedback" text,
	"reviewed_by_id" integer,
	"reviewed_at" timestamp,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_medical_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"blood_group" text,
	"genotype" text,
	"allergies" text,
	"past_conditions" text,
	"current_medications" text,
	"immunizations" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"emergency_contact_relation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_medical_profiles_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "student_wellness_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"mood" integer NOT NULL,
	"sleep_hours" integer NOT NULL,
	"nutrition_quality" integer NOT NULL,
	"water_intake" integer NOT NULL,
	"exercise_minutes" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "timetables" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"day_of_week" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"venue" text NOT NULL,
	"uploaded_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcript_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"destination" text NOT NULL,
	"purpose" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"request_date" timestamp DEFAULT now() NOT NULL,
	"processed_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "university_news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author" text NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "session" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "screening_notes" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "prerequisites" text;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "faculty_id" integer;--> statement-breakpoint
ALTER TABLE "fee_settings" ADD COLUMN "deadline" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_picture" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "theme_preference" text DEFAULT 'system';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "doctor_status" text DEFAULT 'Available';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "faculty" text;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_lecturer_id_users_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_loans" ADD CONSTRAINT "book_loans_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_loans" ADD CONSTRAINT "book_loans_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_wellness_feed" ADD CONSTRAINT "campus_wellness_feed_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_appointments" ADD CONSTRAINT "clinic_appointments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_appointments" ADD CONSTRAINT "clinic_appointments_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_form_submissions" ADD CONSTRAINT "clinic_form_submissions_form_id_clinic_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."clinic_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_form_submissions" ADD CONSTRAINT "clinic_form_submissions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_form_submissions" ADD CONSTRAINT "clinic_form_submissions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_forms" ADD CONSTRAINT "clinic_forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_lab_requests" ADD CONSTRAINT "clinic_lab_requests_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_lab_requests" ADD CONSTRAINT "clinic_lab_requests_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_records" ADD CONSTRAINT "clinic_records_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_records" ADD CONSTRAINT "clinic_records_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_surveys" ADD CONSTRAINT "clinic_surveys_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_surveys" ADD CONSTRAINT "clinic_surveys_appointment_id_clinic_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."clinic_appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_news_events" ADD CONSTRAINT "cms_news_events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_allocations" ADD CONSTRAINT "course_allocations_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_allocations" ADD CONSTRAINT "course_allocations_lecturer_id_users_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_allocations" ADD CONSTRAINT "course_allocations_allocated_by_id_users_id_fk" FOREIGN KEY ("allocated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_likes" ADD CONSTRAINT "course_discussion_likes_discussion_id_course_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."course_discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_likes" ADD CONSTRAINT "course_discussion_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_poll_options" ADD CONSTRAINT "course_discussion_poll_options_discussion_id_course_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."course_discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_poll_votes" ADD CONSTRAINT "course_discussion_poll_votes_discussion_id_course_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."course_discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_poll_votes" ADD CONSTRAINT "course_discussion_poll_votes_option_id_course_discussion_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."course_discussion_poll_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_poll_votes" ADD CONSTRAINT "course_discussion_poll_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_replies" ADD CONSTRAINT "course_discussion_replies_discussion_id_course_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."course_discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_replies" ADD CONSTRAINT "course_discussion_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_reply_likes" ADD CONSTRAINT "course_discussion_reply_likes_reply_id_course_discussion_replies_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."course_discussion_replies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussion_reply_likes" ADD CONSTRAINT "course_discussion_reply_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussions" ADD CONSTRAINT "course_discussions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_discussions" ADD CONSTRAINT "course_discussions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_bookings" ADD CONSTRAINT "facility_bookings_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_bookings" ADD CONSTRAINT "facility_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_documents" ADD CONSTRAINT "favorite_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_documents" ADD CONSTRAINT "favorite_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_insurance_records" ADD CONSTRAINT "health_insurance_records_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_applications" ADD CONSTRAINT "hostel_applications_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_applications" ADD CONSTRAINT "hostel_applications_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_applications" ADD CONSTRAINT "hostel_applications_room_id_hostel_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."hostel_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_rooms" ADD CONSTRAINT "hostel_rooms_hostel_id_hostels_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_equipment_logs" ADD CONSTRAINT "lab_equipment_logs_equipment_id_lab_equipments_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."lab_equipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_equipment_logs" ADD CONSTRAINT "lab_equipment_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_equipments" ADD CONSTRAINT "lab_equipments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturer_attendance" ADD CONSTRAINT "lecturer_attendance_timetable_id_timetables_id_fk" FOREIGN KEY ("timetable_id") REFERENCES "public"."timetables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturer_attendance" ADD CONSTRAINT "lecturer_attendance_lecturer_id_users_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturer_attendance" ADD CONSTRAINT "lecturer_attendance_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturer_attendance" ADD CONSTRAINT "lecturer_attendance_marked_by_id_users_id_fk" FOREIGN KEY ("marked_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_feedback" ADD CONSTRAINT "portal_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_certificates" ADD CONSTRAINT "portfolio_certificates_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_experiences" ADD CONSTRAINT "portfolio_experiences_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_projects" ADD CONSTRAINT "portfolio_projects_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_bookings" ADD CONSTRAINT "space_bookings_space_id_campus_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."campus_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_bookings" ADD CONSTRAINT "space_bookings_booked_by_id_users_id_fk" FOREIGN KEY ("booked_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_mandatory_documents" ADD CONSTRAINT "student_mandatory_documents_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_mandatory_documents" ADD CONSTRAINT "student_mandatory_documents_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_medical_profiles" ADD CONSTRAINT "student_medical_profiles_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_wellness_logs" ADD CONSTRAINT "student_wellness_logs_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcript_requests" ADD CONSTRAINT "transcript_requests_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;