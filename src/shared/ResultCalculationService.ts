export class ResultCalculationService {
  /**
   * Automatically calculates total CA Score (e.g. if we had multiple CA components)
   */
  static calculateCATotal(caComponents: number[]): number {
    return caComponents.reduce((acc, curr) => acc + (curr || 0), 0);
  }

  /**
   * Automatically calculates total score from CA and Exam
   */
  static calculateTotalScore(caScore: number | null, examScore: number | null): number {
    return (caScore || 0) + (examScore || 0);
  }

  /**
   * Calculate Grade based on total score using dynamic rules
   */
  static calculateGrade(totalScore: number, rules: any[] = []): string {
    if (rules.length === 0) {
      if (totalScore >= 70) return 'A';
      if (totalScore >= 60) return 'B';
      if (totalScore >= 50) return 'C';
      if (totalScore >= 45) return 'D';
      if (totalScore >= 40) return 'E';
      return 'F';
    }
    const matchedRule = rules.find(r => totalScore >= r.minScore && totalScore <= r.maxScore);
    if (matchedRule) {
      return matchedRule.grade;
    }
    return 'F';
  }

  /**
   * Calculate Grade Point based on total score using dynamic rules
   */
  static calculateGradePoint(totalScore: number, rules: any[] = []): number {
    if (rules.length === 0) {
      if (totalScore >= 70) return 5.0;
      if (totalScore >= 60) return 4.0;
      if (totalScore >= 50) return 3.0;
      if (totalScore >= 45) return 2.0;
      if (totalScore >= 40) return 1.0;
      return 0.0;
    }
    const matchedRule = rules.find(r => totalScore >= r.minScore && totalScore <= r.maxScore);
    if (matchedRule) {
      return Number(matchedRule.gradePoint);
    }
    return 0.0;
  }

  /**
   * Calculate Quality Point
   */
  static calculateQualityPoint(creditUnit: number, gradePoint: number): number {
    return creditUnit * gradePoint;
  }

  /**
   * Calculate Semester GPA
   */
  static calculateSemesterGPA(totalQualityPoints: number, totalCreditUnits: number): number {
    if (totalCreditUnits === 0) return 0;
    return Number((totalQualityPoints / totalCreditUnits).toFixed(2));
  }

  /**
   * Calculate Cumulative GPA
   */
  static calculateCGPA(totalQualityPointsAcrossSemesters: number, totalCreditUnitsAcrossSemesters: number): number {
    if (totalCreditUnitsAcrossSemesters === 0) return 0;
    return Number((totalQualityPointsAcrossSemesters / totalCreditUnitsAcrossSemesters).toFixed(2));
  }

  /**
   * Determine Academic Standing based on CGPA
   */
  static calculateAcademicStanding(cgpa: number, rules: any[] = []): string {
    if (rules.length === 0) {
      if (cgpa >= 2.00) return 'Good Standing';
      if (cgpa >= 1.50) return 'Academic Warning';
      if (cgpa >= 1.00) return 'Probation';
      return 'Academic Concern';
    }

    const sortedRules = [...rules].sort((a, b) => b.minCgpa - a.minCgpa);
    for (const rule of sortedRules) {
      if (cgpa >= rule.minCgpa) {
        return rule.status;
      }
    }
    
    // If it's below all specified minCgpa, return the lowest status
    return sortedRules[sortedRules.length - 1]?.status || 'Academic Concern';
  }

  /**
   * Determine Degree Classification based on CGPA
   */
  static calculateDegreeClassification(cgpa: number, rules: any[] = []): string {
    if (rules.length === 0) {
      if (cgpa >= 4.50) return 'First Class';
      if (cgpa >= 3.50) return 'Second Class Upper';
      if (cgpa >= 2.40) return 'Second Class Lower';
      if (cgpa >= 1.50) return 'Third Class';
      if (cgpa >= 1.00) return 'Pass';
      return 'Fail';
    }

    const sortedRules = [...rules].sort((a, b) => b.minCgpa - a.minCgpa);
    for (const rule of sortedRules) {
      if (cgpa >= rule.minCgpa) {
        return rule.classification;
      }
    }
    
    return sortedRules[sortedRules.length - 1]?.classification || 'Fail';
  }
}
