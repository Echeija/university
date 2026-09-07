const fs = require('fs');

const content = `import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { FileSpreadsheet, Save, Search, AlertCircle, ChevronDown, CheckCircle2, Send, Lock, FileUp, FileDown, ShieldCheck, X } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ResultCalculationService } from '../../../shared/ResultCalculationService';
import * as XLSX from 'xlsx';

type PreviewRow = {
  studentId: number;
  matricNo: string;
  name: string;
  caScore: number;
  examScore: number;
  total: number;
  isValid: boolean;
  errors: string[];
};

export default function LecturerResultUpload() {
  const { token } = useAuth();
  const { notify } = useNotification();

  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  
  const [caRules, setCaRules] = useState<any>({ caMax: 30, examMax: 70 });
  const [gradingRules, setGradingRules] = useState<any[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [importPreview, setImportPreview] = useState<PreviewRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [caRes, coursesRes, gradeRes] = await Promise.all([
          fetch('/api/settings/academic_ca_rules', { headers: { Authorization: \`Bearer \${token}\` } }),
          fetch('/api/lecturer/courses', { headers: { Authorization: \`Bearer \${token}\` } }),
          fetch('/api/settings/grading_rules', { headers: { Authorization: \`Bearer \${token}\` } })
        ]);

        if (caRes.ok) {
          const rules = await caRes.json();
          if (rules && rules.length > 0) setCaRules(rules[0]);
        }
        
        if (gradeRes.ok) {
          const gRules = await gradeRes.json();
          setGradingRules(gRules);
        }

        if (coursesRes.ok) {
          const c = await coursesRes.json();
          setCourses(c);
          if (c.length > 0) setSelectedCourse(c[0]);
        }
      } catch (e) {
        notify({ title: 'Error', message: 'Failed to load initial data', type: 'error' });
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchInitData();
  }, [token, notify]);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setValidationErrors([]);
      try {
        const res = await fetch(\`/api/lecturer/courses/\${selectedCourse.id}/students-results\`, { 
          headers: { Authorization: \`Bearer \${token}\` } 
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (e) {
        notify({ title: 'Error', message: 'Failed to load students', type: 'error' });
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedCourse, token, notify]);

  const handleScoreChange = (studentId: number, field: 'ca' | 'exam', value: string) => {
    let numValue = parseFloat(value);
    
    if (value === '') {
      numValue = 0;
    } else if (isNaN(numValue)) {
      return; 
    }
    
    setStudents(prev => prev.map(st => {
      if (st.studentId === studentId) {
        if (st.status !== 'draft' && st.status !== 'returned') return st;
        const newCa = field === 'ca' ? numValue : (st.caScore || 0);
        const newExam = field === 'exam' ? numValue : (st.examScore || 0);
        const totalScore = ResultCalculationService.calculateTotalScore(newCa, newExam);
        
        return { 
          ...st, 
          caScore: newCa, 
          examScore: newExam, 
          score: totalScore,
          _caInput: field === 'ca' ? value : st._caInput,
          _examInput: field === 'exam' ? value : st._examInput 
        };
      }
      return st;
    }));
    
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleValidate = (): string[] => {
    const errors: string[] = [];
    students.forEach(st => {
      if (st.status !== 'draft' && st.status !== 'returned') return;
      const ca = Number(st.caScore || 0);
      const exam = Number(st.examScore || 0);
      
      if (ca > caRules.caMax) {
        errors.push(\`Student: \${st.matricNo} (\${st.name}) - CA score cannot exceed \${caRules.caMax}.\`);
      }
      if (exam > caRules.examMax) {
        errors.push(\`Student: \${st.matricNo} (\${st.name}) - Examination score cannot exceed \${caRules.examMax}.\`);
      }
      if (ca < 0) {
        errors.push(\`Student: \${st.matricNo} (\${st.name}) - CA score cannot be negative.\`);
      }
      if (exam < 0) {
        errors.push(\`Student: \${st.matricNo} (\${st.name}) - Examination score cannot be negative.\`);
      }
    });
    setValidationErrors(errors);
    if (errors.length === 0) {
      notify({ title: 'Validation Passed', message: 'All results are within valid bounds.', type: 'success' });
    } else {
      notify({ title: 'Validation Failed', message: 'Please correct the highlighted errors.', type: 'error' });
    }
    return errors;
  };

  const handleSaveExam = async () => {
    setIsSaving(true);
    try {
      const payload = {
        students: students.map(st => ({
          studentId: st.studentId,
          caScore: st.caScore,
          examScore: st.examScore
        })),
        isSubmit: false
      };

      const res = await fetch(\`/api/lecturer/courses/\${selectedCourse.id}/results\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        notify({ title: 'Success', message: 'Results saved successfully.', type: 'success' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to save results.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitResult = async () => {
    const errors = handleValidate();
    if (errors.length > 0) return;
    
    if (!window.confirm('Are you sure you want to submit these results? You will not be able to edit them after submission.')) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        students: students.map(st => ({
          studentId: st.studentId,
          caScore: st.caScore,
          examScore: st.examScore
        })),
        isSubmit: true
      };

      const res = await fetch(\`/api/lecturer/courses/\${selectedCourse.id}/results\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        notify({ title: 'Success', message: 'Results submitted successfully.', type: 'success' });
        const dataRes = await fetch(\`/api/lecturer/courses/\${selectedCourse.id}/students-results\`, { 
          headers: { Authorization: \`Bearer \${token}\` } 
        });
        const data = await dataRes.json();
        setStudents(data);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to submit results.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const exportData = students.map((st, i) => ({
      'Matric Number': st.matricNo,
      'CA': st.caScore ?? '',
      'Exam': st.examScore ?? ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const colWidths = [
      { wch: 20 },
      { wch: 10 },
      { wch: 10 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, \`\${selectedCourse.code}_Results_Template.xlsx\`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const preview: PreviewRow[] = [];
        
        data.forEach((row: any) => {
          const matricNo = row['Matric Number'] || row['Matric No'];
          let ca = row['CA'];
          let exam = row['Exam'];
          
          if (matricNo !== undefined) {
            const student = students.find(s => s.matricNo === matricNo);
            if (student && (student.status === 'draft' || student.status === 'returned')) {
              const caNum = Number(ca);
              const examNum = Number(exam);
              
              const rowErrors: string[] = [];
              if (isNaN(caNum) || caNum < 0) rowErrors.push('Invalid CA');
              else if (caNum > caRules.caMax) rowErrors.push(\`CA > \${caRules.caMax}\`);
              
              if (isNaN(examNum) || examNum < 0) rowErrors.push('Invalid Exam');
              else if (examNum > caRules.examMax) rowErrors.push(\`Exam > \${caRules.examMax}\`);
              
              preview.push({
                studentId: student.studentId,
                matricNo: student.matricNo,
                name: student.name,
                caScore: isNaN(caNum) ? 0 : caNum,
                examScore: isNaN(examNum) ? 0 : examNum,
                total: ResultCalculationService.calculateTotalScore(isNaN(caNum) ? 0 : caNum, isNaN(examNum) ? 0 : examNum),
                isValid: rowErrors.length === 0,
                errors: rowErrors
              });
            }
          }
        });
        
        if (preview.length === 0) {
          notify({ title: 'Import Failed', message: 'No matching editable students found in file.', type: 'error' });
        } else {
          setImportPreview(preview);
        }
      } catch (err) {
        notify({ title: 'Import Failed', message: 'Could not read the Excel file. Please ensure it matches the export template.', type: 'error' });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    
    setStudents(prev => prev.map(st => {
      const previewRow = importPreview.find(pr => pr.studentId === st.studentId);
      if (previewRow && previewRow.isValid) {
        return {
          ...st,
          caScore: previewRow.caScore,
          examScore: previewRow.examScore,
          score: previewRow.total,
          _caInput: previewRow.caScore.toString(),
          _examInput: previewRow.examScore.toString()
        };
      }
      return st;
    }));
    
    setImportPreview(null);
    notify({ title: 'Import Applied', message: 'Results imported to local draft. Please review and Save All.', type: 'success' });
  };

  const calculateDerivedMetrics = (totalScore: number, credits: number) => {
    const grade = ResultCalculationService.calculateGrade(totalScore, gradingRules);
    const gp = ResultCalculationService.calculateGradePoint(totalScore, gradingRules);
    
    return {
      grade,
      gp,
      qp: ResultCalculationService.calculateQualityPoint(credits, gp)
    };
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Course Result Entry</h1>
          <p className="text-slate-500 mt-1">Enter continuous assessment and exam scores.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="w-full md:w-96 relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block px-4 py-3 pr-10 transition-all outline-none"
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const course = courses.find(c => c.id === parseInt(e.target.value));
                  setSelectedCourse(course);
                }}
              >
                {courses.length === 0 && <option value="">No courses assigned</option>}
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          {selectedCourse && (
            <div className="flex flex-wrap gap-8 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Academic Session</span>
                <span className="font-bold text-slate-900">2025/2026</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Semester</span>
                <span className="font-bold text-slate-900">{selectedCourse.semester || '1st'} Semester</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Course Code</span>
                <span className="font-bold text-slate-900">{selectedCourse.code}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Course Title</span>
                <span className="font-bold text-slate-900 truncate max-w-xs">{selectedCourse.title}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Credit Unit</span>
                <span className="font-bold text-indigo-600">{selectedCourse.credits} Units</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500">Registered Students</span>
                <span className="font-bold text-emerald-600">{students.length} Students</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
            <div>
              <h3 className="text-red-800 font-bold text-sm">Validation Errors Found</h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or matric number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImport}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoadingStudents}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-all text-sm"
                title="Import Excel"
              >
                <FileUp className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Import</span>
              </button>
              
              <button
                onClick={handleExport}
                disabled={isLoadingStudents || students.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-all text-sm"
                title="Export Excel Template"
              >
                <FileDown className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

              <button
                onClick={handleValidate}
                disabled={isLoadingStudents || students.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl font-medium transition-all text-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Validate All</span>
              </button>

              <button
                onClick={handleSaveExam}
                disabled={isSaving || isLoadingStudents}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save All'}
              </button>
              <button
                onClick={handleSubmitResult}
                disabled={isSubmitting || isLoadingStudents}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm shadow-emerald-200 text-sm"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit All'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">S/N</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Matric No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">CA <span className="text-emerald-600 block text-[10px] mt-0.5">Max {caRules.caMax}</span></th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Exam <span className="text-indigo-600 block text-[10px] mt-0.5">Max {caRules.examMax}</span></th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total <span className="text-slate-900 block text-[10px] mt-0.5">Max 100</span></th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Grade</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">GP</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">QP</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoadingStudents ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400">
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400">
                      No students found for this course.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, index) => {
                    const isReadOnly = st.status !== 'draft' && st.status !== 'returned';
                    
                    const metrics = calculateDerivedMetrics(st.score || 0, selectedCourse.credits || 0);
                    
                    const finalGrade = st.grade || metrics.grade;
                    const finalGp = st.gradePoint !== null && st.gradePoint !== undefined ? st.gradePoint : metrics.gp;
                    const finalQp = st.qualityPoint !== null && st.qualityPoint !== undefined ? st.qualityPoint : metrics.qp;
                    
                    const hasCaError = (st.caScore || 0) > caRules.caMax || (st.caScore || 0) < 0;
                    const hasExamError = (st.examScore || 0) > caRules.examMax || (st.examScore || 0) < 0;

                    return (
                      <tr key={st.studentId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-500 text-center">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {st.matricNo}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <div className="text-xs text-slate-500">{st.department}</div>
                        </td>
                        
                        <td className="px-6 py-4 text-center align-middle">
                          <input 
                            type="number"
                            min="0"
                            max={caRules.caMax}
                            step="0.1"
                            value={st._caInput !== undefined ? st._caInput : (st.caScore ?? '')}
                            onChange={(e) => handleScoreChange(st.studentId, 'ca', e.target.value)}
                            disabled={isReadOnly}
                            className={\`w-20 text-center px-3 py-2 border rounded-lg outline-none transition-colors \${
                              isReadOnly ? 'bg-slate-50 border-transparent text-slate-500' : 
                              hasCaError ? 'bg-red-50 border-red-300 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' :
                              'bg-white border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium'
                            }\`}
                          />
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <input 
                            type="number"
                            min="0"
                            max={caRules.examMax}
                            step="0.1"
                            value={st._examInput !== undefined ? st._examInput : (st.examScore ?? '')}
                            onChange={(e) => handleScoreChange(st.studentId, 'exam', e.target.value)}
                            disabled={isReadOnly}
                            className={\`w-20 text-center px-3 py-2 border rounded-lg outline-none transition-colors \${
                              isReadOnly ? 'bg-slate-50 border-transparent text-slate-500' : 
                              hasExamError ? 'bg-red-50 border-red-300 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' :
                              'bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium'
                            }\`}
                          />
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className={\`font-bold text-lg \${st.score >= 70 ? 'text-emerald-600' : st.score >= 40 ? 'text-blue-600' : 'text-red-600'}\`}>
                            {st.score?.toFixed(1) || '0.0'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className={\`inline-flex w-8 h-8 items-center justify-center rounded-lg font-bold text-sm \${
                            ['A','B','C','D','E'].includes(finalGrade) ? 'bg-emerald-100 text-emerald-700' : 
                            finalGrade === 'F' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }\`}>
                            {finalGrade}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center align-middle font-bold text-slate-700">
                          {finalGp.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center align-middle font-bold text-indigo-700">
                          {finalQp.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className="flex justify-center">
                            {isReadOnly ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                                <Lock className="w-3.5 h-3.5" />
                                {st.status.charAt(0).toUpperCase() + st.status.slice(1).replace('_', ' ')}
                              </div>
                            ) : (
                              <span className={\`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold \${
                                st.status === 'returned' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                              }\`}>
                                {st.status.charAt(0).toUpperCase() + st.status.slice(1).replace('_', ' ')}
                              </span>
                            )}
                          </div>
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

      {/* Import Preview Modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Import Results Preview</h2>
                <p className="text-sm text-slate-500">Review calculated totals and validation errors before importing to draft.</p>
              </div>
              <button onClick={() => setImportPreview(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto bg-slate-50/50">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Matric No</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">CA</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Exam</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Total</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {importPreview.map((row, idx) => (
                    <tr key={idx} className={!row.isValid ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                      <td className="px-6 py-3 font-medium text-slate-700">{row.matricNo}</td>
                      <td className="px-6 py-3 text-slate-600">{row.name}</td>
                      <td className="px-6 py-3 text-center font-medium">{row.caScore}</td>
                      <td className="px-6 py-3 text-center font-medium">{row.examScore}</td>
                      <td className="px-6 py-3 text-center font-bold text-slate-900">{row.total}</td>
                      <td className="px-6 py-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            <AlertCircle className="w-3.5 h-3.5" /> {row.errors.join(', ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <div className="text-sm text-slate-500">
                Found <span className="font-bold text-slate-900">{importPreview.length}</span> matching records.
                {!importPreview.every(r => r.isValid) && (
                  <span className="text-red-600 ml-1">Invalid records will be ignored.</span>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setImportPreview(null)} 
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmImport}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all text-sm shadow-sm"
                >
                  Import Valid to Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', content);
console.log('Done');
