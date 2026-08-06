import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Trophy, FileText, ChevronDown, Printer } from 'lucide-react';
import PerformanceTrendChart from '../../../components/PerformanceTrendChart';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function AcademicResults() {
  const { token } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/results', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Academic Results</h2>
            <p className="text-slate-500 mt-1">View your performance across all registered semesters.</p>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium print:hidden shadow-sm">
            <Printer className="w-4 h-4" />
            <span>Print Transcript</span>
          </button>
        </div>
      </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center gap-4"> 
           <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center text-emerald-700"> 
             <Trophy className="w-6 h-6" /> 
           </div> 
           <div> 
             <h3 className="font-bold text-slate-800 text-lg">Cumulative GPA</h3> 
             <p className="text-sm text-emerald-700 font-medium">First Class Honors</p> 
           </div> 
           <div className="ml-auto text-4xl font-black text-emerald-700"> 
             {isLoading ? <Skeleton className="w-20 h-10" /> : '3.85'} 
           </div>
        </div>
      </div>
      
      <div className="mb-8">
        <PerformanceTrendChart />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">2025/2026 Academic Session - 1st Semester</h3>
          <button className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
            <FileText className="w-4 h-4" /> Download Result
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Course Code</th>
                <th className="px-6 py-4">Course Title</th>
                <th className="px-6 py-4 text-center">Units</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-8 mx-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-8 mx-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 rounded-lg mx-auto" /></td>
                  </tr>
                ))
              ) : (
                results.map(result => (
                  <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{result.course.code}</td>
                    <td className="px-6 py-4 text-slate-600">{result.course.title}</td>
                    <td className="px-6 py-4 text-center font-medium">{result.course.credits}</td>
                    <td className="px-6 py-4 text-center font-medium">{result.score}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                        result.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                        result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        result.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {result.grade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
