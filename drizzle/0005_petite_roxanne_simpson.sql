CREATE UNIQUE INDEX "cgpa_student_idx" ON "cgpa_records" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grading_rules_grade_idx" ON "grading_rules" USING btree ("grade");--> statement-breakpoint
CREATE INDEX "result_amendments_status_idx" ON "result_amendments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "result_amendments_result_idx" ON "result_amendments" USING btree ("result_id");--> statement-breakpoint
CREATE INDEX "result_audit_student_idx" ON "result_audit_logs" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "result_audit_course_idx" ON "result_audit_logs" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "results_student_course_session_idx" ON "results" USING btree ("student_id","course_id","academic_session","semester");--> statement-breakpoint
CREATE INDEX "results_status_idx" ON "results" USING btree ("status");--> statement-breakpoint
CREATE INDEX "results_student_idx" ON "results" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "semester_gpa_student_session_idx" ON "semester_gpa_records" USING btree ("student_id","academic_session","semester");