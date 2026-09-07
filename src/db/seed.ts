import { db } from './index.js';
import * as schema from './schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seed() {
  
  console.log('Seeding development data...');
  
  // 0. Academic Sessions & Semesters
  const sessionRes = await db.insert(schema.academicSessions).values([
    { name: '2023/2024', isActive: false, isAdmissionActive: false },
    { name: '2024/2025', isActive: true, isAdmissionActive: true }
  ]).returning();
  
  const oldSessionId = sessionRes[0].id;
  const newSessionId = sessionRes[1].id;
  
  await db.insert(schema.semesters).values([
    { sessionId: oldSessionId, name: 'First', isActive: false },
    { sessionId: oldSessionId, name: 'Second', isActive: false },
    { sessionId: newSessionId, name: 'First', isActive: true },
    { sessionId: newSessionId, name: 'Second', isActive: false }
  ]);

  
  // 1. Faculty
  const facultyRes = await db.insert(schema.faculties).values({
    name: 'Faculty of Science',
    description: 'Faculty of Science',
  }).returning();
  const facultyId = facultyRes[0].id;
  
  // 2. Departments
  const dept1Res = await db.insert(schema.departments).values({
    name: 'Computer Science',
    description: 'Department of Computer Science',
    facultyId,
  }).returning();
  const csDeptId = dept1Res[0].id;

  const dept2Res = await db.insert(schema.departments).values({
    name: 'Mathematics',
    description: 'Department of Mathematics',
    facultyId,
  }).returning();
  const mathDeptId = dept2Res[0].id;
  
  // 3. Courses (10 Courses)
  const coursesData = [
    { code: 'CSC101', title: 'Introduction to Computer Science', credits: 3, departmentId: csDeptId, semester: 'First', type: 'Core' },
    { code: 'CSC102', title: 'Introduction to Programming', credits: 3, departmentId: csDeptId, semester: 'Second', type: 'Core' },
    { code: 'CSC201', title: 'Data Structures and Algorithms', credits: 3, departmentId: csDeptId, semester: 'First', type: 'Core' },
    { code: 'CSC202', title: 'Object Oriented Programming', credits: 3, departmentId: csDeptId, semester: 'Second', type: 'Core' },
    { code: 'CSC301', title: 'Database Management Systems', credits: 3, departmentId: csDeptId, semester: 'First', type: 'Core' },
    { code: 'CSC302', title: 'Operating Systems', credits: 3, departmentId: csDeptId, semester: 'Second', type: 'Core' },
    { code: 'MTH101', title: 'Calculus I', credits: 3, departmentId: mathDeptId, semester: 'First', type: 'Core' },
    { code: 'MTH102', title: 'Calculus II', credits: 3, departmentId: mathDeptId, semester: 'Second', type: 'Core' },
    { code: 'MTH201', title: 'Linear Algebra I', credits: 3, departmentId: mathDeptId, semester: 'First', type: 'Core' },
    { code: 'MTH202', title: 'Linear Algebra II', credits: 3, departmentId: mathDeptId, semester: 'Second', type: 'Core' },
  ];
  const insertedCourses = await db.insert(schema.courses).values(coursesData).returning();

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 4. Lecturers (5 Lecturers)
  const lecturerData = [];
  for (let i = 1; i <= 5; i++) {
    lecturerData.push({
      name: `Lecturer ${i}`,
      email: `lecturer${i}@university.edu`,
      username: `L${i}000`,
      role: 'Lecturer',
      password: passwordHash,
      department: i <= 3 ? 'Computer Science' : 'Mathematics',
      faculty: 'Faculty of Science',
      createdAt: new Date(),
    });
  }
  const insertedLecturers = await db.insert(schema.users).values(lecturerData as any).returning();
  
  // Allocate courses to lecturers
  const courseAllocations = [];
  let lecturerIndex = 0;
  for (const course of insertedCourses) {
    courseAllocations.push({
      courseId: course.id,
      lecturerId: insertedLecturers[lecturerIndex % 5].id,
      academicYear: '2023/2024',
      semester: course.semester,
    });
    lecturerIndex++;
  }
  await db.insert(schema.courseAllocations).values(courseAllocations);

  // 5. Students (20 Students)
  const studentData = [];
  const programmes = ['B.Sc. Computer Science', 'B.Sc. Mathematics'];
  const levels = ['100', '200'];
  const sessions = ['2023/2024', '2024/2025'];
  
  for (let i = 1; i <= 20; i++) {
    studentData.push({
      name: `Student ${i}`,
      email: `student${i}@university.edu`,
      username: `STU${1000 + i}`,
      role: 'Student',
      password: passwordHash,
      department: i <= 10 ? 'Computer Science' : 'Mathematics',
      faculty: 'Faculty of Science',
      createdAt: new Date(),
    });
  }
  const insertedStudents = await db.insert(schema.users).values(studentData as any).returning();
  
  // Register students for courses and generate sample results
  const studentCourses = [];
  const resultsData = [];
  
  for (const student of insertedStudents) {
    // Each student registers for 5 courses in their department
    const deptCourses = insertedCourses.filter(c => 
      (student.department === 'Computer Science' && c.code.startsWith('CSC')) ||
      (student.department === 'Mathematics' && c.code.startsWith('MTH'))
    );
    
    // Pick first 5 courses
    for (let i = 0; i < 5; i++) {
      const course = deptCourses[i];
      if (!course) break;
      
      studentCourses.push({
        studentId: student.id,
        courseId: course.id,
        semester: course.semester,
        status: 'registered',
      });
      
      // Some students have results
      if (Math.random() > 0.3) {
        const caScore = Math.floor(Math.random() * 30);
        const examScore = Math.floor(Math.random() * 70);
        const score = caScore + examScore;
        
        let grade = 'F';
        let gradePoint = 0;
        if (score >= 70) { grade = 'A'; gradePoint = 5.0; }
        else if (score >= 60) { grade = 'B'; gradePoint = 4.0; }
        else if (score >= 50) { grade = 'C'; gradePoint = 3.0; }
        else if (score >= 45) { grade = 'D'; gradePoint = 2.0; }
        
        resultsData.push({
          studentId: student.id,
          courseId: course.id,
          academicSession: '2023/2024',
          semester: course.semester,
          caScore,
          examScore,
          score,
          grade,
          gradePoint,
          qualityPoint: gradePoint * course.credits,
          status: 'draft', // Keeping some as draft for workflow testing
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  
  await db.insert(schema.studentCourses).values(studentCourses);
  
  if (resultsData.length > 0) {
    await db.insert(schema.results).values(resultsData as any);
  }
  
  // Mark some results as submitted, hod_approved, registrar_approved, published
  const statuses = ['submitted', 'hod_approved', 'registrar_approved', 'published'];
  for (const status of statuses) {
    // get some drafts
    const drafts = resultsData.filter(r => r.status === 'draft').slice(0, 5);
    for (const draft of drafts) {
      await db.update(schema.results)
        .set({ status: status as any })
        .where(eq(schema.results.studentId, draft.studentId))
        // we can just update all for that student
    }
  }

  console.log('Seed data created successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
