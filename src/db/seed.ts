import { db } from './index';
import { users, departments, courses, studentCourses, results, payments, applications } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');
  
  const defaultUsers = [
    { name: 'System Admin', email: 'admin@smartglobal.edu.ng', role: 'Administrator' },
    { name: 'ICT Director', email: 'ict@smartglobal.edu.ng', role: 'ICT Admin' },
    { name: 'Registrar', email: 'registrar@smartglobal.edu.ng', role: 'Registrar' },
    { name: 'Bursar', email: 'bursar@smartglobal.edu.ng', role: 'Bursary' },
    { name: 'Dean of Engineering', email: 'dean@smartglobal.edu.ng', role: 'Dean' },
    { name: 'HOD Computer Science', email: 'hod@smartglobal.edu.ng', role: 'HOD' },
    { name: 'Dr. John Doe', email: 'lecturer@smartglobal.edu.ng', role: 'Lecturer' },
    { name: 'Jane Smith', email: 'student@smartglobal.edu.ng', role: 'Student' },
    { name: 'Prospective Student', email: 'applicant@smartglobal.edu.ng', role: 'Applicant' },
    { name: 'Chief Librarian', email: 'library@smartglobal.edu.ng', role: 'Library' },
    { name: 'Dr. Gregory House', email: 'doctor@smartglobal.edu.ng', role: 'Clinic' },
  ];

  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  for (const user of defaultUsers) {
    try {
      await db.insert(users).values({
        ...user,
        password: passwordHash,
        createdAt: new Date(),
      } as any);
      console.log(`Created user: ${user.email} (${user.role})`);
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed') || e.message.includes('duplicate key value')) {
        console.log(`User ${user.email} already exists.`);
      } else {
        console.error(`Error creating user ${user.email}:`, e);
      }
    }
  }

  // Get student id for further seeding
  const student = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, 'student@smartglobal.edu.ng')
  });

  const applicant = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, 'applicant@smartglobal.edu.ng')
  });

  if (!student || !applicant) return;

  // Departments
  const cscDept = await db.insert(departments).values({
    name: 'Computer Science',
    description: 'Department of Computer Science'
  }).returning().then(res => res[0]);

  // Courses
  const csc101 = await db.insert(courses).values({
    code: 'CSC 101',
    title: 'Introduction to Computer Science',
    credits: 3,
    departmentId: cscDept.id,
    semester: '1st'
  }).returning().then(res => res[0]);

  const csc102 = await db.insert(courses).values({
    code: 'CSC 102',
    title: 'Introduction to Problem Solving',
    credits: 3,
    departmentId: cscDept.id,
    semester: '1st'
  }).returning().then(res => res[0]);

  // Student Courses
  await db.insert(studentCourses).values([
    { studentId: student.id, courseId: csc101.id, semester: '1st', status: 'registered' },
    { studentId: student.id, courseId: csc102.id, semester: '1st', status: 'registered' }
  ]);

  // Results
  await db.insert(results).values([
    { studentId: student.id, courseId: csc101.id, score: 75, grade: 'A', semester: '1st' },
    { studentId: student.id, courseId: csc102.id, score: 68, grade: 'B', semester: '1st' }
  ]);

  // Payments
  await db.insert(payments).values([
    { studentId: student.id, amount: 150000, purpose: 'Tuition Fee - 1st Semester', reference: 'REF-2026-T1', status: 'completed', createdAt: new Date() },
    { studentId: student.id, amount: 20000, purpose: 'Library Fee', reference: 'REF-2026-L1', status: 'pending', createdAt: new Date() }
  ]);

  // Applicant
  await db.insert(applications).values({
    userId: applicant.id,
    fullName: 'Prospective Student',
    programOfInterest: 'B.Sc. Computer Science',
    status: 'pending',
    createdAt: new Date(),
  });

  
  // Add calendar events
  console.log('Seeding calendar events...');
  const { calendarEvents } = require('./schema');
  await db.insert(calendarEvents).values([
    {
      courseId: 1,
      userId: 2, // Assuming lecturer exists
      title: 'Midterm Exam - CSC 301',
      type: 'Academic',
      startTime: new Date(Date.now() + 86400000 * 2),
      endTime: new Date(Date.now() + 86400000 * 2 + 7200000),
      description: 'Midterm exam for Data Structures'
    },
    {
      courseId: null,
      userId: 1, // Admin
      title: 'University Spring Gala',
      type: 'Social',
      startTime: new Date(Date.now() + 86400000 * 5),
      endTime: new Date(Date.now() + 86400000 * 5 + 14400000),
      description: 'Annual spring gala for all students and staff'
    },
    {
      courseId: 2,
      userId: 2, 
      title: 'Assignment 3 Due',
      type: 'Academic',
      startTime: new Date(Date.now() + 86400000 * 7),
      endTime: new Date(Date.now() + 86400000 * 7 + 3600000),
      description: 'Submit via LMS portal'
    },
    {
      courseId: null,
      userId: 1, 
      title: 'Tech Club Meetup',
      type: 'Social',
      startTime: new Date(Date.now() + 86400000 * 3),
      endTime: new Date(Date.now() + 86400000 * 3 + 7200000),
      description: 'Monthly tech club meetup at Student Center'
    },
    {
      courseId: null,
      userId: 1, 
      title: 'Career Fair 2026',
      type: 'Academic',
      startTime: new Date(Date.now() + 86400000 * 10),
      endTime: new Date(Date.now() + 86400000 * 10 + 28800000),
      description: 'Annual career fair featuring top tech companies'
    }
  ]).onConflictDoNothing();

  console.log('Seeding complete!');
}

seed().catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
