import { pgTable, text, integer, serial, timestamp, doublePrecision, boolean, jsonb, uniqueIndex, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  username: text('username').unique(),
  phone: text('phone'),
  profilePicture: text('profile_picture'),
  role: text('role', { enum: ['Administrator', 'Admin', 'Content Manager', 'ICT Admin', 'Registrar', 'Bursary', 'Dean', 'HOD', 'Lecturer', 'Student', 'Applicant', 'Library', 'Portal', 'Clinic', 'Pharmacy', 'Laboratory', 'Academic Officer', 'Admission Officer'] }).notNull(),
  password: text('password').notNull(),
  themePreference: text('theme_preference').default('system'),
  doctorStatus: text('doctor_status').default('Available'), // 'Available', 'In Consultation', 'Away'
  department: text('department'),
  faculty: text('faculty'),
  createdAt: timestamp('created_at').notNull(),
});

export const faculties = pgTable('faculties', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
});

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  facultyId: integer('faculty_id').references(() => faculties.id, { onDelete: 'cascade' }),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  credits: integer('credits').notNull(),
  departmentId: integer('department_id').references(() => departments.id, { onDelete: 'cascade' }),
  semester: text('semester').notNull(), // e.g., '1st', '2nd'
  prerequisites: text('prerequisites'), // Comma-separated course codes
  type: text('type').default('Core').notNull(),
  contributesToGpa: boolean('contributes_to_gpa').default(true).notNull(),
  contributesToCgpa: boolean('contributes_to_cgpa').default(true).notNull(),
  contributesToCreditUnits: boolean('contributes_to_credit_units').default(true).notNull(),
});

export const studentCourses = pgTable('student_courses', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  semester: text('semester').notNull(),
  status: text('status').default('registered').notNull(),
});

export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  academicSession: text('academic_session').notNull().default('2025/2026'),
  semester: text('semester').notNull(),
  caScore: doublePrecision('ca_score'),
  caBreakdown: jsonb('ca_breakdown'),
  examScore: doublePrecision('exam_score'),
  score: doublePrecision('score'),
  grade: text('grade'),
  gradePoint: doublePrecision('grade_point'),
  qualityPoint: doublePrecision('quality_point'),
  status: text('status', { enum: ['draft', 'submitted', 'returned', 'hod_approved', 'registrar_approved', 'published', 'locked'] }).notNull().default('draft'),
  returnReason: text('return_reason'),
  approvedByHodId: integer('approved_by_hod_id').references(() => users.id),
  approvedByRegistrarId: integer('approved_by_registrar_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  studentCourseSessionUnique: uniqueIndex('results_student_course_session_idx').on(table.studentId, table.courseId, table.academicSession, table.semester),
  statusIdx: index('results_status_idx').on(table.status),
  studentIdx: index('results_student_idx').on(table.studentId)
}));

export const resultsRelations = relations(results, ({ one, many }) => ({
  student: one(users, { fields: [results.studentId], references: [users.id], relationName: 'studentResults' }),
  course: one(courses, { fields: [results.courseId], references: [courses.id] }),
  amendments: many(resultAmendments),
  auditLogs: many(resultAuditLogs)
}));

export const feeSettings = pgTable("fee_settings", {
  id: serial('id').primaryKey(),
  type: text("type").notNull(),
  amount: doublePrecision("amount").notNull(),
  level: text("level"),
  department: text("department"),
  programme: text("programme"),
  indigene: text("indigene"),
  session: text("session"),
  semester: text("semester"),
  description: text("description"),
  deadline: timestamp("deadline"),
  updatedAt: timestamp('updated_at').notNull(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: doublePrecision('amount').notNull(),
  purpose: text('purpose').notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  session: text('session'),
  semester: text('semester'),
  reference: text('reference').notNull().unique(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').notNull(),
});

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  passport: text('passport'),
  fullName: text('full_name'),
  firstName: text('first_name'),
  middleName: text('middle_name'),
  lastName: text('last_name'),
  regNo: text('reg_no'),
  email: text('email'),
  dob: text('dob'),
  address: text('address'),
  nationality: text('nationality'),
  indigene: text('indigene'),
  lga: text('lga'),
  level: text('level'),
  department: text('department'),
  courseOfStudy: text('course_of_study'),
  maritalStatus: text('marital_status'),
  religion: text('religion'),
  nextOfKinName: text('next_of_kin_name'),
  nextOfKinAddress: text('next_of_kin_address'),
  sponsorName: text('sponsor_name'),
  sponsorAddress: text('sponsor_address'),
  fslcDocument: text('fslc_document'),
  ssceDocument: text('ssce_document'),
  birthCertificate: text('birth_certificate'),
  stateOfOriginDocument: text('state_of_origin_document'),
  otherDocument1: text('other_document_1'),
  otherDocument2: text('other_document_2'),
  otherDocument3: text('other_document_3'),
  otherDocument4: text('other_document_4'),
  otherDocument5: text('other_document_5'),
  programOfInterest: text('program_of_interest').notNull(),
  session: text('session'),
  status: text('status').default('pending').notNull(),
  screeningNotes: text('screening_notes'),
  createdAt: timestamp('created_at').notNull(),
});

export const auditTrails = pgTable('audit_trails', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').notNull(),
});

export const courseEvaluations = pgTable('course_evaluations', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),
  feedback: text('feedback').notNull(),
  semester: text('semester').notNull(),
  createdAt: timestamp('created_at').notNull(),
});

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  courseOfStudy: text('course_of_study'),
  message: text('message').notNull(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: integer('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url'),
  attachmentName: text('attachment_name'),
  isRead: text('is_read').default('false').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const calendarEvents = pgTable('calendar_events', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // The lecturer who created it
  title: text('title').notNull(),
  type: text('type').notNull(), // 'Lecture', 'Assignment Deadline', 'Exam'
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  uploaderId: integer('uploader_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // 'Course Material', 'Syllabus', 'Administrative Form', 'Other'
  isPublic: text('is_public').default('false').notNull(), // 'true' for all students, 'false' for enrolled only
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const favoriteDocuments = pgTable('favorite_documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  documentId: integer('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const studentMandatoryDocuments = pgTable('student_mandatory_documents', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  documentType: text('document_type').notNull(), // 'Academic Transcript', 'SSCE / O-Level Certificate', 'Birth Certificate', 'Certificate of Origin', 'Passport Photo', 'Medical Fitness Certificate', 'Other'
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  status: text('status').notNull().default('Pending'), // 'Pending', 'Approved', 'Rejected'
  adminFeedback: text('admin_feedback'),
  reviewedById: integer('reviewed_by_id').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  category: text('category').notNull(),
  coverColor: text('cover_color').notNull(),
  fileUrl: text('file_url'),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  available: boolean('available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const bookLoans = pgTable('book_loans', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  borrowedDate: timestamp('borrowed_date').notNull().defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  status: text('status').notNull().default('active'), // 'active', 'overdue', 'returned'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  status: text('status', { enum: ['Present', 'Absent', 'Late', 'Excused'] }).notNull(),
  lecturerId: integer('lecturer_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const hostels = pgTable('hostels', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  gender: text('gender', { enum: ['Male', 'Female', 'Mixed'] }).notNull(),
  description: text('description'),
  status: text('status', { enum: ['Available', 'Full', 'Maintenance'] }).default('Available').notNull(),
});

export const hostelRooms = pgTable('hostel_rooms', {
  id: serial('id').primaryKey(),
  hostelId: integer('hostel_id').references(() => hostels.id, { onDelete: 'cascade' }).notNull(),
  roomNumber: text('room_number').notNull(),
  capacity: integer('capacity').notNull(),
  occupancy: integer('occupancy').default(0).notNull(),
});

export const hostelApplications = pgTable('hostel_applications', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  hostelId: integer('hostel_id').references(() => hostels.id),
  roomId: integer('room_id').references(() => hostelRooms.id),
  status: text('status', { enum: ['Pending', 'Approved', 'Rejected', 'Allocated'] }).default('Pending').notNull(),
  applicationDate: timestamp('application_date').defaultNow().notNull(),
  session: text('session').notNull(),
});


export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'info', 'warning', 'success', 'error'
  isRead: text('is_read').default('false').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


export const clinicRecords = pgTable('clinic_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  staffId: integer('staff_id').references(() => users.id).notNull(),
  visitDate: timestamp('visit_date').notNull().defaultNow(),
  symptoms: text('symptoms').notNull(),
  diagnosis: text('diagnosis'),
  prescription: text('prescription'),
  prescriptionStatus: text('prescription_status').default('Pending'),
  status: text('status').default('Completed').notNull(), // 'Active', 'Completed', 'Referred', 'Admitted'
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clinicAppointments = pgTable('clinic_appointments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  doctorId: integer('doctor_id').references(() => users.id, { onDelete: 'set null' }),
  appointmentDate: timestamp('appointment_date').notNull(),
  reason: text('reason').notNull(),
  status: text('status').default('Scheduled').notNull(), // 'Scheduled', 'Completed', 'Cancelled'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


export const pharmacyInventory = pgTable('pharmacy_inventory', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku'),
  description: text('description'),
  category: text('category').notNull(),
  unit: text('unit').notNull(), // 'tablet', 'bottle', 'ml', 'ampoule', 'pack'
  stockLevel: integer('stock_level').notNull().default(0),
  reorderThreshold: integer('reorder_threshold').notNull().default(10),
  expiryDate: timestamp('expiry_date'),
  supplier: text('supplier'),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
});


export const studentMedicalProfiles = pgTable('student_medical_profiles', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  bloodGroup: text('blood_group'),
  genotype: text('genotype'),
  allergies: text('allergies'),
  pastConditions: text('past_conditions'),
  currentMedications: text('current_medications'),
  immunizations: text('immunizations'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelation: text('emergency_contact_relation'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const courseDiscussions = pgTable('course_discussions', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url'),
  attachmentName: text('attachment_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isPinned: boolean('is_pinned').notNull().default(false),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});



export const courseDiscussionPollOptions = pgTable('course_discussion_poll_options', {
  id: serial('id').primaryKey(),
  discussionId: integer('discussion_id').references(() => courseDiscussions.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
});

export const courseDiscussionPollVotes = pgTable('course_discussion_poll_votes', {
  id: serial('id').primaryKey(),
  discussionId: integer('discussion_id').references(() => courseDiscussions.id, { onDelete: 'cascade' }).notNull(),
  optionId: integer('option_id').references(() => courseDiscussionPollOptions.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseDiscussionLikes = pgTable('course_discussion_likes', {
  id: serial('id').primaryKey(),
  discussionId: integer('discussion_id').references(() => courseDiscussions.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseDiscussionReplyLikes = pgTable('course_discussion_reply_likes', {
  id: serial('id').primaryKey(),
  replyId: integer('reply_id').references(() => courseDiscussionReplies.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseDiscussionReplies = pgTable('course_discussion_replies', {
  id: serial('id').primaryKey(),
  discussionId: integer('discussion_id').references(() => courseDiscussions.id, { onDelete: 'cascade' }).notNull(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url'),
  attachmentName: text('attachment_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});


export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location').notNull(),
  type: text('type').notNull(), // 'Internship', 'Part-time', 'Full-time'
  description: text('description').notNull(),
  requirements: text('requirements'),
  salary: text('salary'),
  postedBy: integer('posted_by').references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('Open').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const jobApplications = pgTable('job_applications', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').default('Pending').notNull(), // 'Pending', 'Reviewed', 'Accepted', 'Rejected'
  coverLetter: text('cover_letter'),
  resumeUrl: text('resume_url'),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
});

export const transcriptRequests = pgTable('transcript_requests', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  destination: text('destination').notNull(),
  purpose: text('purpose').notNull(),
  status: text('status').default('Pending').notNull(), // 'Pending', 'Processing', 'Sent', 'Rejected'
  requestDate: timestamp('request_date').notNull().defaultNow(),
  processedDate: timestamp('processed_date'),
});

export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  bio: text('bio'),
  skills: text('skills'),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  websiteUrl: text('website_url'),
  isPublic: boolean('is_public').default(false).notNull(),
});

export const portfolioProjects = pgTable('portfolio_projects', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  linkUrl: text('link_url'),
});

export const portfolioExperiences = pgTable('portfolio_experiences', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }).notNull(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  description: text('description'),
});

export const portfolioCertificates = pgTable('portfolio_certificates', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  issuer: text('issuer').notNull(),
  dateIssued: text('date_issued'),
  credentialUrl: text('credential_url'),
});

export const clinicForms = pgTable('clinic_forms', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  fields: text('fields').notNull(), // JSON string representing form schema
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clinicFormSubmissions = pgTable('clinic_form_submissions', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').references(() => clinicForms.id, { onDelete: 'cascade' }).notNull(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  data: text('data').notNull(), // JSON string representing filled data
  status: text('status').default('Pending').notNull(), // 'Pending', 'Reviewed'
  reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clinicLabRequests = pgTable('clinic_lab_requests', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  doctorId: integer('doctor_id').references(() => users.id, { onDelete: 'set null' }),
  testsRequested: text('tests_requested').notNull(), // Comma-separated or JSON
  notes: text('notes'),
  status: text('status').default('Pending').notNull(), // 'Pending', 'In Progress', 'Completed'
  resultsSummary: text('results_summary'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const healthInsuranceRecords = pgTable('health_insurance_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  providerName: text('provider_name').notNull(),
  policyNumber: text('policy_number').notNull(),
  groupNumber: text('group_number'),
  coverageStartDate: text('coverage_start_date'),
  coverageEndDate: text('coverage_end_date'),
  status: text('status').default('Pending Verification').notNull(), // 'Pending Verification', 'Active', 'Expired', 'Rejected'
  verificationNotes: text('verification_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const studentWellnessLogs = pgTable('student_wellness_logs', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull().defaultNow(),
  mood: integer('mood').notNull(), // 1 to 5 (1=Terrible, 5=Excellent)
  sleepHours: integer('sleep_hours').notNull(),
  nutritionQuality: integer('nutrition_quality').notNull(), // 1 to 5
  waterIntake: integer('water_intake').notNull(), // glasses or ml
  exerciseMinutes: integer('exercise_minutes').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clinicSurveys = pgTable('clinic_surveys', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  appointmentId: integer('appointment_id').references(() => clinicAppointments.id, { onDelete: 'cascade' }).notNull(),
  overallRating: integer('overall_rating').notNull(),
  waitTimeRating: integer('wait_time_rating').notNull(),
  cleanlinessRating: integer('cleanliness_rating').notNull(),
  staffFriendlinessRating: integer('staff_friendliness_rating').notNull(),
  comments: text('comments'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const medicationReminders = pgTable('medication_reminders', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  medicationName: text('medication_name').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  times: text('times').notNull(), // Comma-separated times like "08:00, 20:00"
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const campusWellnessFeed = pgTable('campus_wellness_feed', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url'),
  attachmentName: text('attachment_name'),
  category: text('category').notNull(), // 'Alert', 'Announcement', 'Tip'
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const timetables = pgTable('timetables', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: text('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  venue: text('venue').notNull(),
  uploadedById: integer('uploaded_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseAllocations = pgTable('course_allocations', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  lecturerId: integer('lecturer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  academicYear: text('academic_year').notNull(),
  semester: text('semester').notNull(),
  allocatedById: integer('allocated_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const lecturerAttendance = pgTable('lecturer_attendance', {
  id: serial('id').primaryKey(),
  timetableId: integer('timetable_id').references(() => timetables.id, { onDelete: 'cascade' }),
  lecturerId: integer('lecturer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  status: text('status').notNull(), // 'Present', 'Absent', 'Late'
  markedById: integer('marked_by_id').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const academicCalendarEvents = pgTable('academic_calendar_events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  eventType: text('event_type').notNull(), // 'Milestone', 'Holiday', 'Exam', 'Other'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const campusSpaces = pgTable('campus_spaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  capacity: integer('capacity').notNull(),
  type: text('type').notNull(), // 'Lecture Hall', 'Exam Hall', 'Laboratory', 'Seminar Room', 'Study Pod'
  equipment: text('equipment').default('[]'), // JSON array of equipment strings
});

export const spaceBookings = pgTable('space_bookings', {
  id: serial('id').primaryKey(),
  spaceId: integer('space_id').references(() => campusSpaces.id, { onDelete: 'cascade' }).notNull(),
  purpose: text('purpose').notNull(),
  date: timestamp('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  bookedById: integer('booked_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const portalFeedback = pgTable('portal_feedback', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // 'Bug', 'Suggestion', 'Other'
  message: text('message').notNull(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const universityNews = pgTable('university_news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  author: text('author').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});



export const labEquipmentLogs = pgTable('lab_equipment_logs', {
  id: serial('id').primaryKey(),
  equipmentId: integer('equipment_id').notNull().references(() => labEquipments.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // 'Checkout', 'Return', 'Added', 'Updated', 'Deleted'
  quantityChanged: integer('quantity_changed').notNull().default(0),
  notes: text('notes'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

export const labEquipments = pgTable('lab_equipments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  quantity: integer('quantity').notNull().default(0),
  minThreshold: integer('min_threshold').notNull().default(5),
  status: text('status').notNull().default('Operational'), // 'Operational', 'Under Maintenance', 'Broken', 'Out of Stock'
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  updatedBy: integer('updated_by').references(() => users.id),
});

export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const facilities = pgTable('facilities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'Lab', 'Library Room', 'Sports', etc.
  capacity: integer('capacity'),
  location: text('location'),
  status: text('status').default('Available'), // 'Available', 'Under Maintenance'
});

export const facilityBookings = pgTable('facility_bookings', {
  id: serial('id').primaryKey(),
  facilityId: integer('facility_id').references(() => facilities.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  purpose: text('purpose'),
  status: text('status').default('Pending'), // 'Pending', 'Approved', 'Rejected', 'Cancelled'
});

export const contentBlocks = pgTable('content_blocks', {
  id: serial('id').primaryKey(),
  section: text('section').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  orderIndex: integer('order_index').default(0),
  isPublished: boolean('is_published').default(true),
  status: text('status').default('Draft'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cmsNewsEvents = pgTable('cms_news_events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  imageUrl: text('image_url'),
  date: timestamp('date'),
  endDate: timestamp('end_date'),
  location: text('location'),
  status: text('status').default('Draft'),
  publishDate: timestamp('publish_date'),
  authorId: integer('author_id').references(() => users.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  lecturerId: integer('lecturer_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  dueDate: timestamp('due_date').notNull(),
  totalMarks: integer('total_marks').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => assignments.id).notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  marksAwarded: integer('marks_awarded'),
  feedback: text('feedback'),
  status: text('status', { enum: ['submitted', 'graded', 'late'] }).notNull(),
});


export const gradingRules = pgTable('grading_rules', {
  id: serial('id').primaryKey(),
  minScore: doublePrecision('min_score').notNull(),
  maxScore: doublePrecision('max_score').notNull(),
  grade: text('grade').notNull(),
  gradePoint: doublePrecision('grade_point').notNull(),
  description: text('description').notNull(),
  isPass: boolean('is_pass').notNull().default(true),
}, (table) => ({
  gradeUnique: uniqueIndex('grading_rules_grade_idx').on(table.grade)
}));

export const semesterGpaRecords = pgTable('semester_gpa_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  academicSession: text('academic_session').notNull(),
  semester: text('semester').notNull(),
  totalCreditUnits: integer('total_credit_units').notNull(),
  totalEarnedCredits: integer('total_earned_credits').notNull().default(0),
  totalQualityPoints: doublePrecision('total_quality_points').notNull(),
  gpa: doublePrecision('gpa').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  semesterGpaStudentSessionUnique: uniqueIndex('semester_gpa_student_session_idx').on(table.studentId, table.academicSession, table.semester)
}));

export const semesterGpaRecordsRelations = relations(semesterGpaRecords, ({ one }) => ({
  student: one(users, { fields: [semesterGpaRecords.studentId], references: [users.id] })
}));

export const cgpaRecords = pgTable('cgpa_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  totalCreditUnits: integer('total_credit_units').notNull(),
  totalEarnedCredits: integer('total_earned_credits').notNull().default(0),
  totalQualityPoints: doublePrecision('total_quality_points').notNull(),
  cgpa: doublePrecision('cgpa').notNull(),
  academicStanding: text('academic_standing').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  cgpaStudentUnique: uniqueIndex('cgpa_student_idx').on(table.studentId)
}));

export const cgpaRecordsRelations = relations(cgpaRecords, ({ one }) => ({
  student: one(users, { fields: [cgpaRecords.studentId], references: [users.id] })
}));

export const resultAmendments = pgTable('result_amendments', {
  id: serial('id').primaryKey(),
  resultId: integer('result_id').references(() => results.id, { onDelete: 'cascade' }).notNull(),
  requestedById: integer('requested_by_id').references(() => users.id).notNull(),
  oldCa: doublePrecision('old_ca'),
  newCa: doublePrecision('new_ca'),
  oldExam: doublePrecision('old_exam'),
  newExam: doublePrecision('new_exam'),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  approvedById: integer('approved_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('result_amendments_status_idx').on(table.status),
  resultIdx: index('result_amendments_result_idx').on(table.resultId)
}));

export const resultAmendmentsRelations = relations(resultAmendments, ({ one }) => ({
  result: one(results, { fields: [resultAmendments.resultId], references: [results.id] }),
  requestedBy: one(users, { fields: [resultAmendments.requestedById], references: [users.id], relationName: 'amendmentRequestedBy' }),
  approvedBy: one(users, { fields: [resultAmendments.approvedById], references: [users.id], relationName: 'amendmentApprovedBy' })
}));

export const resultAuditLogs = pgTable('result_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  action: text('action').notNull(),
  oldCa: doublePrecision('old_ca'),
  newCa: doublePrecision('new_ca'),
  oldExam: doublePrecision('old_exam'),
  newExam: doublePrecision('new_exam'),
  oldGrade: text('old_grade'),
  newGrade: text('new_grade'),
  reason: text('reason'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  studentIdx: index('result_audit_student_idx').on(table.studentId),
  courseIdx: index('result_audit_course_idx').on(table.courseId)
}));

export const resultAuditLogsRelations = relations(resultAuditLogs, ({ one }) => ({
  user: one(users, { fields: [resultAuditLogs.userId], references: [users.id], relationName: 'auditLogUser' }),
  student: one(users, { fields: [resultAuditLogs.studentId], references: [users.id], relationName: 'auditLogStudent' }),
  course: one(courses, { fields: [resultAuditLogs.courseId], references: [courses.id] })
}));

export const transcripts = pgTable('transcripts', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  generatedById: integer('generated_by_id').references(() => users.id).notNull(),
  verificationCode: text('verification_code').unique().notNull(),
  status: text('status', { enum: ['valid', 'revoked'] }).notNull().default('valid'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const examSchedules = pgTable('exam_schedules', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  examDate: text('exam_date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  venue: text('venue').notNull(),
  invigilatorId: integer('invigilator_id').references(() => users.id),
  instructions: text('instructions'),
  status: text('status').default('Scheduled').notNull(), // 'Scheduled', 'Completed', 'Cancelled'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const academicSessions = pgTable('academic_sessions', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g., "2023/2024"
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(false).notNull(),
  isAdmissionActive: boolean('is_admission_active').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const academicSessionsRelations = relations(academicSessions, ({ many }) => ({
  semesters: many(semesters),
}));

export const semesters = pgTable('semesters', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => academicSessions.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(), // e.g., "First", "Second"
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    sessionNameUnique: uniqueIndex('session_semester_name_idx').on(table.sessionId, table.name)
  }
});

export const semestersRelations = relations(semesters, ({ one }) => ({
  session: one(academicSessions, {
    fields: [semesters.sessionId],
    references: [academicSessions.id],
  }),
}));
