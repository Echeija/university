import { db } from '../../db';
import { gradingRules, results, courses, semesterGpaRecords, cgpaRecords } from '../../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { ResultCalculationService as SharedResultCalculationService } from '../../shared/ResultCalculationService';

export class ResultCalculationService extends SharedResultCalculationService {

  /**
   * Calculate Grade based on total score using dynamic rules from the DB (Legacy method for backend convenience)
   */
  static async calculateGradeFromDB(totalScore: number): Promise<{ grade: string, gradePoint: number, isPass: boolean }> {
    const rules = await db.select().from(gradingRules);
    
    // If no rules exist in DB, fallback to standard 5-point system
    if (rules.length === 0) {
      if (totalScore >= 70) return { grade: 'A', gradePoint: 5.0, isPass: true };
      if (totalScore >= 60) return { grade: 'B', gradePoint: 4.0, isPass: true };
      if (totalScore >= 50) return { grade: 'C', gradePoint: 3.0, isPass: true };
      if (totalScore >= 45) return { grade: 'D', gradePoint: 2.0, isPass: true };
      if (totalScore >= 40) return { grade: 'E', gradePoint: 1.0, isPass: true };
      return { grade: 'F', gradePoint: 0.0, isPass: false };
    }

    const matchedRule = rules.find(r => totalScore >= r.minScore && totalScore <= r.maxScore);
    if (matchedRule) {
      return {
        grade: matchedRule.grade,
        gradePoint: matchedRule.gradePoint,
        isPass: matchedRule.isPass
      };
    }
    return { grade: 'F', gradePoint: 0.0, isPass: false };
  }

  /**
   * Recalculates and caches the Semester GPA and CGPA for a student based on published results
   */
  static async updateStudentGPAAndCGPA(studentId: number): Promise<void> {
    // Fetch all published results for the student
    const publishedResults = await db.select({
      result: results,
      course: courses
    })
    .from(results)
    .innerJoin(courses, eq(results.courseId, courses.id))
    .where(and(
      eq(results.studentId, studentId),
      eq(results.status, 'published')
    ));

    // Fetch system settings
    const { systemSettings } = await import('../../db/schema');
    const settingsRows = await db.select().from(systemSettings).where(
      or(
        eq(systemSettings.key, 'repeat_course_policy'),
        eq(systemSettings.key, 'academic_standing_rules')
      )
    );
    const policyResult = settingsRows.find(r => r.key === 'repeat_course_policy');
    const policy = policyResult ? policyResult.value : 'Best Attempt Counts';

    const standingRulesResult = settingsRows.find(r => r.key === 'academic_standing_rules');
    let standingRules = [];
    try {
      if (standingRulesResult) standingRules = JSON.parse(standingRulesResult.value);
    } catch (e) {}

    // Group by academicSession and semester for Semester GPA
    const semesterData: Record<string, { totalQP: number, totalCU: number, totalEarnedCU: number }> = {};
    
    // Group by courseId for CGPA
    const courseAttempts = new Map<number, typeof publishedResults>();

    for (const row of publishedResults) {
      const key = `${row.result.academicSession}|${row.result.semester}`;
      if (!semesterData[key]) {
        semesterData[key] = { totalQP: 0, totalCU: 0, totalEarnedCU: 0 };
      }
      
      const qp = Number(row.result.qualityPoint) || 0;
      const cu = Number(row.course.credits) || 0;

      if (row.course.contributesToGpa) {
          semesterData[key].totalQP += qp;
          semesterData[key].totalCU += cu;
      }
      
      if (row.course.contributesToCreditUnits) {
          semesterData[key].totalEarnedCU += cu;
      }
      
      if (!courseAttempts.has(row.course.id)) {
          courseAttempts.set(row.course.id, []);
      }
      courseAttempts.get(row.course.id).push(row);
    }

    let cumulativeQP = 0;
    let cumulativeCU = 0;
    let cumulativeEarnedCU = 0;

    const getSemesterValue = (session: string, semester: string) => {
        const yearMatch = session.match(/^(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : 0;
        const sem = semester.toLowerCase().includes('first') ? 1 : semester.toLowerCase().includes('second') ? 2 : 3;
        return year * 10 + sem;
    };

    for (const [courseId, attempts] of courseAttempts.entries()) {
        const firstAttempt = attempts[0];
        
        // Add to earned credits for all attempts if it contributes to credit units
        if (firstAttempt.course.contributesToCreditUnits) {
            for (const attempt of attempts) {
                cumulativeEarnedCU += Number(attempt.course.credits) || 0;
            }
        }
        
        if (!firstAttempt.course.contributesToCgpa) continue;

        if (attempts.length === 1 || policy === 'Institutional Custom Rule') {
            for (const attempt of attempts) {
                cumulativeQP += Number(attempt.result.qualityPoint) || 0;
                cumulativeCU += Number(attempt.course.credits) || 0;
            }
        } else if (policy === 'Best Attempt Counts') {
            const best = attempts.reduce((prev, current) => (Number(prev.result.score) > Number(current.result.score)) ? prev : current);
            cumulativeQP += Number(best.result.qualityPoint) || 0;
            cumulativeCU += Number(best.course.credits) || 0;
        } else if (policy === 'Latest Attempt Counts') {
            const latest = attempts.reduce((prev, current) => {
                const valPrev = getSemesterValue(prev.result.academicSession, prev.result.semester);
                const valCurr = getSemesterValue(current.result.academicSession, current.result.semester);
                return valPrev > valCurr ? prev : current;
            });
            cumulativeQP += Number(latest.result.qualityPoint) || 0;
            cumulativeCU += Number(latest.course.credits) || 0;
        } else {
            for (const attempt of attempts) {
                cumulativeQP += Number(attempt.result.qualityPoint) || 0;
                cumulativeCU += Number(attempt.course.credits) || 0;
            }
        }
    }

    // Update semester records
    const activeSemesterKeys = Object.keys(semesterData);
    const existingSemesters = await db.select().from(semesterGpaRecords).where(eq(semesterGpaRecords.studentId, studentId));
    
    // Remove semesters that no longer have any published results
    for (const record of existingSemesters) {
        const key = `${record.academicSession}|${record.semester}`;
        if (!activeSemesterKeys.includes(key)) {
            await db.delete(semesterGpaRecords).where(eq(semesterGpaRecords.id, record.id));
        }
    }

    for (const [key, data] of Object.entries(semesterData)) {
      const [academicSession, semester] = key.split('|');
      const gpa = this.calculateSemesterGPA(data.totalQP, data.totalCU);

      const existingSemester = await db.select().from(semesterGpaRecords).where(and(
        eq(semesterGpaRecords.studentId, studentId),
        eq(semesterGpaRecords.academicSession, academicSession),
        eq(semesterGpaRecords.semester, semester)
      ));

      if (existingSemester.length > 0) {
        await db.update(semesterGpaRecords).set({
          totalCreditUnits: data.totalCU,
          totalEarnedCredits: data.totalEarnedCU,
          totalQualityPoints: data.totalQP,
          gpa: gpa,
          updatedAt: new Date()
        }).where(eq(semesterGpaRecords.id, existingSemester[0].id));
      } else {
        await db.insert(semesterGpaRecords).values({
          studentId,
          academicSession,
          semester,
          totalCreditUnits: data.totalCU,
          totalEarnedCredits: data.totalEarnedCU,
          totalQualityPoints: data.totalQP,
          gpa
        });
      }
    }

    // Update CGPA
    const cgpa = this.calculateCGPA(cumulativeQP, cumulativeCU);
    const standing = this.calculateAcademicStanding(cgpa, standingRules);

    const existingCgpa = await db.select().from(cgpaRecords).where(eq(cgpaRecords.studentId, studentId));
    if (existingCgpa.length > 0) {
      await db.update(cgpaRecords).set({
        totalCreditUnits: cumulativeCU,
        totalEarnedCredits: cumulativeEarnedCU,
        totalQualityPoints: cumulativeQP,
        cgpa: cgpa,
        academicStanding: standing,
        updatedAt: new Date()
      }).where(eq(cgpaRecords.id, existingCgpa[0].id));
    } else {
      await db.insert(cgpaRecords).values({
        studentId,
        totalCreditUnits: cumulativeCU,
        totalEarnedCredits: cumulativeEarnedCU,
        totalQualityPoints: cumulativeQP,
        cgpa: cgpa,
        academicStanding: standing
      });
    }
  }
}
