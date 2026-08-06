import React, { useState } from 'react';
import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3, CheckSquare, Video, MessageSquare, BookOpen, Users, ClipboardEdit, Calendar, Clock, CheckCircle2, AlertCircle, ChevronRight, Printer, X, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import LecturePortalWidget from '../../../components/LecturePortalWidget';
import ExamCountdownWidget from '../../../components/ExamCountdownWidget';
import AcademicCalendarWidget from '../../../components/AcademicCalendarWidget';
import FacilityBookingSystem from '../../../components/FacilityBookingSystem';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [courses] = useState([
    { id: 1, code: 'CSC 301', title: 'Data Structures', studentsCount: 45, credits: 4, nextClass: 'Today, 09:00 AM' },
    { id: 2, code: 'CSC 405', title: 'Artificial Intelligence', studentsCount: 38, credits: 3, nextClass: 'Tomorrow, 11:00 AM' },
    { id: 3, code: 'MTH 201', title: 'Advanced Calculus', studentsCount: 120, credits: 3, nextClass: 'Wednesday, 02:00 PM' }
  ]);

  const [selectedCourseRoster, setSelectedCourseRoster] = useState<any>(null);

  const recentSubmissions = [
    { id: 1, student: 'John Doe', course: 'CSC 301', title: 'Project Proposal', status: 'pending', time: '2 hours ago' },
    { id: 2, student: 'Jane Smith', course: 'CSC 405', title: 'AI Ethics Essay', status: 'graded', time: '5 hours ago' },
    { id: 3, student: 'Alice Johnson', course: 'MTH 201', title: 'Midterm Exam', status: 'pending', time: '1 day ago' },
  ];

  const handlePrintDashboard = () => {
    window.print();
  };

  const handlePrintRoster = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Generate some mock students for the roster
  const generateMockRoster = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: `STD${new Date().getFullYear()}${String(i + 1).padStart(4, '0')}`,
      name: `Student ${i + 1}`,
      seatNumber: `Seat ${i + 1}`
    }));
  };

  return (
    <>
      {/* Dashboard View (Hidden during Print when a roster is selected) */}
      <div className={`space-y-6 ${selectedCourseRoster ? 'print:hidden' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Lecturer Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400">Welcome back</p>
          </div>
          <button
            onClick={handlePrintDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium print:hidden shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Schedule</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Assigned Courses</h3>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{courses.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Total Students</h3>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {courses.reduce((acc, curr) => acc + curr.studentsCount, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Pending Grading</h3>
            <p className="text-3xl font-black text-amber-500 dark:text-amber-400">
              {recentSubmissions.filter(s => s.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Assigned Courses */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  My Courses & Rosters
                </h3>
                <Link to="/dashboard/assigned-courses" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {courses.map(course => (
                  <div key={course.id} className="flex flex-col sm:flex-row gap-4 justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{course.code}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {course.credits} Credits
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{course.title}</p>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-400" /> {course.studentsCount} Students
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" /> Next: {course.nextClass}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col gap-2 justify-center sm:min-w-[140px]">
                      <Link to="/dashboard/attendance" className="flex-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Attendance
                      </Link>
                      <Link to={`/dashboard/grading/${course.id}`} className="flex-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                        <ClipboardEdit className="w-3.5 h-3.5" /> Grade Students
                      </Link>
                      <button 
                        onClick={() => setSelectedCourseRoster(course)}
                        className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Roster
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <LecturePortalWidget />
            
            <ExamCountdownWidget 
              title="Midterm Examination" 
              courseName="CSC 301 - Data Structures" 
              targetDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()} 
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Academic Calendar</h3>
            <AcademicCalendarWidget />
          </div>

          {/* Right Column: Pending Grading & Activities */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <ClipboardEdit className="w-5 h-5 text-amber-500" />
                Recent Submissions
              </h3>
              <div className="space-y-4">
                {recentSubmissions.map(sub => (
                  <div key={sub.id} className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{sub.student}</span>
                      {sub.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <AlertCircle className="w-2.5 h-2.5" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Graded
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{sub.course}</span> • {sub.title}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sub.time}</span>
                      {sub.status === 'pending' && (
                        <Link to={`/dashboard/grading/${courses.find(c => c.code === sub.course)?.id || 1}`} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold hover:underline">
                          Grade Now
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {recentSubmissions.filter(s => s.status === 'pending').length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Link to="/dashboard/assigned-courses" className="w-full block text-center py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors">
                    View All Pending
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/dashboard/assigned-courses" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Course Allocation</span>
        </Link>
        <Link to="/dashboard/attendance" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <CheckSquare className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Attendance</span>
        </Link>
        <Link to="/dashboard/result-upload" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Result Upload</span>
        </Link>
        <Link to="/dashboard/continuous-assessment" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <ClipboardList className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Continuous Assessment</span>
        </Link>
        <Link to="/dashboard/assignments" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <BookText className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Assignments</span>
        </Link>
        <Link to="/dashboard/teaching-materials" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <FolderOpen className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Teaching Materials</span>
        </Link>
        <Link to="/dashboard/video-upload" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Video className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Video Upload</span>
        </Link>
        <Link to="/dashboard/class-management" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Class Management</span>
        </Link>
        <Link to="/dashboard/announcements" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Megaphone className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Announcements</span>
        </Link>
        <Link to="/dashboard/messages" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Messaging</span>
        </Link>
        <Link to="/dashboard/research" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Microscope className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Research</span>
        </Link>
        <Link to="/dashboard/performance-analytics" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <BarChart3 className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Performance Analytics</span>
        </Link>
      </div>

      {/* Roster Print Modal/View */}
      {selectedCourseRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:static print:block print:bg-white print:p-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:block">
            {/* Modal Header - Hidden on Print */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Roster: {selectedCourseRoster.code}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintRoster}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print Roster
                </button>
                <button
                  onClick={() => setSelectedCourseRoster(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-8 overflow-y-auto print:overflow-visible print:p-0 bg-white">
              <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">University Name</h1>
                <h2 className="text-xl font-bold text-slate-700 mt-2">Exam Seating Plan & Student Roster</h2>
                <div className="mt-4 flex justify-between text-sm text-slate-600 border-b border-slate-300 pb-4">
                  <p><strong>Course:</strong> {selectedCourseRoster.code} - {selectedCourseRoster.title}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Lecturer:</strong> {user?.name}</p>
                </div>
              </div>

              {/* Only visible in modal view for context */}
              <div className="print:hidden mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
                  This preview shows the data that will be printed. Click "Print Roster" to generate the printable document.
                </p>
              </div>

              <div className="overflow-x-auto"><table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="py-3 px-4 font-bold text-slate-800">No.</th>
                    <th className="py-3 px-4 font-bold text-slate-800">Student ID</th>
                    <th className="py-3 px-4 font-bold text-slate-800">Student Name</th>
                    <th className="py-3 px-4 font-bold text-slate-800 text-center">Seat Number</th>
                    <th className="py-3 px-4 font-bold text-slate-800 text-center">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {generateMockRoster(Math.min(selectedCourseRoster.studentsCount, 30)).map((student, index) => (
                    <tr key={student.id} className="border-b border-slate-200">
                      <td className="py-2 px-4 text-slate-700">{index + 1}</td>
                      <td className="py-2 px-4 text-slate-700 font-medium">{student.id}</td>
                      <td className="py-2 px-4 text-slate-700">{student.name}</td>
                      <td className="py-2 px-4 text-slate-700 text-center">{student.seatNumber}</td>
                      <td className="py-2 px-4">
                        <div className="border-b border-dashed border-slate-400 w-full h-6"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
              
              <div className="mt-8 text-sm text-slate-500 text-center hidden print:block">
                <p>Page 1 of 1</p>
                <p className="mt-2 text-xs">Generated on {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

