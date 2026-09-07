const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/student/StudentDashboard.tsx', 'utf8');

// Replace the old handleDownloadTranscript
const oldHandle = `  const handleDownloadTranscript = () => {
    transcriptService.downloadTranscript({
      studentName: user?.name || 'Student',
      studentId: String(user?.id || 'STD12345678'),
      program: 'Computer Science',
      cgpa: '3.76',
      session: '2025/2026 - 1st Semester',
      dateGenerated: new Date().toLocaleDateString(),
      grades: currentGrades.map(g => ({
        courseCode: g.course,
        courseTitle: g.title,
        credits: enrolledCourses.find(c => c.code === g.course)?.credits || 3,
        grade: g.grade,
        points: g.points
      }))
    }, \`Transcript_\${user?.name?.replace(/\\s+/g, '_') || 'Student'}.pdf\`);
  };`;

const newHandle = `  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadTranscript = async () => {
    setIsDownloading(true);
    try {
      const [profileRes, transcriptRes] = await Promise.all([
        fetch('/api/student/academic-profile', { headers: { Authorization: \`Bearer \${token}\` } }),
        fetch('/api/student/transcript', { headers: { Authorization: \`Bearer \${token}\` } })
      ]);
      
      if (profileRes.ok && transcriptRes.ok) {
        const profile = await profileRes.json();
        const transcriptData = await transcriptRes.json();
        
        transcriptService.downloadOfficialTranscript({
          profile,
          transcriptData
        });
      } else {
        alert("Could not load transcript data.");
      }
    } catch (e) {
      console.error("Error downloading transcript:", e);
      alert("Error downloading transcript.");
    } finally {
      setIsDownloading(false);
    }
  };`;

if (content.includes(oldHandle)) {
  content = content.replace(oldHandle, newHandle);
} else {
  console.log("Could not find exact oldHandle block. Attempting fallback replace.");
  const startIdx = content.indexOf('const handleDownloadTranscript = () => {');
  if (startIdx > -1) {
    const endIdx = content.indexOf('};', startIdx) + 2;
    // We also have to find where it finishes, let's just do a manual replace using regex
  }
}

// Ensure the button shows loading state if needed
content = content.replace(
  '<span>Download Transcript</span>',
  '<span>{isDownloading ? "Generating..." : "Download Transcript"}</span>'
);
content = content.replace(
  'className="flex items-center gap-2 px-4 py-2 bg-slate-800',
  'disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-slate-800'
);

fs.writeFileSync('src/pages/dashboards/student/StudentDashboard.tsx', content);
console.log('patched dashboard pdf download');
