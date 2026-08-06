import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Calendar, Users, CheckCircle2, XCircle, Clock, FileText, ChevronRight, Save } from 'lucide-react';

interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
}

interface Student {
  id: number;
  name: string;
  username: string;
  profilePicture: string | null;
}

interface AttendanceRecord {
  studentId: number;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

export default function AttendanceTracking() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, AttendanceRecord['status']>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    // Fetch courses assigned to lecturer
    fetch('/api/lecturer/courses', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setCourses(Array.isArray(data) ? data : []);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [token]);

  useEffect(() => {
    if (!selectedCourse) return;
    
    setIsLoading(true);
    // Fetch enrolled students
    fetch(`/api/attendance/courses/${selectedCourse}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setStudents(data);
      // Try to fetch existing attendance for the selected date
      return fetch(`/api/attendance/courses/${selectedCourse}/records?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    })
    .then(res => res.json())
    .then(data => {
      const records: Record<number, AttendanceRecord['status']> = {};
      if (Array.isArray(data)) {
        data.forEach(r => {
          records[r.studentId] = r.status;
        });
      }
      setAttendanceRecords(records);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [selectedCourse, selectedDate, token]);

  const handleMarkAttendance = (studentId: number, status: AttendanceRecord['status']) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) return;
    setIsSaving(true);
    
    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId: parseInt(studentId),
      status
    }));

    try {
      const res = await fetch(`/api/attendance/courses/${selectedCourse}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          date: selectedDate,
          records
        })
      });

      if (res.ok) {
        notify({ title: 'Success', message: 'Attendance records saved successfully', type: 'success' });
      } else {
        const err = await res.json();
        notify({ title: 'Error', message: err.error || 'Failed to save attendance', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Calendar className="w-8 h-8 text-indigo-600" />
          Attendance Tracking
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Mark daily attendance for your assigned courses.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Course</label>
            <select 
              value={selectedCourse || ''} 
              onChange={e => setSelectedCourse(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
            >
              <option value="" disabled>Select a course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 md:max-w-xs">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
            />
          </div>
        </div>
      </div>

      {selectedCourse && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Class Roster ({students.length})
            </h3>
            
            <button 
              onClick={handleSaveAttendance}
              disabled={isSaving || students.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading roster...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">No students enrolled in this course.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700">Student Name</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700">Matric No.</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700 text-center">Present</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700 text-center">Absent</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700 text-center">Late</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700 text-center">Excused</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                        {student.username || 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${student.id}`} 
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-600" 
                          checked={attendanceRecords[student.id] === 'Present'}
                          onChange={() => handleMarkAttendance(student.id, 'Present')}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${student.id}`} 
                          className="w-4 h-4 text-red-600 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-600" 
                          checked={attendanceRecords[student.id] === 'Absent'}
                          onChange={() => handleMarkAttendance(student.id, 'Absent')}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${student.id}`} 
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-600" 
                          checked={attendanceRecords[student.id] === 'Late'}
                          onChange={() => handleMarkAttendance(student.id, 'Late')}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${student.id}`} 
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600" 
                          checked={attendanceRecords[student.id] === 'Excused'}
                          onChange={() => handleMarkAttendance(student.id, 'Excused')}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
