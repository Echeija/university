import { mysqlTable, int, varchar, text, timestamp, boolean, json, double, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 255 }).unique(),
  phone: varchar('phone', { length: 255 }),
  profilePicture: varchar('profile_picture', { length: 255 }),
  role: varchar('role', { length: 255, enum: ['Administrator', 'Admin', 'Content Manager', 'ICT Admin', 'Registrar', 'Bursary', 'Dean', 'HOD', 'Lecturer', 'Student', 'Applicant', 'Library', 'Portal', 'Clinic', 'Pharmacy', 'Laboratory', 'Academic Officer', 'Admission Officer'] }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  themePreference: varchar('theme_preference', { length: 255 }).default('system'),
  doctorStatus: varchar('doctor_status', { length: 255 }).default('Available'), // 'Available', 'In Consultation', 'Away'
  department: varchar('department', { length: 255 }),
  faculty: varchar('faculty', { length: 255 }),
  createdAt: timestamp('created_at').notNull(),
});

export const faculties = mysqlTable('faculties', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
});

export const departments = mysqlTable('departments', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  facultyId: int('faculty_id').references(() => faculties.id, { onDelete: 'cascade' }),
});

export const courses = mysqlTable('courses', {
  id: int('id').autoincrement().primaryKey(),
  code: varchar('code', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  credits: int('credits').notNull(),
  departmentId: int('department_id').references(() => departments.id, { onDelete: 'cascade' }),
  semester: varchar('semester', { length: 255 }).notNull(), // e.g., '1st', '2nd'
  prerequisites: varchar('prerequisites', { length: 255 }), // Comma-separated course codes
});

export const studentCourses = mysqlTable('student_courses', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  semester: varchar('semester', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }).default('registered').notNull(),
});

export const results = mysqlTable('results', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  score: double('score').notNull(),
  grade: varchar('grade', { length: 255 }).notNull(),
  semester: varchar('semester', { length: 255 }).notNull(),
});

export const feeSettings = mysqlTable("fee_settings", {
  id: int('id').autoincrement().primaryKey(),
  type: text("type").notNull(),
  amount: double("amount").notNull(),
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

export const payments = mysqlTable('payments', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: double('amount').notNull(),
  purpose: varchar('purpose', { length: 255 }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }),
  session: varchar('session', { length: 255 }),
  semester: varchar('semester', { length: 255 }),
  reference: varchar('reference', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 255 }).default('pending').notNull(),
  createdAt: timestamp('created_at').notNull(),
});

export const applications = mysqlTable('applications', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  passport: varchar('passport', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  middleName: varchar('middle_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  regNo: varchar('reg_no', { length: 255 }),
  email: varchar('email', { length: 255 }),
  dob: varchar('dob', { length: 255 }),
  address: varchar('address', { length: 255 }),
  nationality: varchar('nationality', { length: 255 }),
  indigene: varchar('indigene', { length: 255 }),
  lga: varchar('lga', { length: 255 }),
  level: varchar('level', { length: 255 }),
  department: varchar('department', { length: 255 }),
  courseOfStudy: varchar('course_of_study', { length: 255 }),
  maritalStatus: varchar('marital_status', { length: 255 }),
  religion: varchar('religion', { length: 255 }),
  nextOfKinName: varchar('next_of_kin_name', { length: 255 }),
  nextOfKinAddress: varchar('next_of_kin_address', { length: 255 }),
  sponsorName: varchar('sponsor_name', { length: 255 }),
  sponsorAddress: varchar('sponsor_address', { length: 255 }),
  fslcDocument: varchar('fslc_document', { length: 255 }),
  ssceDocument: varchar('ssce_document', { length: 255 }),
  birthCertificate: varchar('birth_certificate', { length: 255 }),
  stateOfOriginDocument: varchar('state_of_origin_document', { length: 255 }),
  otherDocument1: varchar('other_document_1', { length: 255 }),
  otherDocument2: varchar('other_document_2', { length: 255 }),
  otherDocument3: varchar('other_document_3', { length: 255 }),
  otherDocument4: varchar('other_document_4', { length: 255 }),
  otherDocument5: varchar('other_document_5', { length: 255 }),
  programOfInterest: varchar('program_of_interest', { length: 255 }).notNull(),
  session: varchar('session', { length: 255 }),
  status: varchar('status', { length: 255 }).default('pending').notNull(),
  screeningNotes: varchar('screening_notes', { length: 255 }),
  createdAt: timestamp('created_at').notNull(),
});

export const auditTrails = mysqlTable('audit_trails', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  details: varchar('details', { length: 255 }),
  createdAt: timestamp('created_at').notNull(),
});

export const courseEvaluations = mysqlTable('course_evaluations', {
  id: int('id').autoincrement().primaryKey(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  rating: int('rating').notNull(),
  feedback: varchar('feedback', { length: 255 }).notNull(),
  semester: varchar('semester', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull(),
});

export const inquiries = mysqlTable('inquiries', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 255 }),
  courseOfStudy: varchar('course_of_study', { length: 255 }),
  message: varchar('message', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }).default('pending').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const messages = mysqlTable('messages', {
  id: int('id').autoincrement().primaryKey(),
  senderId: int('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: int('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 255 }).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  attachmentUrl: varchar('attachment_url', { length: 255 }),
  attachmentName: varchar('attachment_name', { length: 255 }),
  isRead: varchar('is_read', { length: 255 }).default('false').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const calendarEvents = mysqlTable('calendar_events', {
  id: int('id').autoincrement().primaryKey(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // The lecturer who created it
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }).notNull(), // 'Lecture', 'Assignment Deadline', 'Exam'
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const documents = mysqlTable('documents', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  fileUrl: varchar('file_url', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 255 }).notNull(),
  fileSize: int('file_size').notNull(), // in bytes
  uploaderId: int('uploader_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 255 }).notNull(), // 'Course Material', 'Syllabus', 'Administrative Form', 'Other'
  isPublic: varchar('is_public', { length: 255 }).default('false').notNull(), // 'true' for all students, 'false' for enrolled only
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const favoriteDocuments = mysqlTable('favorite_documents', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  documentId: int('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const studentMandatoryDocuments = mysqlTable('student_mandatory_documents', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  documentType: varchar('document_type', { length: 255 }).notNull(), // 'Academic Transcript', 'SSCE / O-Level Certificate', 'Birth Certificate', 'Certificate of Origin', 'Passport Photo', 'Medical Fitness Certificate', 'Other'
  title: varchar('title', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 255 }).notNull(),
  fileSize: int('file_size').notNull(), // in bytes
  status: varchar('status', { length: 255 }).notNull().default('Pending'), // 'Pending', 'Approved', 'Rejected'
  adminFeedback: varchar('admin_feedback', { length: 255 }),
  reviewedById: int('reviewed_by_id').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

export const books = mysqlTable('books', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  coverColor: varchar('cover_color', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 255 }),
  fileType: varchar('file_type', { length: 255 }),
  fileSize: int('file_size'),
  available: boolean('available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const bookLoans = mysqlTable('book_loans', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bookId: int('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  borrowedDate: timestamp('borrowed_date').notNull().defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  status: varchar('status', { length: 255 }).notNull().default('active'), // 'active', 'overdue', 'returned'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const attendance = mysqlTable('attendance', {
  id: int('id').autoincrement().primaryKey(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  status: varchar('status', { length: 255, enum: ['Present', 'Absent', 'Late', 'Excused'] }).notNull(),
  lecturerId: int('lecturer_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const hostels = mysqlTable('hostels', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  capacity: int('capacity').notNull(),
  gender: varchar('gender', { length: 255, enum: ['Male', 'Female', 'Mixed'] }).notNull(),
  description: varchar('description', { length: 255 }),
  status: varchar('status', { length: 255, enum: ['Available', 'Full', 'Maintenance'] }).default('Available').notNull(),
});

export const hostelRooms = mysqlTable('hostel_rooms', {
  id: int('id').autoincrement().primaryKey(),
  hostelId: int('hostel_id').references(() => hostels.id, { onDelete: 'cascade' }).notNull(),
  roomNumber: varchar('room_number', { length: 255 }).notNull(),
  capacity: int('capacity').notNull(),
  occupancy: int('occupancy').default(0).notNull(),
});

export const hostelApplications = mysqlTable('hostel_applications', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  hostelId: int('hostel_id').references(() => hostels.id),
  roomId: int('room_id').references(() => hostelRooms.id),
  status: varchar('status', { length: 255, enum: ['Pending', 'Approved', 'Rejected', 'Allocated'] }).default('Pending').notNull(),
  applicationDate: timestamp('application_date').defaultNow().notNull(),
  session: varchar('session', { length: 255 }).notNull(),
});


export const notifications = mysqlTable('notifications', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: varchar('message', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }).notNull(), // 'info', 'warning', 'success', 'error'
  isRead: varchar('is_read', { length: 255 }).default('false').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


export const clinicRecords = mysqlTable('clinic_records', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  staffId: int('staff_id').references(() => users.id).notNull(),
  visitDate: timestamp('visit_date').notNull().defaultNow(),
  symptoms: varchar('symptoms', { length: 255 }).notNull(),
  diagnosis: varchar('diagnosis', { length: 255 }),
  prescription: varchar('prescription', { length: 255 }),
  prescriptionStatus: varchar('prescription_status', { length: 255 }).default('Pending'),
  status: varchar('status', { length: 255 }).default('Completed').notNull(), // 'Active', 'Completed', 'Referred', 'Admitted'
  notes: varchar('notes', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clinicAppointments = mysqlTable('clinic_appointments', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  doctorId: int('doctor_id').references(() => users.id, { onDelete: 'set null' }),
  appointmentDate: timestamp('appointment_date').notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }).default('Scheduled').notNull(), // 'Scheduled', 'Completed', 'Cancelled'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


export const pharmacyInventory = mysqlTable('pharmacy_inventory', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 255 }),
  description: varchar('description', { length: 255 }),
  category: varchar('category', { length: 255 }).notNull(),
  unit: varchar('unit', { length: 255 }).notNull(), // 'tablet', 'bottle', 'ml', 'ampoule', 'pack'
  stockLevel: int('stock_level').notNull().default(0),
  reorderThreshold: int('reorder_threshold').notNull().default(10),
  expiryDate: timestamp('expiry_date'),
  supplier: varchar('supplier', { length: 255 }),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
});


export const studentMedicalProfiles = mysqlTable('student_medical_profiles', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  bloodGroup: varchar('blood_group', { length: 255 }),
  genotype: varchar('genotype', { length: 255 }),
  allergies: varchar('allergies', { length: 255 }),
  pastConditions: varchar('past_conditions', { length: 255 }),
  currentMedications: varchar('current_medications', { length: 255 }),
  immunizations: varchar('immunizations', { length: 255 }),
  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 255 }),
  emergencyContactRelation: varchar('emergency_contact_relation', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const courseDiscussions = mysqlTable('course_discussions', {
  id: int('id').autoincrement().primaryKey(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  authorId: int('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  attachmentUrl: varchar('attachment_url', { length: 255 }),
  attachmentName: varchar('attachment_name', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isPinned: boolean('is_pinned').notNull().default(false),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});



export const courseDiscussionPollOptions = mysqlTable('course_discussion_poll_options', {
  id: int('id').autoincrement().primaryKey(),
  discussionId: int('discussion_id').references(() => courseDiscussions.id, { onDelete: 'cascade' }).notNull(),
  text: varchar('text', { length: 255 }).notNull(),
});

export const courseDiscussionPollVotes = mysqlTable('course_discussion_poll_votes', {
  id: int('id').autoincrement().primaryKey(),
  discussionId: int('discussion_id').references(() => courseDiscussions.id, { onDelete: 'cascade' }).notNull(),
  optionId: int('option_id').references(() => courseDiscussionPollOptions.id, { onDelete: 'cascade' }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseDiscussionLikes = mysqlTable('course_discussion_likes', {
  id: int('id').autoincrement().primaryKey(),
  discussionId: int('discussion_id').references(() => courseDiscussions.id, { onDelete: 'cascade' }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseDiscussionReplyLikes = mysqlTable('course_discussion_reply_likes', {
  id: int('id').autoincrement().primaryKey(),
  replyId: int('reply_id').references(() => courseDiscussionReplies.id, { onDelete: 'cascade' }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseDiscussionReplies = mysqlTable('course_discussion_replies', {
  id: int('id').autoincrement().primaryKey(),
  discussionId: int('discussion_id').references(() => courseDiscussions.id, { onDelete: 'cascade' }).notNull(),
  authorId: int('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  attachmentUrl: varchar('attachment_url', { length: 255 }),
  attachmentName: varchar('attachment_name', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});


export const jobs = mysqlTable('jobs', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }).notNull(), // 'Internship', 'Part-time', 'Full-time'
  description: varchar('description', { length: 255 }).notNull(),
  requirements: varchar('requirements', { length: 255 }),
  salary: varchar('salary', { length: 255 }),
  postedBy: int('posted_by').references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 255 }).default('Open').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const jobApplications = mysqlTable('job_applications', {
  id: int('id').autoincrement().primaryKey(),
  jobId: int('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 255 }).default('Pending').notNull(), // 'Pending', 'Reviewed', 'Accepted', 'Rejected'
  coverLetter: varchar('cover_letter', { length: 255 }),
  resumeUrl: varchar('resume_url', { length: 255 }),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
});

export const transcriptRequests = mysqlTable('transcript_requests', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  purpose: varchar('purpose', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }).default('Pending').notNull(), // 'Pending', 'Processing', 'Sent', 'Rejected'
  requestDate: timestamp('request_date').notNull().defaultNow(),
  processedDate: timestamp('processed_date'),
});

export const portfolios = mysqlTable('portfolios', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  bio: varchar('bio', { length: 255 }),
  skills: varchar('skills', { length: 255 }),
  githubUrl: varchar('github_url', { length: 255 }),
  linkedinUrl: varchar('linkedin_url', { length: 255 }),
  websiteUrl: varchar('website_url', { length: 255 }),
  isPublic: boolean('is_public').default(false).notNull(),
});

export const portfolioProjects = mysqlTable('portfolio_projects', {
  id: int('id').autoincrement().primaryKey(),
  portfolioId: int('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  linkUrl: varchar('link_url', { length: 255 }),
});

export const portfolioExperiences = mysqlTable('portfolio_experiences', {
  id: int('id').autoincrement().primaryKey(),
  portfolioId: int('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  startDate: varchar('start_date', { length: 255 }).notNull(),
  endDate: varchar('end_date', { length: 255 }),
  description: varchar('description', { length: 255 }),
});

export const portfolioCertificates = mysqlTable('portfolio_certificates', {
  id: int('id').autoincrement().primaryKey(),
  portfolioId: int('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  issuer: varchar('issuer', { length: 255 }).notNull(),
  dateIssued: varchar('date_issued', { length: 255 }),
  credentialUrl: varchar('credential_url', { length: 255 }),
});

export const clinicForms = mysqlTable('clinic_forms', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  fields: varchar('fields', { length: 255 }).notNull(), // JSON string representing form schema
  createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clinicFormSubmissions = mysqlTable('clinic_form_submissions', {
  id: int('id').autoincrement().primaryKey(),
  formId: int('form_id').references(() => clinicForms.id, { onDelete: 'cascade' }).notNull(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  data: varchar('data', { length: 255 }).notNull(), // JSON string representing filled data
  status: varchar('status', { length: 255 }).default('Pending').notNull(), // 'Pending', 'Reviewed'
  reviewedBy: int('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clinicLabRequests = mysqlTable('clinic_lab_requests', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  doctorId: int('doctor_id').references(() => users.id, { onDelete: 'set null' }),
  testsRequested: varchar('tests_requested', { length: 255 }).notNull(), // Comma-separated or JSON
  notes: varchar('notes', { length: 255 }),
  status: varchar('status', { length: 255 }).default('Pending').notNull(), // 'Pending', 'In Progress', 'Completed'
  resultsSummary: varchar('results_summary', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const healthInsuranceRecords = mysqlTable('health_insurance_records', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  providerName: varchar('provider_name', { length: 255 }).notNull(),
  policyNumber: varchar('policy_number', { length: 255 }).notNull(),
  groupNumber: varchar('group_number', { length: 255 }),
  coverageStartDate: varchar('coverage_start_date', { length: 255 }),
  coverageEndDate: varchar('coverage_end_date', { length: 255 }),
  status: varchar('status', { length: 255 }).default('Pending Verification').notNull(), // 'Pending Verification', 'Active', 'Expired', 'Rejected'
  verificationNotes: varchar('verification_notes', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const studentWellnessLogs = mysqlTable('student_wellness_logs', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull().defaultNow(),
  mood: int('mood').notNull(), // 1 to 5 (1=Terrible, 5=Excellent)
  sleepHours: int('sleep_hours').notNull(),
  nutritionQuality: int('nutrition_quality').notNull(), // 1 to 5
  waterIntake: int('water_intake').notNull(), // glasses or ml
  exerciseMinutes: int('exercise_minutes').notNull(),
  notes: varchar('notes', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clinicSurveys = mysqlTable('clinic_surveys', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  appointmentId: int('appointment_id').references(() => clinicAppointments.id, { onDelete: 'cascade' }).notNull(),
  overallRating: int('overall_rating').notNull(),
  waitTimeRating: int('wait_time_rating').notNull(),
  cleanlinessRating: int('cleanliness_rating').notNull(),
  staffFriendlinessRating: int('staff_friendliness_rating').notNull(),
  comments: varchar('comments', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const medicationReminders = mysqlTable('medication_reminders', {
  id: int('id').autoincrement().primaryKey(),
  studentId: int('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  medicationName: varchar('medication_name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 255 }).notNull(),
  frequency: varchar('frequency', { length: 255 }).notNull(),
  times: varchar('times', { length: 255 }).notNull(), // Comma-separated times like "08:00, 20:00"
  startDate: varchar('start_date', { length: 255 }).notNull(),
  endDate: varchar('end_date', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  notes: varchar('notes', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const campusWellnessFeed = mysqlTable('campus_wellness_feed', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  attachmentUrl: varchar('attachment_url', { length: 255 }),
  attachmentName: varchar('attachment_name', { length: 255 }),
  category: varchar('category', { length: 255 }).notNull(), // 'Alert', 'Announcement', 'Tip'
  authorId: int('author_id').references(() => users.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const timetables = mysqlTable('timetables', {
  id: int('id').autoincrement().primaryKey(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: varchar('day_of_week', { length: 255 }).notNull(),
  startTime: varchar('start_time', { length: 255 }).notNull(),
  endTime: varchar('end_time', { length: 255 }).notNull(),
  venue: varchar('venue', { length: 255 }).notNull(),
  uploadedById: int('uploaded_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseAllocations = mysqlTable('course_allocations', {
  id: int('id').autoincrement().primaryKey(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  lecturerId: int('lecturer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  academicYear: varchar('academic_year', { length: 255 }).notNull(),
  semester: varchar('semester', { length: 255 }).notNull(),
  allocatedById: int('allocated_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const lecturerAttendance = mysqlTable('lecturer_attendance', {
  id: int('id').autoincrement().primaryKey(),
  timetableId: int('timetable_id').references(() => timetables.id, { onDelete: 'cascade' }),
  lecturerId: int('lecturer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: int('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  status: varchar('status', { length: 255 }).notNull(), // 'Present', 'Absent', 'Late'
  markedById: int('marked_by_id').references(() => users.id),
  notes: varchar('notes', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const academicCalendarEvents = mysqlTable('academic_calendar_events', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  eventType: varchar('event_type', { length: 255 }).notNull(), // 'Milestone', 'Holiday', 'Exam', 'Other'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const campusSpaces = mysqlTable('campus_spaces', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  capacity: int('capacity').notNull(),
  type: varchar('type', { length: 255 }).notNull(), // 'Lecture Hall', 'Exam Hall', 'Laboratory', 'Seminar Room', 'Study Pod'
  equipment: varchar('equipment', { length: 255 }).default('[]'), // JSON array of equipment strings
});

export const spaceBookings = mysqlTable('space_bookings', {
  id: int('id').autoincrement().primaryKey(),
  spaceId: int('space_id').references(() => campusSpaces.id, { onDelete: 'cascade' }).notNull(),
  purpose: varchar('purpose', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  startTime: varchar('start_time', { length: 255 }).notNull(),
  endTime: varchar('end_time', { length: 255 }).notNull(),
  bookedById: int('booked_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const portalFeedback = mysqlTable('portal_feedback', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 255 }).notNull(), // 'Bug', 'Suggestion', 'Other'
  message: varchar('message', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }).default('pending').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const universityNews = mysqlTable('university_news', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});



export const labEquipmentLogs = mysqlTable('lab_equipment_logs', {
  id: int('id').autoincrement().primaryKey(),
  equipmentId: int('equipment_id').notNull().references(() => labEquipments.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull().references(() => users.id),
  action: varchar('action', { length: 255 }).notNull(), // 'Checkout', 'Return', 'Added', 'Updated', 'Deleted'
  quantityChanged: int('quantity_changed').notNull().default(0),
  notes: varchar('notes', { length: 255 }),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

export const labEquipments = mysqlTable('lab_equipments', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  category: varchar('category', { length: 255 }).notNull(),
  quantity: int('quantity').notNull().default(0),
  minThreshold: int('min_threshold').notNull().default(5),
  status: varchar('status', { length: 255 }).notNull().default('Operational'), // 'Operational', 'Under Maintenance', 'Broken', 'Out of Stock'
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  updatedBy: int('updated_by').references(() => users.id),
});

export const systemSettings = mysqlTable('system_settings', {
  id: int('id').autoincrement().primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: varchar('value', { length: 255 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const facilities = mysqlTable('facilities', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }).notNull(), // 'Lab', 'Library Room', 'Sports', etc.
  capacity: int('capacity'),
  location: varchar('location', { length: 255 }),
  status: varchar('status', { length: 255 }).default('Available'), // 'Available', 'Under Maintenance'
});

export const facilityBookings = mysqlTable('facility_bookings', {
  id: int('id').autoincrement().primaryKey(),
  facilityId: int('facility_id').references(() => facilities.id, { onDelete: 'cascade' }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  purpose: varchar('purpose', { length: 255 }),
  status: varchar('status', { length: 255 }).default('Pending'), // 'Pending', 'Approved', 'Rejected', 'Cancelled'
});

export const contentBlocks = mysqlTable('content_blocks', {
  id: int('id').autoincrement().primaryKey(),
  section: varchar('section', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  videoUrl: varchar('video_url', { length: 255 }),
  orderIndex: int('order_index').default(0),
  isPublished: boolean('is_published').default(true),
  status: varchar('status', { length: 255 }).default('Draft'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cmsNewsEvents = mysqlTable('cms_news_events', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  summary: varchar('summary', { length: 255 }),
  imageUrl: varchar('image_url', { length: 255 }),
  date: timestamp('date'),
  endDate: timestamp('end_date'),
  location: varchar('location', { length: 255 }),
  status: varchar('status', { length: 255 }).default('Draft'),
  publishDate: timestamp('publish_date'),
  authorId: int('author_id').references(() => users.id),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
