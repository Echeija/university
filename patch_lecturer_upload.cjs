const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', 'utf8');

// Add import
const importStatment = `import { ResultCalculationService } from '../../../shared/ResultCalculationService';\n`;
if (!content.includes('ResultCalculationService')) {
  content = content.replace("import { Skeleton } from '../../../components/ui/Skeleton';", "import { Skeleton } from '../../../components/ui/Skeleton';\n" + importStatment);
}

const oldCalculate = `  const calculateDerivedMetrics = (totalScore: number, credits: number) => {
    let grade = 'N/A';
    let gp = 0;
    
    const matchedRule = gradingRules.find(r => totalScore >= r.minScore && totalScore <= r.maxScore);
    if (matchedRule) {
      grade = matchedRule.grade;
      gp = matchedRule.gradePoint;
    }
    
    return {
      grade,
      gp,
      qp: gp * credits
    };
  };`;

const newCalculate = `  const calculateDerivedMetrics = (totalScore: number, credits: number) => {
    const grade = ResultCalculationService.calculateGrade(totalScore, gradingRules);
    const gp = ResultCalculationService.calculateGradePoint(totalScore, gradingRules);
    
    return {
      grade,
      gp,
      qp: ResultCalculationService.calculateQualityPoint(credits, gp)
    };
  };`;

content = content.replace(oldCalculate, newCalculate);

// Also need to use calculateTotalScore when updating exam score in handleScoreChange

const oldHandleScore = `        if (st.status !== 'draft' && st.status !== 'returned') return st;
        const totalScore = (st.caScore || 0) + numValue;
        return { ...st, examScore: numValue, score: totalScore };`;

const newHandleScore = `        if (st.status !== 'draft' && st.status !== 'returned') return st;
        const totalScore = ResultCalculationService.calculateTotalScore(st.caScore, numValue);
        return { ...st, examScore: numValue, score: totalScore };`;

content = content.replace(oldHandleScore, newHandleScore);

fs.writeFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', content);
console.log('Patched LecturerResultUpload.tsx');
