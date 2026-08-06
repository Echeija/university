import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Users, ClipboardCheck, Plus, Search, MapPin, Clock, Trash2, Edit, FileText, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AcademicCalendarWidget from '../../../components/AcademicCalendarWidget';
import CampusSpacesWidget from '../../../components/CampusSpacesWidget';
import AcademicReportsWidget from './components/AcademicReportsWidget';

export default function AcademicDashboard() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'timetables' | 'allocations' | 'attendance' | 'calendar' | 'spaces' | 'reports'>('timetables');
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Forms
  const [showTtForm, setShowTtForm] = useState(false);
  const [showAllocForm, setShowAllocForm] = useState(false);
  const [showAttForm, setShowAttForm] = useState(false);
  
  const [ttForm, setTtForm] = useState({ courseId: '', dayOfWeek: 'Monday', startTime: '08:00', endTime: '10:00', venue: '' });
  const [allocForm, setAllocForm] = useState({ courseId: '', lecturerId: '', academicYear: '2025/2026', semester: 'First' });
  const [attForm, setAttForm] = useState({ lecturerId: '', courseId: '', date: new Date().toISOString().split('T')[0], status: 'Present', notes: '' });

  useEffect(() => {
    fetchData();
  }, [token, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const resCourses = await fetch('/api/academic/courses', { headers });
      const resLecturers = await fetch('/api/academic/lecturers', { headers });
      if (resCourses.ok) setCourses(await resCourses.json());
      if (resLecturers.ok) setLecturers(await resLecturers.json());

      if (activeTab === 'timetables') {
        const res = await fetch('/api/academic/timetables', { headers });
        if (res.ok) setTimetables(await res.json());
      } else if (activeTab === 'allocations') {
        const res = await fetch('/api/academic/allocations', { headers });
        if (res.ok) setAllocations(await res.json());
      } else if (activeTab === 'attendance') {
        const res = await fetch('/api/academic/attendance', { headers });
        if (res.ok) setAttendanceLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to fetch data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academic/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(ttForm)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Timetable added successfully', type: 'success' });
        setShowTtForm(false);
        fetchData();
      } else {
        const err = await res.json();
        notify({ title: 'Conflict Detected', message: err.error || 'Failed to add timetable', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Network error or server unavailable', type: 'error' });
    }
  };

  const handleDeleteTt = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/academic/timetables/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Timetable deleted', type: 'success' });
        fetchData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete timetable', type: 'error' });
    }
  };

  const handleCreateAlloc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academic/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(allocForm)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Course allocated successfully', type: 'success' });
        setShowAllocForm(false);
        fetchData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to allocate course', type: 'error' });
    }
  };

  const handleDeleteAlloc = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/academic/allocations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Allocation removed', type: 'success' });
        fetchData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to remove allocation', type: 'error' });
    }
  };

  const handleCreateAtt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academic/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(attForm)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Attendance logged successfully', type: 'success' });
        setShowAttForm(false);
        fetchData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to log attendance', type: 'error' });
    }
  };

  const generateTimetablePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Master Timetable', 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Course', 'Day', 'Time', 'Venue']],
      body: timetables.map(t => [t.courseCode, t.dayOfWeek, `${t.startTime} - ${t.endTime}`, t.venue])
    });
    doc.save('Timetable.pdf');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Academic Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage timetables, allocate courses, and track lecturer attendance.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, staff, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('timetables')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'timetables' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <Calendar className="w-4 h-4" /> Master Timetable
        </button>
        <button
          onClick={() => setActiveTab('allocations')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'allocations' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Course Allocation
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'calendar' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <Calendar className="w-4 h-4" /> Academic Calendar
        </button>
        <button
          onClick={() => setActiveTab('spaces')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'spaces' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <MapPin className="w-4 h-4" /> Spaces & Booking
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'reports' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <FileText className="w-4 h-4" /> Reports
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'attendance' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" /> Lecturer Attendance
        </button>
      </div>

      {activeTab === 'timetables' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Timetables</h3>
            <div className="flex gap-3">
              <button onClick={generateTimetablePDF} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Export PDF</button>
              <button onClick={() => setShowTtForm(!showTtForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                {showTtForm ? <Search className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showTtForm ? 'Close Form' : 'Upload Timetable'}
              </button>
            </div>
          </div>

          {showTtForm && (
            <form onSubmit={handleCreateTt} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course</label>
                <select required value={ttForm.courseId} onChange={e => setTtForm({...ttForm, courseId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Day</label>
                <select required value={ttForm.dayOfWeek} onChange={e => setTtForm({...ttForm, dayOfWeek: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start</label>
                  <input type="time" required value={ttForm.startTime} onChange={e => setTtForm({...ttForm, startTime: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End</label>
                  <input type="time" required value={ttForm.endTime} onChange={e => setTtForm({...ttForm, endTime: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                <input type="text" required value={ttForm.venue} onChange={e => setTtForm({...ttForm, venue: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700" placeholder="e.g. Hall A" />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Save</button>
            </form>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-medium text-sm">Course</th>
                  <th className="p-4 font-medium text-sm">Day</th>
                  <th className="p-4 font-medium text-sm">Time</th>
                  <th className="p-4 font-medium text-sm">Venue</th>
                  <th className="p-4 font-medium text-sm w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {timetables.filter(t => 
                  t.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.dayOfWeek.toLowerCase().includes(searchQuery.toLowerCase())
                ).length > 0 ? timetables.filter(t => 
                  t.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.dayOfWeek.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-4"><div className="font-medium">{t.courseCode}</div><div className="text-xs text-slate-500">{t.courseTitle}</div></td>
                    <td className="p-4">{t.dayOfWeek}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300"><Clock className="w-3.5 h-3.5 inline mr-1" />{t.startTime} - {t.endTime}</td>
                    <td className="p-4"><MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />{t.venue}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteTt(t.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No timetable entries found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'allocations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Course Allocations</h3>
            <button onClick={() => setShowAllocForm(!showAllocForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              {showAllocForm ? <Search className="w-4 h-4" /> : <Plus className="w-4 h-4" />} Allocate Course
            </button>
          </div>

          {showAllocForm && (
            <form onSubmit={handleCreateAlloc} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course</label>
                <select required value={allocForm.courseId} onChange={e => setAllocForm({...allocForm, courseId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lecturer</label>
                <select required value={allocForm.lecturerId} onChange={e => setAllocForm({...allocForm, lecturerId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700">
                  <option value="">Select Lecturer</option>
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                <input type="text" required value={allocForm.academicYear} onChange={e => setAllocForm({...allocForm, academicYear: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700" placeholder="e.g. 2025/2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                <select required value={allocForm.semester} onChange={e => setAllocForm({...allocForm, semester: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700">
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Allocate</button>
            </form>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-medium text-sm">Lecturer</th>
                  <th className="p-4 font-medium text-sm">Course</th>
                  <th className="p-4 font-medium text-sm">Academic Year</th>
                  <th className="p-4 font-medium text-sm">Semester</th>
                  <th className="p-4 font-medium text-sm w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {allocations.filter(a => 
                  a.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  a.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
                ).length > 0 ? allocations.filter(a => 
                  a.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  a.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{a.lecturerName}</td>
                    <td className="p-4"><div className="font-medium">{a.courseCode}</div><div className="text-xs text-slate-500">{a.courseTitle}</div></td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{a.academicYear}</td>
                    <td className="p-4">{a.semester}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteAlloc(a.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No course allocations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Lecturer Attendance</h3>
            <button onClick={() => setShowAttForm(!showAttForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              {showAttForm ? <Search className="w-4 h-4" /> : <Plus className="w-4 h-4" />} Log Attendance
            </button>
          </div>

          {showAttForm && (
            <form onSubmit={handleCreateAtt} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lecturer</label>
                <select required value={attForm.lecturerId} onChange={e => setAttForm({...attForm, lecturerId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700">
                  <option value="">Select Lecturer</option>
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course (Optional)</label>
                <select value={attForm.courseId} onChange={e => setAttForm({...attForm, courseId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700">
                  <option value="">None</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input type="date" required value={attForm.date} onChange={e => setAttForm({...attForm, date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select required value={attForm.status} onChange={e => setAttForm({...attForm, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700">
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Log Record</button>
            </form>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-medium text-sm">Date</th>
                  <th className="p-4 font-medium text-sm">Lecturer</th>
                  <th className="p-4 font-medium text-sm">Course</th>
                  <th className="p-4 font-medium text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {attendanceLogs.filter(a => 
                  a.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (a.courseCode && a.courseCode.toLowerCase().includes(searchQuery.toLowerCase())) || 
                  a.status.toLowerCase().includes(searchQuery.toLowerCase())
                ).length > 0 ? attendanceLogs.filter(a => 
                  a.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (a.courseCode && a.courseCode.toLowerCase().includes(searchQuery.toLowerCase())) || 
                  a.status.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-4 text-slate-600 dark:text-slate-300">{format(new Date(a.date), 'MMM d, yyyy')}</td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{a.lecturerName}</td>
                    <td className="p-4">{a.courseCode || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        a.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                        a.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">No attendance records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {activeTab === 'spaces' && (
        <div className="space-y-6">
          <CampusSpacesWidget searchQuery={searchQuery} />
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <AcademicCalendarWidget />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <AcademicReportsWidget />
        </div>
      )}

    </div>
  );
}
