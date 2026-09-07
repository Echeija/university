const fs = require('fs');

const fileContent = `import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Trophy, FileText, Download, GraduationCap, AlertCircle, Filter } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { transcriptService } from '../../../services/transcriptService';

export default function AcademicResults() {
  const { token } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, transcriptRes] = await Promise.all([
        fetch('/api/student/academic-profile', { headers: { Authorization: \`Bearer \${token}\` } }),
        fetch('/api/student/transcript', { headers: { Authorization: \`Bearer \${token}\` } })
      ]);
      if (profileRes.ok && transcriptRes.ok) {
        const pData = await profileRes.json();
        const tData = await transcriptRes.json();
        setProfile(pData);
        setTranscriptData(tData);

        if (tData?.results?.length > 0) {
          const sessions = Array.from(new Set(tData.results.map((r: any) => r.academicSession))).sort().reverse() as string[];
          if (sessions.length > 0) {
            setSelectedSession(sessions[0]);
            const semesters = Array.from(new Set(tData.results.filter((r: any) => r.academicSession === sessions[0]).map((r: any) => r.semester))).sort().reverse() as string[];
            if (semesters.length > 0) {
              setSelectedSemester(semesters[0]);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFTranscript = () => {
    if (!profile || !transcriptData) return;
    transcriptService.downloadOfficialTranscript({ profile, transcriptData });
  };

  const hasResults = transcriptData && transcriptData.results.length > 0;
  
  const uniqueSessions = useMemo(() => {
    if (!transcriptData?.results) return [];
    return Array.from(new Set(transcriptData.results.map((r: any) => r.academicSession))).sort().reverse() as string[];
  }, [transcriptData]);

  const uniqueSemesters = useMemo(() => {
    if (!transcriptData?.results || !selectedSession) return [];
    return Array.from(new Set(transcriptData.results.filter((r: any) => r.academicSession === selectedSession).map((r: any) => r.semester))).sort().reverse() as string[];
  }, [transcriptData, selectedSession]);

  // When session changes, auto-select first available semester for that session
  useEffect(() => {
    if (selectedSession && transcriptData) {
      const sems = Array.from(new Set(transcriptData.results.filter((r: any) => r.academicSession === selectedSession).map((r: any) => r.semester))).sort().reverse() as string[];
      if (sems.length > 0 && !sems.includes(selectedSemester)) {
        setSelectedSemester(sems[0]);
      }
    }
  }, [selectedSession, transcriptData]);

  const filteredResults = useMemo(() => {
    if (!transcriptData?.results) return [];
    return transcriptData.results.filter((r: any) => r.academicSession === selectedSession && r.semester === selectedSemester);
  }, [transcriptData, selectedSession, selectedSemester]);

  const semesterStats = useMemo(() => {
    if (!transcriptData?.semesters) return null;
    return transcriptData.semesters.find((s: any) => s.academicSession === selectedSession && s.semester === selectedSemester);
  }, [transcriptData, selectedSession, selectedSemester]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Academic Results</h2>
          <p className="text-slate-500 mt-1">View your published results and official CGPA.</p>
        </div>
        <button 
          onClick={generatePDFTranscript}
          disabled={!hasResults || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold shadow-md"
        >
          <Download className="w-5 h-5" />
          <span>Download PDF Transcript</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 rounded-2xl w-full" />
          <Skeleton className="h-96 rounded-2xl w-full" />
        </div>
      ) : (
        <>
          {!hasResults ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-600">No Published Results</h3>
              <p className="text-slate-500 mt-1">You do not have any published results in your transcript yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filter Controls */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center gap-3 text-slate-700 font-bold">
                  <Filter className="w-5 h-5 text-indigo-600" />
                  <span>Filter Results</span>
                </div>
                <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Academic Session</label>
                    <select 
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      {uniqueSessions.map(session => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                    <select 
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      {uniqueSemesters.map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Table & Summary */}
              {filteredResults.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">
                      {selectedSession} - {selectedSemester}
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Course Code</th>
                          <th className="px-6 py-4">Course Title</th>
                          <th className="px-4 py-4 text-center">Units</th>
                          <th className="px-4 py-4 text-center">CA</th>
                          <th className="px-4 py-4 text-center">Exam</th>
                          <th className="px-4 py-4 text-center">Total</th>
                          <th className="px-4 py-4 text-center">Grade</th>
                          <th className="px-4 py-4 text-center">GP</th>
                          <th className="px-4 py-4 text-center">QP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredResults.map((r: any) => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 font-mono">{r.courseCode}</td>
                            <td className="px-6 py-4 font-medium text-slate-700 max-w-xs truncate" title={r.courseTitle}>{r.courseTitle}</td>
                            <td className="px-4 py-4 text-center font-bold text-slate-600">{r.credits}</td>
                            <td className="px-4 py-4 text-center text-slate-600">{r.caScore ?? '-'}</td>
                            <td className="px-4 py-4 text-center text-slate-600">{r.examScore ?? '-'}</td>
                            <td className="px-4 py-4 text-center font-black text-slate-800">{r.score}</td>
                            <td className="px-4 py-4 text-center">
                              <span className={\`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm \${
                                r.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                                r.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                r.grade === 'C' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }\`}>
                                {r.grade}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center font-bold text-slate-600">{r.gradePoint}</td>
                            <td className="px-4 py-4 text-center font-bold text-slate-600">{r.qualityPoint}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Summary */}
                  <div className="bg-slate-50 p-6 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Credit Units</p>
                      <p className="text-xl font-black text-slate-800">{semesterStats?.totalCreditUnits || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Quality Points</p>
                      <p className="text-xl font-black text-slate-800">{semesterStats?.totalQualityPoints?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-center items-center text-center">
                      <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">GPA</p>
                      <p className="text-2xl font-black text-indigo-700">{semesterStats?.gpa?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center">
                      <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">CGPA</p>
                      <p className="text-2xl font-black text-emerald-700">{profile?.cgpa ? profile.cgpa.toFixed(2) : '0.00'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-600">No Results Found</h3>
                  <p className="text-slate-500 mt-1">No published results found for the selected session and semester.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/pages/dashboards/student/AcademicResults.tsx', fileContent);
