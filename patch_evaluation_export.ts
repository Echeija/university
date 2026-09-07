import fs from 'fs';

let content = fs.readFileSync('src/pages/dashboards/admin/EvaluationReports.tsx', 'utf8');

// Ensure XLSX is imported
content = `import * as XLSX from 'xlsx';\n` + content;
content = content.replace(
    /import \{ Star, MessageSquare, Loader2, BookOpen \} from 'lucide-react';/,
    `import { Star, MessageSquare, Loader2, BookOpen, Download } from 'lucide-react';`
);

const exportCode = `
  const exportToExcel = () => {
    if (evaluations.length === 0) return;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary Data
    const summaryData = Object.values(groupedEvaluations).map((c: any) => ({
      "Course Code": c.courseCode,
      "Course Title": c.courseTitle,
      "Total Reviews": c.count,
      "Average Rating": (c.totalRating / c.count).toFixed(2)
    }));
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Course Summary");

    // All Feedbacks Data
    const feedbacksData = evaluations.map((e: any) => ({
      "Course Code": e.courseCode,
      "Course Title": e.courseTitle,
      "Rating": e.rating,
      "Feedback": e.feedback,
      "Date": new Date(e.createdAt).toLocaleDateString()
    }));
    
    const wsFeedbacks = XLSX.utils.json_to_sheet(feedbacksData);
    XLSX.utils.book_append_sheet(wb, wsFeedbacks, "All Feedbacks");

    // Save the file
    XLSX.writeFile(wb, \`Evaluation_Reports_\${new Date().toISOString().split('T')[0]}.xlsx\`);
  };
`;

content = content.replace(
  /return \(/,
  exportCode + '\n  return ('
);

content = content.replace(
  /<div>\s*<h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Evaluation Reports<\/h2>\s*<p className="text-slate-500 dark:text-slate-400 mt-1">Review anonymous student feedback on courses and lecturer performance\.<\/p>\s*<\/div>/,
  `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Evaluation Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review anonymous student feedback on courses and lecturer performance.</p>
        </div>
        <button 
          onClick={exportToExcel}
          disabled={isLoading || evaluations.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>`
);

fs.writeFileSync('src/pages/dashboards/admin/EvaluationReports.tsx', content);
