import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Calendar, Plus, Trash2, Clock, MapPin, BookOpen, UserCircle, FileText } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function LecturerExamManagement() {
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newExam, setNewExam] = useState({
    courseId: '',
    examDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    instructions: ''
  });

  const loadData = async () => {
    try {
      const [examsRes, coursesRes] = await Promise.all([
        fetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/lecturer/courses', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const examsData = await examsRes.json();
      const coursesData = await coursesRes.json();
      
      setExams(examsData);
      setCourses(coursesData);
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to load exams', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/lecturer/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newExam,
          courseId: parseInt(newExam.courseId)
        })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Exam scheduled successfully', type: 'success' });
        setIsAdding(false);
        setNewExam({ courseId: '', examDate: '', startTime: '', endTime: '', venue: '', instructions: '' });
        loadData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to schedule exam', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this exam?')) return;
    try {
      const res = await fetch(`/api/lecturer/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Deleted', message: 'Exam cancelled successfully', type: 'success' });
        loadData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to cancel exam', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Exam Scheduling</h2>
          <p className="text-slate-500 mt-1">Schedule and manage exams for your allocated courses.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold shadow-sm"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-5 h-5" /> Schedule Exam</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddExam} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 fade-in">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> New Exam Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
              <select required value={newExam.courseId} onChange={e => setNewExam({...newExam, courseId: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Select Course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Date</label>
              <input required type="date" value={newExam.examDate} onChange={e => setNewExam({...newExam, examDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input required type="time" value={newExam.startTime} onChange={e => setNewExam({...newExam, startTime: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input required type="time" value={newExam.endTime} onChange={e => setNewExam({...newExam, endTime: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
              <input required type="text" value={newExam.venue} onChange={e => setNewExam({...newExam, venue: e.target.value})} placeholder="e.g. Main Hall A" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Special Instructions</label>
              <input type="text" value={newExam.instructions} onChange={e => setNewExam({...newExam, instructions: e.target.value})} placeholder="e.g. Open book, No calculators" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-indigo-900 text-white font-bold rounded-lg hover:bg-indigo-800 transition-colors">
              Save Exam Schedule
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i}><Skeleton  className="h-48 w-full rounded-2xl" /></div>)
        ) : exams.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-600">No Exams Scheduled</h3>
            <p className="text-slate-500 mt-1">You have not scheduled any exams for your courses yet.</p>
          </div>
        ) : (
          exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wider mb-2 inline-block">
                    {exam.courseCode}
                  </span>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{exam.courseTitle}</h3>
                </div>
                <button onClick={() => handleDelete(exam.id)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4 flex-1">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{new Date(exam.examDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{exam.startTime} - {exam.endTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{exam.venue}</span>
                </div>
                {exam.instructions && (
                  <div className="flex items-start gap-3 text-sm text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-amber-800 text-xs">{exam.instructions}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
