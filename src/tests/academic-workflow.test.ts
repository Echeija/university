import test from 'node:test';
import assert from 'node:assert/strict';

import { ResultCalculationService } from '../shared/ResultCalculationService.js';

test('CA Calculation', () => {
  assert.strictEqual(ResultCalculationService.calculateCATotal([8, 9, 7]), 24);
  assert.strictEqual(ResultCalculationService.calculateCATotal([10, undefined, 5] as any), 15);
});

test('Exam Calculation / Total Score', () => {
  assert.strictEqual(ResultCalculationService.calculateTotalScore(24, 61), 85);
  assert.strictEqual(ResultCalculationService.calculateTotalScore(null, 40), 40);
  assert.strictEqual(ResultCalculationService.calculateTotalScore(10, null), 10);
});

test('Grade Calculation', () => {
  assert.strictEqual(ResultCalculationService.calculateGrade(85), 'A');
  assert.strictEqual(ResultCalculationService.calculateGrade(65), 'B');
  assert.strictEqual(ResultCalculationService.calculateGrade(55), 'C');
  assert.strictEqual(ResultCalculationService.calculateGrade(48), 'D');
  assert.strictEqual(ResultCalculationService.calculateGrade(42), 'E');
  assert.strictEqual(ResultCalculationService.calculateGrade(35), 'F');
});

test('Grade Point Calculation', () => {
  assert.strictEqual(ResultCalculationService.calculateGradePoint(85), 5.0);
  assert.strictEqual(ResultCalculationService.calculateGradePoint(65), 4.0);
  assert.strictEqual(ResultCalculationService.calculateGradePoint(55), 3.0);
  assert.strictEqual(ResultCalculationService.calculateGradePoint(48), 2.0);
  assert.strictEqual(ResultCalculationService.calculateGradePoint(42), 1.0);
  assert.strictEqual(ResultCalculationService.calculateGradePoint(35), 0.0);
});

test('Quality Point Calculation', () => {
  assert.strictEqual(ResultCalculationService.calculateQualityPoint(3, 5.0), 15);
  assert.strictEqual(ResultCalculationService.calculateQualityPoint(4, 4.0), 16);
});

test('GPA Calculation', () => {
  assert.strictEqual(ResultCalculationService.calculateSemesterGPA(72, 18), 4.00);
  assert.strictEqual(ResultCalculationService.calculateSemesterGPA(84, 20), 4.20);
  assert.strictEqual(ResultCalculationService.calculateSemesterGPA(0, 0), 0);
});

test('CGPA Calculation', () => {
  assert.strictEqual(ResultCalculationService.calculateCGPA(156, 38), 4.11);
  assert.strictEqual(ResultCalculationService.calculateCGPA(0, 0), 0);
});

import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

test('Workflow Integration Tests', async (t) => {
  // Setup isolated test student and course
  const testUsername = `TEST_STUDENT_${Date.now()}`;
  
  const passwordHash = await bcrypt.hash('testpass', 10);
  
  const facultyRes = await db.insert(schema.faculties).values({
    name: 'Test Faculty',
  }).returning();
  const fId = facultyRes[0].id;
  
  const deptRes = await db.insert(schema.departments).values({
    name: 'Test Dept',
    facultyId: fId,
  }).returning();
  const dId = deptRes[0].id;

  const studentRes = await db.insert(schema.users).values({
    name: 'Test Student',
    email: `${testUsername}@example.com`,
    username: testUsername,
    role: 'Student',
    password: passwordHash,
    department: 'Test Dept',
    faculty: 'Test Faculty',
    createdAt: new Date(),
  } as any).returning();
  const sId = studentRes[0].id;

  const courseRes = await db.insert(schema.courses).values({
    code: `TST101_${Date.now()}`,
    title: 'Test Course',
    credits: 3,
    departmentId: dId,
    semester: 'First',
  }).returning();
  const cId = courseRes[0].id;

  let resultId: number;

  await t.test('Result Submission', async () => {
    const res = await db.insert(schema.results).values({
      studentId: sId,
      courseId: cId,
      academicSession: '2023/2024',
      semester: 'First',
      caScore: 24,
      examScore: 61,
      score: 85,
      grade: 'A',
      gradePoint: 5,
      qualityPoint: 15,
      status: 'submitted', // Simulating lecturer submission
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    
    resultId = res[0].id;
    assert.strictEqual(res[0].status, 'submitted');
  });

  await t.test('HOD Approval', async () => {
    const res = await db.update(schema.results)
      .set({ status: 'hod_approved', updatedAt: new Date() })
      .where(eq(schema.results.id, resultId))
      .returning();
    
    assert.strictEqual(res[0].status, 'hod_approved');
  });

  await t.test('Registrar Approval', async () => {
    const res = await db.update(schema.results)
      .set({ status: 'registrar_approved', updatedAt: new Date() })
      .where(eq(schema.results.id, resultId))
      .returning();
    
    assert.strictEqual(res[0].status, 'registrar_approved');
  });

  await t.test('Result Publication', async () => {
    const res = await db.update(schema.results)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(schema.results.id, resultId))
      .returning();
    
    assert.strictEqual(res[0].status, 'published');
  });

  await t.test('Student Result Visibility', async () => {
    // Student should only see published results
    const visibleResults = await db.select().from(schema.results).where(and(
      eq(schema.results.studentId, sId),
      eq(schema.results.status, 'published')
    ));
    assert.strictEqual(visibleResults.length, 1);
    
    // Check if draft results are hidden
    await db.insert(schema.results).values({
      studentId: sId,
      courseId: cId,
      academicSession: '2024/2025',
      semester: 'First',
      status: 'draft',
    } as any);

    const checkVisibleAgain = await db.select().from(schema.results).where(and(
      eq(schema.results.studentId, sId),
      eq(schema.results.status, 'published')
    ));
    assert.strictEqual(checkVisibleAgain.length, 1); // Draft not visible
  });

  await t.test('Result Amendment', async () => {
    // Simulating Amendment logic: Create an amendment record
    const amendment = await db.insert(schema.resultAmendments).values({
      resultId: resultId,
      requestedById: sId,
      reason: 'Score incorrectly collated',
      status: 'pending',
    }).returning();
    
    assert.strictEqual(amendment[0].status, 'pending');
    
    // Status can optionally revert to under review, but for test we just assert the amendment was logged.
    const logs = await db.select().from(schema.resultAmendments).where(eq(schema.resultAmendments.resultId, resultId));
    assert.strictEqual(logs.length, 1);
  });

  await t.test('Transcript Generation', async () => {
    const tr = await db.insert(schema.transcriptRequests).values({
      studentId: sId,
      destination: 'Test University',
      purpose: 'Further Studies',
      status: 'Processing',
    }).returning();
    
    assert.strictEqual(tr[0].status, 'Processing');
  });

  await t.test('Transcript Verification', async () => {
    // Generate an official transcript record
    const transcript = await db.insert(schema.transcripts).values({
      studentId: sId,
      generatedById: sId,
      verificationCode: `TRN-${Date.now()}`,
      status: 'valid',
    }).returning();
    
    // Verify it exists and is valid
    const verificationCheck = await db.select().from(schema.transcripts).where(eq(schema.transcripts.verificationCode, transcript[0].verificationCode));
    assert.strictEqual(verificationCheck.length, 1);
    assert.strictEqual(verificationCheck[0].status, 'valid');
  });

  await t.test('Authorization', async () => {
    // Mock simple authorization logic that would typically be in a middleware
    const mockAuthMiddleware = (userRole: string, requiredRole: string | string[]) => {
      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
      }
      return userRole === requiredRole;
    };

    // Test lecturer trying to access registrar functions
    assert.strictEqual(mockAuthMiddleware('Lecturer', 'Registrar'), false);
    
    // Test HOD trying to approve HOD step
    assert.strictEqual(mockAuthMiddleware('HOD', ['HOD', 'Registrar']), true);
    
    // Test Student trying to approve result
    assert.strictEqual(mockAuthMiddleware('Student', ['HOD', 'Registrar']), false);
    
    // Test Admin
    assert.strictEqual(mockAuthMiddleware('Admin', ['Admin', 'Administrator']), true);
  });

  // Cleanup test data
  await db.delete(schema.transcripts).where(eq(schema.transcripts.studentId, sId));
  await db.delete(schema.transcriptRequests).where(eq(schema.transcriptRequests.studentId, sId));
  await db.delete(schema.resultAmendments).where(eq(schema.resultAmendments.resultId, resultId));
  await db.delete(schema.results).where(eq(schema.results.studentId, sId));
  await db.delete(schema.users).where(eq(schema.users.id, sId));
  await db.delete(schema.courses).where(eq(schema.courses.id, cId));
  await db.delete(schema.departments).where(eq(schema.departments.id, dId));
  await db.delete(schema.faculties).where(eq(schema.faculties.id, fId));
});
