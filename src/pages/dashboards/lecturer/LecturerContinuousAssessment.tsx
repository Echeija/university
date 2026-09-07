import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { ClipboardList, Save, Search, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function LecturerContinuousAssessment() {
  const { token } = useAuth();
  const { notify } = useNotification();

  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  
  const [caRules, setCaRules] = useState<any>({
    caMax: 30,
    examMax: 70,
    components: [
      { id: '1', name: 'Assignment', maxScore: 10 },
      { id: '2', name: 'Test', maxScore: 20 }
    ]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch CA Rules and Assigned Courses on mount
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [rulesRes, coursesRes] = await Promise.all([
          fetch('/api/settings/academic_ca_rules', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/lecturer/courses', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (rulesRes.ok) {
          const rulesData = await rulesRes.json();
          if (rulesData && rulesData.components) {
            setCaRules(rulesData);
          }
        }
        
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchInitData();
  }, [token]);

  // Fetch students when a course is selected
  useEffect(() => {
    if (!selectedCourse) return;
    
    setIsLoadingStudents(true);
    fetch(`/api/lecturer/courses/${selectedCourse.id}/students-results`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(res => res.json())
      .then(data => {
        // initialize caBreakdown for UI if missing
        const initialized = data.map((st: any) => ({
          ...st,
          caBreakdown: st.caBreakdown || {}
        }));
        setStudents(initialized);
        setIsLoadingStudents(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoadingStudents(false);
      });
  }, [selectedCourse, token]);

  const handleScoreChange = (studentId: number, compName: string, value: string, maxScore: number) => {
    // Basic validation logic
    let numValue = parseFloat(value);
    
    if (value === '') {
      numValue = 0; // Or allow empty, but for math we need a number
    } else if (isNaN(numValue)) {
      return; // Invalid numeric
    } else if (numValue < 0) {
      numValue = 0; // No negative
    } else if (numValue > maxScore) {
      numValue = maxScore; // Not above max
    }

    setStudents(prev => prev.map(st => {
      if (st.studentId === studentId) {
        // Status protection check - if submitted or beyond, don't allow edits
        if (st.status !== 'draft' && st.status !== 'returned') return st;

        const updatedBreakdown = { ...st.caBreakdown, [compName]: numValue };
        
        // Auto-calculate new total
        let newTotal = 0;
        caRules.components.forEach((c: any) => {
          newTotal += updatedBreakdown[c.name] || 0;
        });

        // Ensure total doesn't somehow exceed global CA max
        if (newTotal > caRules.caMax) newTotal = caRules.caMax;

        return { ...st, caBreakdown: updatedBreakdown, caScore: newTotal };
      }
      return st;
    }));
  };

  const handleSaveCA = async () => {
    setIsSaving(true);
    try {
      const payload = {
        isSubmit: false,
        students: students.map(st => ({
          studentId: st.studentId,
          caScore: st.caScore,
          caBreakdown: st.caBreakdown,
          examScore: st.examScore
        }))
      };

      const res = await fetch(`/api/lecturer/courses/${selectedCourse.id}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        notify({ title: 'Success', message: 'CA scores saved successfully.', type: 'success' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to save CA scores.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(st => 
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      st.matricNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  if (isLoadingCourses) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-emerald-600" />
            Continuous Assessment
          </h1>
          <p className="text-slate-500 mt-2">Manage CA scores for your assigned courses.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Select Course</label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-slate-900"
                value={selectedCourse?.courseId || ''}
                onChange={(e) => {
                  const course = courses.find(c => c.courseId.toString() === e.target.value);
                  setSelectedCourse(course || null);
                }}
              >
                <option value="" disabled>-- Select a course --</option>
                {courses.map(c => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.courseCode} - {c.courseTitle} ({c.academicYear} / {c.semester})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2 flex flex-col justify-end">
             {selectedCourse && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-emerald-800">
                    <span className="font-bold">Max CA Score: {caRules.caMax}</span><br />
                    Breakdown: {caRules.components.map((c: any) => `${c.name} (${c.maxScore})`).join(', ')}
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>

      {selectedCourse && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search students by name or matric no..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
            
            <button
              onClick={handleSaveCA}
              disabled={isSaving || isLoadingStudents}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shrink-0"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Student</th>
                  {caRules.components.map((c: any) => (
                    <th key={c.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                      {c.name} <span className="text-emerald-600 block text-[10px] mt-0.5">Max {c.maxScore}</span>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total CA <span className="text-emerald-600 block text-[10px] mt-0.5">Max {caRules.caMax}</span></th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingStudents ? (
                  <tr>
                    <td colSpan={caRules.components.length + 3} className="p-8 text-center text-slate-400">
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={caRules.components.length + 3} className="p-8 text-center text-slate-400">
                      No students found for this course.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const isReadOnly = st.status !== 'draft' && st.status !== 'returned';
                    return (
                      <tr key={st.studentId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="font-bold text-slate-900 whitespace-normal min-w-[140px] leading-tight">{st.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{st.matricNo} • {st.department}</div>
                        </td>
                        
                        {caRules.components.map((c: any) => (
                          <td key={c.id} className="px-6 py-4 text-center align-middle">
                            <input 
                              type="number"
                              min="0"
                              max={c.maxScore}
                              step="0.1"
                              value={st.caBreakdown[c.name] ?? ''}
                              onChange={(e) => handleScoreChange(st.studentId, c.name, e.target.value, c.maxScore)}
                              disabled={isReadOnly}
                              className={`w-24 text-center px-3 py-2.5 text-base sm:text-sm border rounded-lg outline-none transition-colors ${
                                isReadOnly ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium'
                              }`}
                            />
                          </td>
                        ))}

                        <td className="px-6 py-4 text-center align-middle">
                          <div className={`font-bold text-lg ${st.caScore === caRules.caMax ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {st.caScore.toFixed(1)}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center align-middle">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            st.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                            st.status === 'returned' ? 'bg-orange-100 text-orange-700' :
                            st.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {st.status.charAt(0).toUpperCase() + st.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
