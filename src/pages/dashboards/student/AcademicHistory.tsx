import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface SemesterRecord {
  id: number;
  academicSession: string;
  semester: string;
  totalCreditUnits: number;
  totalQualityPoints: number;
  gpa: number;
}

export default function AcademicHistory() {
  const { token } = useAuth();
  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/transcript', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.semesters) {
        setSemesters(data.semesters);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  const semesterOrder: Record<string, number> = {
    'First': 1,
    'Second': 2,
    'Third': 3
  };

  const sortedSemesters = [...semesters].sort((a, b) => {
    if (a.academicSession !== b.academicSession) {
      return a.academicSession.localeCompare(b.academicSession);
    }
    const orderA = semesterOrder[a.semester] || 99;
    const orderB = semesterOrder[b.semester] || 99;
    return orderA - orderB;
  });

  let cumulativeCredits = 0;
  let cumulativePoints = 0;

  const historyData = sortedSemesters.map(record => {
    cumulativeCredits += record.totalCreditUnits;
    cumulativePoints += record.totalQualityPoints;
    const cgpa = cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits) : 0;
    
    return {
      ...record,
      cgpa
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Academic History</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Historical Performance
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading history...</div>
          ) : historyData.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No academic history found.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Session</th>
                    <th className="px-4 py-3 font-medium">Semester</th>
                    <th className="px-4 py-3 font-medium">Credit Units</th>
                    <th className="px-4 py-3 font-medium">Quality Points</th>
                    <th className="px-4 py-3 font-medium">GPA</th>
                    <th className="px-4 py-3 font-medium">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {historyData.map((record, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors bg-white dark:bg-slate-800">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{record.academicSession}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{record.semester}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{record.totalCreditUnits}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{record.totalQualityPoints.toFixed(2)}</td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        {record.gpa.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">
                        {record.cgpa.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
