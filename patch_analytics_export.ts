import fs from 'fs';

let content = fs.readFileSync('src/pages/dashboards/admin/ResultAnalytics.tsx', 'utf8');

// Ensure XLSX is imported
if (!content.includes('import * as XLSX from \'xlsx\'')) {
    content = content.replace(
        /import \{ ResponsiveContainer/,
        `import * as XLSX from 'xlsx';\nimport { ResponsiveContainer`
    );
}

// Add export function
const exportCode = `
  const exportToExcel = () => {
    if (!data) return;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary Data
    const summaryData = [
      { Metric: "Students Registered", Value: data.registered },
      { Metric: "Results Submitted", Value: data.withResults },
      { Metric: "Passed", Value: data.passed },
      { Metric: "Failed", Value: data.failed },
      { Metric: "Pass Rate (%)", Value: data.passPercentage },
      { Metric: "Fail Rate (%)", Value: data.failPercentage },
      { Metric: "Average Score", Value: data.averageScore },
      { Metric: "Highest Score", Value: data.highestScore },
      { Metric: "Lowest Score", Value: data.lowestScore },
      { Metric: "Average CGPA", Value: data.averageGpa.toFixed(2) },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Analytics Summary");

    // Grade Distribution Data
    const wsGrades = XLSX.utils.json_to_sheet(data.gradeDistribution.map(g => ({ Grade: g.name, Count: g.value })));
    XLSX.utils.book_append_sheet(wb, wsGrades, "Grade Distribution");

    // Performance Trends Data
    const wsTrends = XLSX.utils.json_to_sheet(data.performanceTrends);
    XLSX.utils.book_append_sheet(wb, wsTrends, "Performance Trends");

    // Save the file
    XLSX.writeFile(wb, \`Result_Analytics_\${filters.session.replace('/', '-')}_\${filters.semester}.xlsx\`);
  };
`;

content = content.replace(
  /const mockFetchData = \(\) => \{/,
  exportCode + '\n  const mockFetchData = () => {'
);

// Modify Download button
content = content.replace(
  /<button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm">/,
  `<button onClick={exportToExcel} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm disabled:opacity-50">`
);

fs.writeFileSync('src/pages/dashboards/admin/ResultAnalytics.tsx', content);
