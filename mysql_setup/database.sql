CREATE TABLE `academic_calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(255),
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`event_type` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academic_calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`passport` varchar(255),
	`full_name` varchar(255),
	`first_name` varchar(255),
	`middle_name` varchar(255),
	`last_name` varchar(255),
	`reg_no` varchar(255),
	`email` varchar(255),
	`dob` varchar(255),
	`address` varchar(255),
	`nationality` varchar(255),
	`indigene` varchar(255),
	`lga` varchar(255),
	`level` varchar(255),
	`department` varchar(255),
	`course_of_study` varchar(255),
	`marital_status` varchar(255),
	`religion` varchar(255),
	`next_of_kin_name` varchar(255),
	`next_of_kin_address` varchar(255),
	`sponsor_name` varchar(255),
	`sponsor_address` varchar(255),
	`fslc_document` varchar(255),
	`ssce_document` varchar(255),
	`birth_certificate` varchar(255),
	`state_of_origin_document` varchar(255),
	`other_document_1` varchar(255),
	`other_document_2` varchar(255),
	`other_document_3` varchar(255),
	`other_document_4` varchar(255),
	`other_document_5` varchar(255),
	`program_of_interest` varchar(255) NOT NULL,
	`session` varchar(255),
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`screening_notes` varchar(255),
	`created_at` timestamp NOT NULL,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`student_id` int NOT NULL,
	`date` timestamp NOT NULL,
	`status` varchar(255) NOT NULL,
	`lecturer_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_trails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`details` varchar(255),
	`created_at` timestamp NOT NULL,
	CONSTRAINT `audit_trails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `book_loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`book_id` int NOT NULL,
	`borrowed_date` timestamp NOT NULL DEFAULT (now()),
	`due_date` timestamp NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `book_loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL,
	`cover_color` varchar(255) NOT NULL,
	`file_url` varchar(255),
	`file_type` varchar(255),
	`file_size` int,
	`available` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campus_spaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`capacity` int NOT NULL,
	`type` varchar(255) NOT NULL,
	`equipment` varchar(255) DEFAULT '[]',
	CONSTRAINT `campus_spaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `campus_spaces_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `campus_wellness_feed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` varchar(255) NOT NULL,
	`attachment_url` varchar(255),
	`attachment_name` varchar(255),
	`category` varchar(255) NOT NULL,
	`author_id` int,
	`is_published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campus_wellness_feed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinic_appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`doctor_id` int,
	`appointment_date` timestamp NOT NULL,
	`reason` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'Scheduled',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinic_appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinic_form_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`form_id` int NOT NULL,
	`student_id` int NOT NULL,
	`data` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'Pending',
	`reviewed_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinic_form_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinic_forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(255),
	`fields` varchar(255) NOT NULL,
	`created_by` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinic_forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinic_lab_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`doctor_id` int,
	`tests_requested` varchar(255) NOT NULL,
	`notes` varchar(255),
	`status` varchar(255) NOT NULL DEFAULT 'Pending',
	`results_summary` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinic_lab_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinic_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`staff_id` int NOT NULL,
	`visit_date` timestamp NOT NULL DEFAULT (now()),
	`symptoms` varchar(255) NOT NULL,
	`diagnosis` varchar(255),
	`prescription` varchar(255),
	`prescription_status` varchar(255) DEFAULT 'Pending',
	`status` varchar(255) NOT NULL DEFAULT 'Completed',
	`notes` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinic_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinic_surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`appointment_id` int NOT NULL,
	`overall_rating` int NOT NULL,
	`wait_time_rating` int NOT NULL,
	`cleanliness_rating` int NOT NULL,
	`staff_friendliness_rating` int NOT NULL,
	`comments` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinic_surveys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cms_news_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`content` varchar(255) NOT NULL,
	`summary` varchar(255),
	`image_url` varchar(255),
	`date` timestamp,
	`end_date` timestamp,
	`location` varchar(255),
	`status` varchar(255) DEFAULT 'Draft',
	`publish_date` timestamp,
	`author_id` int,
	`metadata` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `cms_news_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` varchar(255) NOT NULL,
	`image_url` varchar(255),
	`video_url` varchar(255),
	`order_index` int DEFAULT 0,
	`is_published` boolean DEFAULT true,
	`status` varchar(255) DEFAULT 'Draft',
	`metadata` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `content_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`lecturer_id` int NOT NULL,
	`academic_year` varchar(255) NOT NULL,
	`semester` varchar(255) NOT NULL,
	`allocated_by_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_discussion_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discussion_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_discussion_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_discussion_poll_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discussion_id` int NOT NULL,
	`text` varchar(255) NOT NULL,
	CONSTRAINT `course_discussion_poll_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_discussion_poll_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discussion_id` int NOT NULL,
	`option_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_discussion_poll_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_discussion_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discussion_id` int NOT NULL,
	`author_id` int NOT NULL,
	`content` varchar(255) NOT NULL,
	`attachment_url` varchar(255),
	`attachment_name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_discussion_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_discussion_reply_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reply_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_discussion_reply_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_discussions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`author_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` varchar(255) NOT NULL,
	`attachment_url` varchar(255),
	`attachment_name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`is_pinned` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_discussions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`rating` int NOT NULL,
	`feedback` varchar(255) NOT NULL,
	`semester` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `course_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`credits` int NOT NULL,
	`department_id` int,
	`semester` varchar(255) NOT NULL,
	`prerequisites` varchar(255),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`faculty_id` int,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(255),
	`file_url` varchar(255) NOT NULL,
	`file_type` varchar(255) NOT NULL,
	`file_size` int NOT NULL,
	`uploader_id` int NOT NULL,
	`course_id` int,
	`category` varchar(255) NOT NULL,
	`is_public` varchar(255) NOT NULL DEFAULT 'false',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `facilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`capacity` int,
	`location` varchar(255),
	`status` varchar(255) DEFAULT 'Available',
	CONSTRAINT `facilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `facility_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facility_id` int NOT NULL,
	`user_id` int NOT NULL,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp NOT NULL,
	`purpose` varchar(255),
	`status` varchar(255) DEFAULT 'Pending',
	CONSTRAINT `facility_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faculties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	CONSTRAINT `faculties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorite_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`document_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` text NOT NULL,
	`amount` double NOT NULL,
	`level` text,
	`department` text,
	`programme` text,
	`indigene` text,
	`session` text,
	`semester` text,
	`description` text,
	`deadline` timestamp,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `fee_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_insurance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`provider_name` varchar(255) NOT NULL,
	`policy_number` varchar(255) NOT NULL,
	`group_number` varchar(255),
	`coverage_start_date` varchar(255),
	`coverage_end_date` varchar(255),
	`status` varchar(255) NOT NULL DEFAULT 'Pending Verification',
	`verification_notes` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_insurance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hostel_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`hostel_id` int,
	`room_id` int,
	`status` varchar(255) NOT NULL DEFAULT 'Pending',
	`application_date` timestamp NOT NULL DEFAULT (now()),
	`session` varchar(255) NOT NULL,
	CONSTRAINT `hostel_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hostel_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostel_id` int NOT NULL,
	`room_number` varchar(255) NOT NULL,
	`capacity` int NOT NULL,
	`occupancy` int NOT NULL DEFAULT 0,
	CONSTRAINT `hostel_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hostels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`capacity` int NOT NULL,
	`gender` varchar(255) NOT NULL,
	`description` varchar(255),
	`status` varchar(255) NOT NULL DEFAULT 'Available',
	CONSTRAINT `hostels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(255),
	`course_of_study` varchar(255),
	`message` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`job_id` int NOT NULL,
	`student_id` int NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'Pending',
	`cover_letter` varchar(255),
	`resume_url` varchar(255),
	`applied_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`company` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`requirements` varchar(255),
	`salary` varchar(255),
	`posted_by` int,
	`status` varchar(255) NOT NULL DEFAULT 'Open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_equipment_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipment_id` int NOT NULL,
	`user_id` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`quantity_changed` int NOT NULL DEFAULT 0,
	`notes` varchar(255),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lab_equipment_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_equipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`category` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`min_threshold` int NOT NULL DEFAULT 5,
	`status` varchar(255) NOT NULL DEFAULT 'Operational',
	`last_updated` timestamp NOT NULL DEFAULT (now()),
	`updated_by` int,
	CONSTRAINT `lab_equipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lecturer_attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timetable_id` int,
	`lecturer_id` int NOT NULL,
	`course_id` int,
	`date` timestamp NOT NULL,
	`status` varchar(255) NOT NULL,
	`marked_by_id` int,
	`notes` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lecturer_attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medication_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`medication_name` varchar(255) NOT NULL,
	`dosage` varchar(255) NOT NULL,
	`frequency` varchar(255) NOT NULL,
	`times` varchar(255) NOT NULL,
	`start_date` varchar(255) NOT NULL,
	`end_date` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medication_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sender_id` int NOT NULL,
	`receiver_id` int NOT NULL,
	`course_id` int,
	`subject` varchar(255) NOT NULL,
	`content` varchar(255) NOT NULL,
	`attachment_url` varchar(255),
	`attachment_name` varchar(255),
	`is_read` varchar(255) NOT NULL DEFAULT 'false',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`is_read` varchar(255) NOT NULL DEFAULT 'false',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`amount` double NOT NULL,
	`purpose` varchar(255) NOT NULL,
	`user_id` int,
	`session` varchar(255),
	`semester` varchar(255),
	`reference` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `pharmacy_inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(255),
	`description` varchar(255),
	`category` varchar(255) NOT NULL,
	`unit` varchar(255) NOT NULL,
	`stock_level` int NOT NULL DEFAULT 0,
	`reorder_threshold` int NOT NULL DEFAULT 10,
	`expiry_date` timestamp,
	`supplier` varchar(255),
	`last_updated` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pharmacy_inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portal_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` varchar(255) NOT NULL,
	`message` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portal_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolio_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`issuer` varchar(255) NOT NULL,
	`date_issued` varchar(255),
	`credential_url` varchar(255),
	CONSTRAINT `portfolio_certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolio_id` int NOT NULL,
	`company` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`start_date` varchar(255) NOT NULL,
	`end_date` varchar(255),
	`description` varchar(255),
	CONSTRAINT `portfolio_experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolio_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`image_url` varchar(255),
	`link_url` varchar(255),
	CONSTRAINT `portfolio_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`bio` varchar(255),
	`skills` varchar(255),
	`github_url` varchar(255),
	`linkedin_url` varchar(255),
	`website_url` varchar(255),
	`is_public` boolean NOT NULL DEFAULT false,
	CONSTRAINT `portfolios_id` PRIMARY KEY(`id`),
	CONSTRAINT `portfolios_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`course_id` int NOT NULL,
	`score` double NOT NULL,
	`grade` varchar(255) NOT NULL,
	`semester` varchar(255) NOT NULL,
	CONSTRAINT `results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `space_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`space_id` int NOT NULL,
	`purpose` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`start_time` varchar(255) NOT NULL,
	`end_time` varchar(255) NOT NULL,
	`booked_by_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `space_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`course_id` int NOT NULL,
	`semester` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'registered',
	CONSTRAINT `student_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_mandatory_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`document_type` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`file_url` varchar(255) NOT NULL,
	`file_type` varchar(255) NOT NULL,
	`file_size` int NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'Pending',
	`admin_feedback` varchar(255),
	`reviewed_by_id` int,
	`reviewed_at` timestamp,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_mandatory_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_medical_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`blood_group` varchar(255),
	`genotype` varchar(255),
	`allergies` varchar(255),
	`past_conditions` varchar(255),
	`current_medications` varchar(255),
	`immunizations` varchar(255),
	`emergency_contact_name` varchar(255),
	`emergency_contact_phone` varchar(255),
	`emergency_contact_relation` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_medical_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_medical_profiles_student_id_unique` UNIQUE(`student_id`)
);
--> statement-breakpoint
CREATE TABLE `student_wellness_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`mood` int NOT NULL,
	`sleep_hours` int NOT NULL,
	`nutrition_quality` int NOT NULL,
	`water_intake` int NOT NULL,
	`exercise_minutes` int NOT NULL,
	`notes` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_wellness_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `timetables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`day_of_week` varchar(255) NOT NULL,
	`start_time` varchar(255) NOT NULL,
	`end_time` varchar(255) NOT NULL,
	`venue` varchar(255) NOT NULL,
	`uploaded_by_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timetables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transcript_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`destination` varchar(255) NOT NULL,
	`purpose` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'Pending',
	`request_date` timestamp NOT NULL DEFAULT (now()),
	`processed_date` timestamp,
	CONSTRAINT `transcript_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `university_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` varchar(255) NOT NULL,
	`author` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL,
	`image_url` varchar(255),
	`is_published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `university_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`username` varchar(255),
	`phone` varchar(255),
	`profile_picture` varchar(255),
	`role` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`theme_preference` varchar(255) DEFAULT 'system',
	`doctor_status` varchar(255) DEFAULT 'Available',
	`department` varchar(255),
	`faculty` varchar(255),
	`created_at` timestamp NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_lecturer_id_users_id_fk` FOREIGN KEY (`lecturer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_trails` ADD CONSTRAINT `audit_trails_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_loans` ADD CONSTRAINT `book_loans_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_loans` ADD CONSTRAINT `book_loans_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campus_wellness_feed` ADD CONSTRAINT `campus_wellness_feed_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_appointments` ADD CONSTRAINT `clinic_appointments_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_appointments` ADD CONSTRAINT `clinic_appointments_doctor_id_users_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_form_submissions` ADD CONSTRAINT `clinic_form_submissions_form_id_clinic_forms_id_fk` FOREIGN KEY (`form_id`) REFERENCES `clinic_forms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_form_submissions` ADD CONSTRAINT `clinic_form_submissions_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_form_submissions` ADD CONSTRAINT `clinic_form_submissions_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_forms` ADD CONSTRAINT `clinic_forms_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_lab_requests` ADD CONSTRAINT `clinic_lab_requests_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_lab_requests` ADD CONSTRAINT `clinic_lab_requests_doctor_id_users_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_records` ADD CONSTRAINT `clinic_records_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_records` ADD CONSTRAINT `clinic_records_staff_id_users_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_surveys` ADD CONSTRAINT `clinic_surveys_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinic_surveys` ADD CONSTRAINT `clinic_surveys_appointment_id_clinic_appointments_id_fk` FOREIGN KEY (`appointment_id`) REFERENCES `clinic_appointments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_news_events` ADD CONSTRAINT `cms_news_events_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_allocations` ADD CONSTRAINT `course_allocations_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_allocations` ADD CONSTRAINT `course_allocations_lecturer_id_users_id_fk` FOREIGN KEY (`lecturer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_allocations` ADD CONSTRAINT `course_allocations_allocated_by_id_users_id_fk` FOREIGN KEY (`allocated_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_likes` ADD CONSTRAINT `course_discussion_likes_discussion_id_course_discussions_id_fk` FOREIGN KEY (`discussion_id`) REFERENCES `course_discussions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_likes` ADD CONSTRAINT `course_discussion_likes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_poll_options` ADD CONSTRAINT `course_discussion_poll_options_discussion_id_course_discussions_id_fk` FOREIGN KEY (`discussion_id`) REFERENCES `course_discussions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_poll_votes` ADD CONSTRAINT `course_discussion_poll_votes_discussion_id_course_discussions_id_fk` FOREIGN KEY (`discussion_id`) REFERENCES `course_discussions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_poll_votes` ADD CONSTRAINT `course_discussion_poll_votes_option_id_course_discussion_poll_options_id_fk` FOREIGN KEY (`option_id`) REFERENCES `course_discussion_poll_options`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_poll_votes` ADD CONSTRAINT `course_discussion_poll_votes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_replies` ADD CONSTRAINT `course_discussion_replies_discussion_id_course_discussions_id_fk` FOREIGN KEY (`discussion_id`) REFERENCES `course_discussions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_replies` ADD CONSTRAINT `course_discussion_replies_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_reply_likes` ADD CONSTRAINT `course_discussion_reply_likes_reply_id_course_discussion_replies_id_fk` FOREIGN KEY (`reply_id`) REFERENCES `course_discussion_replies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussion_reply_likes` ADD CONSTRAINT `course_discussion_reply_likes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussions` ADD CONSTRAINT `course_discussions_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discussions` ADD CONSTRAINT `course_discussions_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_evaluations` ADD CONSTRAINT `course_evaluations_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_department_id_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_faculty_id_faculties_id_fk` FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_uploader_id_users_id_fk` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `facility_bookings` ADD CONSTRAINT `facility_bookings_facility_id_facilities_id_fk` FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `facility_bookings` ADD CONSTRAINT `facility_bookings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorite_documents` ADD CONSTRAINT `favorite_documents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorite_documents` ADD CONSTRAINT `favorite_documents_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `health_insurance_records` ADD CONSTRAINT `health_insurance_records_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hostel_applications` ADD CONSTRAINT `hostel_applications_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hostel_applications` ADD CONSTRAINT `hostel_applications_hostel_id_hostels_id_fk` FOREIGN KEY (`hostel_id`) REFERENCES `hostels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hostel_applications` ADD CONSTRAINT `hostel_applications_room_id_hostel_rooms_id_fk` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hostel_rooms` ADD CONSTRAINT `hostel_rooms_hostel_id_hostels_id_fk` FOREIGN KEY (`hostel_id`) REFERENCES `hostels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_posted_by_users_id_fk` FOREIGN KEY (`posted_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lab_equipment_logs` ADD CONSTRAINT `lab_equipment_logs_equipment_id_lab_equipments_id_fk` FOREIGN KEY (`equipment_id`) REFERENCES `lab_equipments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lab_equipment_logs` ADD CONSTRAINT `lab_equipment_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lab_equipments` ADD CONSTRAINT `lab_equipments_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lecturer_attendance` ADD CONSTRAINT `lecturer_attendance_timetable_id_timetables_id_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lecturer_attendance` ADD CONSTRAINT `lecturer_attendance_lecturer_id_users_id_fk` FOREIGN KEY (`lecturer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lecturer_attendance` ADD CONSTRAINT `lecturer_attendance_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lecturer_attendance` ADD CONSTRAINT `lecturer_attendance_marked_by_id_users_id_fk` FOREIGN KEY (`marked_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medication_reminders` ADD CONSTRAINT `medication_reminders_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_receiver_id_users_id_fk` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portal_feedback` ADD CONSTRAINT `portal_feedback_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolio_certificates` ADD CONSTRAINT `portfolio_certificates_portfolio_id_portfolios_id_fk` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolio_experiences` ADD CONSTRAINT `portfolio_experiences_portfolio_id_portfolios_id_fk` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolio_projects` ADD CONSTRAINT `portfolio_projects_portfolio_id_portfolios_id_fk` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `results` ADD CONSTRAINT `results_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `results` ADD CONSTRAINT `results_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `space_bookings` ADD CONSTRAINT `space_bookings_space_id_campus_spaces_id_fk` FOREIGN KEY (`space_id`) REFERENCES `campus_spaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `space_bookings` ADD CONSTRAINT `space_bookings_booked_by_id_users_id_fk` FOREIGN KEY (`booked_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_mandatory_documents` ADD CONSTRAINT `student_mandatory_documents_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_mandatory_documents` ADD CONSTRAINT `student_mandatory_documents_reviewed_by_id_users_id_fk` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_medical_profiles` ADD CONSTRAINT `student_medical_profiles_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_wellness_logs` ADD CONSTRAINT `student_wellness_logs_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetables` ADD CONSTRAINT `timetables_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetables` ADD CONSTRAINT `timetables_uploaded_by_id_users_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transcript_requests` ADD CONSTRAINT `transcript_requests_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;