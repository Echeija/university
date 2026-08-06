import React, { useState, useEffect } from 'react';
import { Award, Target, TrendingUp, AlertCircle, FileText, MessageSquare, Plus, Loader2, X, Download } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function LMSGrades({ role }: { role: string | undefined }) {
  const { user } = useAuth();
  const { notify } = useNotification();
  
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    assignment: '',
    type: 'Assignment',
    points: 0,
    total: 100,
    comments: ''
  });

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('lms_grades').select('*').order('created_at', { ascending: false });
      
      if (role === 'Student') {
        query = query.eq('student_id', user?.id?.toString() || '');
      }
      
      const { data, error } = await query;
      
      if (error) {
        // If table doesn't exist, just fallback to empty array instead of breaking
        console.error("Fetch grades error (maybe table doesn't exist):", error);
        setGrades([]);
      } else {
        setGrades(data || []);
      }
    } catch (err) {
      console.error(err);
      setGrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [role, user]);

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('lms_grades').insert([
        {
          student_id: formData.student_id,
          student_name: formData.student_name || `Student ${formData.student_id}`,
          assignment: formData.assignment,
          type: formData.type,
          points: Number(formData.points),
          total: Number(formData.total),
          comments: formData.comments,
        }
      ]);
      
      if (error) throw error;
      
      notify({ title: 'Success', message: 'Grade saved successfully', type: 'success' });
      setIsModalOpen(false);
      setFormData({
        student_id: '',
        student_name: '',
        assignment: '',
        type: 'Assignment',
        points: 0,
        total: 100,
        comments: ''
      });
      fetchGrades();
    } catch (err: any) {
      console.error(err);
      notify({ title: 'Error', message: err.message || 'Failed to save grade', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleExportCSV = () => {
    if (grades.length === 0) {
      notify({ title: 'Export Failed', message: 'No grades available to export.', type: 'error' });
      return;
    }

    const headers = ['Student ID', 'Student Name', 'Assignment', 'Type', 'Points', 'Total', 'Comments'];
    const csvContent = [
      headers.join(','),
      ...grades.map(g => [
        g.student_id || '',
        `"${(g.student_name || '').replace(/"/g, '""')}"`,
        `"${(g.assignment || '').replace(/"/g, '""')}"`,
        `"${(g.type || '').replace(/"/g, '""')}"`,
        g.points || 0,
        g.total || 0,
        `"${(g.comments || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_grades.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (grades.length === 0) {
      notify({ title: 'Export Failed', message: 'No grades available to export.', type: 'error' });
      return;
    }
    // simple window.print() triggered just for the table
    window.print();
  };

  const calculateGPA = () => {

    if (grades.length === 0) return { percent: 0, letter: 'N/A' };
    
    const totalPoints = grades.reduce((acc, curr) => acc + (curr.points || 0), 0);
    const maxPoints = grades.reduce((acc, curr) => acc + (curr.total || 0), 0);
    
    if (maxPoints === 0) return { percent: 0, letter: 'N/A' };
    
    const percent = (totalPoints / maxPoints) * 100;
    let letter = 'F';
    if (percent >= 90) letter = 'A';
    else if (percent >= 80) letter = 'B';
    else if (percent >= 70) letter = 'C';
    else if (percent >= 60) letter = 'D';
    
    return { percent, letter };
  };

  const gpa = calculateGPA();

  if (role === 'Student') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">My Grades & GPA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">Total Grade (GPA)</h4>
            <div className="text-4xl font-black text-emerald-700 dark:text-emerald-300">
              {gpa.percent.toFixed(1)}%
            </div>
            <p className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70 mt-1">
              Letter Grade: {gpa.letter}
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Assignments Graded</h4>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-200">{grades.length}</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : grades.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No grades available yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Assignment</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Type</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Date Graded</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {grades.map(grade => (
                  <tr key={grade.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{grade.assignment}</p>
                      {grade.comments && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {grade.comments}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{grade.type}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(grade.created_at || Date.now()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{grade.points}</span>
                      <span className="text-slate-400 dark:text-slate-500"> / {grade.total}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Lecturer view
  return (
    <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Gradebook Management</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 print:hidden"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 print:hidden"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 print:hidden"
          >
            <Plus className="w-4 h-4" />
            Input Grade
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : grades.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No student grades recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Student</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Assignment</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-right">Score</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {grades.map(grade => (
                <tr key={grade.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {grade.student_name || `Student ID: ${grade.student_id}`}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{grade.assignment}</span>
                    <span className="ml-2 text-xs text-slate-500">({grade.type})</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-md">{grade.points}</span>
                    <span className="text-slate-400 dark:text-slate-500"> / {grade.total}</span>
                    <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(grade.points / grade.total) * 100}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                      {grade.comments || '-'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Input Student Grade</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.student_id}
                    onChange={e => setFormData({...formData, student_id: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={formData.student_name}
                    onChange={e => setFormData({...formData, student_name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignment Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.assignment}
                    onChange={e => setFormData({...formData, assignment: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Exam">Exam</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Points Earned *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.points}
                    onChange={e => setFormData({...formData, points: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Points *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.total}
                    onChange={e => setFormData({...formData, total: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comments / Feedback</label>
                <textarea
                  rows={3}
                  value={formData.comments}
                  onChange={e => setFormData({...formData, comments: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
