import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { BookOpen, Save, Send, AlertCircle, FileSpreadsheet, Lock, Clock, CheckCircle2 } from 'lucide-react';

export default function LecturerResultUpload() {
  const { token } = useAuth();
  const { notify } = useNotification();

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [gradingRules, setGradingRules] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchGradingRules();
  }, [token]);

  useEffect(() => {
    if (selectedCourseId && gradingRules.length > 0) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedCourseId, gradingRules]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/lecturer/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) setSelectedCourseId(data[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGradingRules = async () => {
    try {
      const res = await fetch('/api/grading-rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGradingRules(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCourseCredits = (courseId: string) => {
    const course = courses.find(c => c.id.toString() === courseId);
    return course ? course.credits : 0;
  };

  const calculateGradeInfo = (total: number) => {
    if (gradingRules.length === 0) {
       if (total >= 70) return { grade: 'A', gradePoint: 5.0 };
       if (total >= 60) return { grade: 'B', gradePoint: 4.0 };
       if (total >= 50) return { grade: 'C', gradePoint: 3.0 };
       if (total >= 45) return { grade: 'D', gradePoint: 2.0 };
       if (total >= 40) return { grade: 'E', gradePoint: 1.0 };
       return { grade: 'F', gradePoint: 0.0 };
    }
    const matchedRule = gradingRules.find(r => total >= r.minScore && total <= r.maxScore);
    if (matchedRule) {
      return { grade: matchedRule.grade, gradePoint: matchedRule.gradePoint };
    }
    return { grade: 'F', gradePoint: 0.0 };
  };

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lecturer/courses/${selectedCourseId}/students-results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const credits = getCourseCredits(selectedCourseId);
        
        setStudents(data.map((s: any) => {
           let gradePoint = 0;
           let qualityPoint = 0;
           if (s.score !== null && s.score !== undefined) {
             const info = calculateGradeInfo(s.score);
             gradePoint = info.gradePoint;
             qualityPoint = gradePoint * credits;
           }
           
           return {
            ...s,
            caScore: s.caScore ?? '',
            examScore: s.examScore ?? '',
            totalScore: s.score ?? null, // UI mapping
            gradePoint,
            qualityPoint
          };
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (studentId: number, field: 'caScore' | 'examScore', value: string) => {
    let numVal = value === '' ? null : Number(value);
    
    // Strict Input Validation based on standard grading schema
    if (numVal !== null) {
      if (field === 'caScore' && numVal > 30) numVal = 30;
      if (field === 'examScore' && numVal > 70) numVal = 70;
      if (numVal < 0) numVal = 0;
    }
    
    const strVal = numVal === null ? '' : numVal.toString();
    const credits = getCourseCredits(selectedCourseId);

    setStudents(prev => prev.map(s => {
      if (s.studentId !== studentId) return s;
      
      const ca = field === 'caScore' ? Number(strVal || 0) : Number(s.caScore || 0);
      const ex = field === 'examScore' ? Number(strVal || 0) : Number(s.examScore || 0);
      
      const isAnyProvided = (field === 'caScore' ? strVal !== '' : s.caScore !== '') || 
                            (field === 'examScore' ? strVal !== '' : s.examScore !== '');
                            
      let total = null;
      let grade = '';
      let gradePoint = 0;
      let qualityPoint = 0;

      if (isAnyProvided) {
        total = ca + ex;
        const info = calculateGradeInfo(total);
        grade = info.grade;
        gradePoint = info.gradePoint;
        qualityPoint = gradePoint * credits;
      }

      return {
        ...s,
        [field]: strVal,
        totalScore: total,
        grade,
        gradePoint,
        qualityPoint
      };
    }));
  };

  const handleSave = async (isSubmit: boolean = false) => {
    if (isSubmit) {
      const confirmSubmit = window.confirm("Are you sure you want to SUBMIT? You will not be able to edit these results after submission unless returned by the HOD.");
      if (!confirmSubmit) return;
    }

    const loader = isSubmit ? setIsSubmitting : setIsSaving;
    loader(true);

    try {
      const res = await fetch(`/api/lecturer/courses/${selectedCourseId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ students, isSubmit })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        notify({
          title: isSubmit ? 'Results Submitted' : 'Draft Saved',
          message: data.message || (isSubmit ? 'Successfully submitted for approval.' : 'Draft saved securely.'),
          type: 'success'
        });
        loadStudents();
      } else {
        notify({ title: 'Error', message: data.error, type: 'error' });
      }
    } catch (err: any) {
      notify({ title: 'Error', message: 'Network error saving results', type: 'error' });
    } finally {
      loader(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'draft': return <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded"><Clock className="w-3 h-3" /> Draft</span>;
      case 'submitted': return <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded"><CheckCircle2 className="w-3 h-3" /> Submitted</span>;
      case 'returned': return <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded"><AlertCircle className="w-3 h-3" /> Returned</span>;
      case 'hod_approved': 
      case 'registrar_approved':
      case 'published':
      case 'locked':
        return <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded"><Lock className="w-3 h-3" /> Locked</span>;
      default: return <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">New Entry</span>;
    }
  };

  const isRowLocked = (status: string) => {
    return ['submitted', 'hod_approved', 'registrar_approved', 'published', 'locked'].includes(status);
  };

  const hasDrafts = students.some(s => !isRowLocked(s.status));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Result Entry Module
          </div>
          <h2 className="text-2xl font-black tracking-tight">Academic Results Entry</h2>
          <p className="text-slate-400 text-sm mt-1">
            Enter Continuous Assessment and Examination scores. Auto-calculation applied based on institutional rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving || isSubmitting || !hasDrafts || students.length === 0}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving || isSubmitting || !hasDrafts || students.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm shrink-0"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit to HOD'}
          </button>
        </div>
      </div>

      {/* Course Selection */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <BookOpen className="w-4 h-4 text-slate-500" /> Select Course:
        </div>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.code}: {c.title} ({c.credits} Credits)
            </option>
          ))}
        </select>
      </div>

      {/* Results Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading course sheet...</div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-600 mb-1">No Students Found</h3>
            <p>There are no students registered for this course yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Matric No</th>
                  <th className="px-5 py-4">Student Name</th>
                  <th className="px-3 py-4 w-24 text-center">CA (30)</th>
                  <th className="px-3 py-4 w-24 text-center">Exam (70)</th>
                  <th className="px-3 py-4 w-20 text-center">Total</th>
                  <th className="px-3 py-4 text-center w-20">Grade</th>
                  <th className="px-3 py-4 text-center w-20">GP</th>
                  <th className="px-3 py-4 text-center w-20">QP</th>
                  <th className="px-5 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => {
                  const locked = isRowLocked(s.status);
                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-700">
                        {s.matricNo}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 truncate max-w-[200px]">
                        {s.name}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          disabled={locked}
                          value={s.caScore}
                          onChange={(e) => handleScoreChange(s.studentId, 'caScore', e.target.value)}
                          placeholder="-"
                          className="w-full p-2 border border-slate-200 rounded-lg text-center font-bold text-slate-900 bg-white disabled:bg-slate-50 disabled:text-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          disabled={locked}
                          value={s.examScore}
                          onChange={(e) => handleScoreChange(s.studentId, 'examScore', e.target.value)}
                          placeholder="-"
                          className="w-full p-2 border border-slate-200 rounded-lg text-center font-bold text-slate-900 bg-white disabled:bg-slate-50 disabled:text-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="px-3 py-4 text-center font-black text-slate-700 text-base">
                        {s.totalScore ?? '-'}
                      </td>
                      <td className="px-3 py-4 text-center">
                        {s.grade ? (
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                            s.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                            s.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            s.grade === 'C' ? 'bg-amber-100 text-amber-800' :
                            s.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {s.grade}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-slate-500">
                        {s.gradePoint ? s.gradePoint.toFixed(1) : '-'}
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-indigo-600 bg-indigo-50/50">
                        {s.qualityPoint ? s.qualityPoint.toFixed(1) : '-'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {renderStatusBadge(s.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
