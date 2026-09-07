import React from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, User, Mail, Phone, GraduationCap, Printer, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDeadlineNotifications } from '../../../hooks/useDeadlineNotifications';
import { useMemo } from 'react';
import { transcriptService } from '../../../services/transcriptService';
import GradeNotifier from '../../../components/GradeNotifier';
import PaymentAlertsWidget from '../../../components/PaymentAlertsWidget';
import CourseEnrollmentWidget from '../../../components/CourseEnrollmentWidget';
import QuickActions from '../../../components/QuickActions';
import PerformanceOverview from '../../../components/PerformanceOverview';
import GradebookWidget from '../../../components/GradebookWidget';
import EventsWidget from '../../../components/CampusEventsWidget';
import CampusSpacesWidget from '../../../components/CampusSpacesWidget';
import RecentMaterialsWidget from '../../../components/RecentMaterialsWidget';
import StudentFeeWidget from '../../../components/StudentFeeWidget';
import FeeBreakdownWidget from '../../../components/FeeBreakdownWidget';
import AcademicCalendarWidget from '../../../components/AcademicCalendarWidget';
import AcademicTimelineWidget from '../../../components/AcademicTimelineWidget';
import SupabaseDocumentUploader from '../../../components/SupabaseDocumentUploader';
import DocumentUploader from '../../../components/DocumentUploader';

import StudentMedicalHistory from '../../../components/StudentMedicalHistory';
import ClinicAppointmentWidget from '../../../components/ClinicAppointmentWidget';
import PrescriptionRefillWidget from '../../../components/PrescriptionRefillWidget';

import AppointmentReminderSystem from '../../../components/AppointmentReminderSystem';
import CourseProgressWidget from '../../../components/CourseProgressWidget';
import AIStudyPlannerWidget from '../../../components/AIStudyPlannerWidget';
import StudentCalendar from '../../../components/StudentCalendar';
import DigitalResourceLibrary from '../../../components/DigitalResourceLibrary';
import FacilityBookingSystem from '../../../components/FacilityBookingSystem';

import AcademicOverviewWidget from '../../../components/AcademicOverviewWidget';

export default function StudentDashboard() {
  const [cgpa, setCgpa] = React.useState<number | null>(null);
  const { user, token } = useAuth();
  React.useEffect(() => {
    fetch('/api/student/academic-profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data && data.cgpa !== undefined) setCgpa(data.cgpa);
      })
      .catch(e => console.error(e));
  }, [token]);




  const handlePrint = () => {
    window.print();
  };

  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadTranscript = async () => {
    setIsDownloading(true);
    try {
      const [profileRes, transcriptRes] = await Promise.all([
        fetch('/api/student/academic-profile', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/student/transcript', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (profileRes.ok && transcriptRes.ok) {
        const profile = await profileRes.json();
        const transcriptData = await transcriptRes.json();
        
        transcriptService.downloadOfficialTranscript({
          profile,
          transcriptData
        });
      } else {
        alert("Could not load transcript data.");
      }
    } catch (e) {
      console.error("Error downloading transcript:", e);
      alert("Error downloading transcript.");
    } finally {
      setIsDownloading(false);
    }
  };
  const currentGrades = [
    { course: 'CSC 301', title: 'Data Structures', grade: 'A', points: 4.0 },
    { course: 'MTH 305', title: 'Linear Algebra', grade: 'B+', points: 3.5 },
    { course: 'PHY 303', title: 'Quantum Mechanics', grade: 'A-', points: 3.7 },
  ];
  
  const enrolledCourses = [
    { code: 'CSC 301', title: 'Data Structures', credits: 4, instructor: 'Dr. Alan Turing', progress: 75 },
    { code: 'MTH 305', title: 'Linear Algebra', credits: 3, instructor: 'Dr. Emmy Noether', progress: 40 },
    { code: 'PHY 303', title: 'Quantum Mechanics', credits: 4, instructor: 'Dr. Richard Feynman', progress: 90 },
    { code: 'GST 301', title: 'Entrepreneurship', credits: 2, instructor: 'Mrs. Jane Doe', progress: 10 }
  ];

  const upcomingAssignments = [
    { id: 1, title: 'Binary Tree Implementation', course: 'CSC 301', dueDate: '2026-07-20', status: 'Pending' },
    { id: 2, title: 'Matrix Transformations', course: 'MTH 305', dueDate: '2026-07-22', status: 'In Progress' },
    { id: 3, title: 'Quantum States Essay', course: 'PHY 303', dueDate: '2026-07-25', status: 'Pending' }
  ];

  const examSchedules = [
    { id: 1, course: 'CSC 301', title: 'Midterm Examination', date: '2026-08-01', time: '10:00 AM', location: 'Hall A' },
    { id: 2, course: 'MTH 305', title: 'Midterm Examination', date: '2026-08-03', time: '02:00 PM', location: 'Room 304' }
  ];

  const deadlineItems = useMemo(() => {
    const items = [];
    upcomingAssignments.forEach(a => {
      if (a.status !== 'Completed') {
        items.push({
          id: `assign-${a.id}`,
          title: a.title,
          course: a.course,
          dueDate: new Date(a.dueDate + 'T23:59:59'),
          type: 'Assignment' as const
        });
      }
    });
    examSchedules.forEach(e => {
      items.push({
        id: `exam-${e.id}`,
        title: e.title,
        course: e.course,
        // Combining date and time roughly
        dueDate: new Date(`${e.date} ${e.time}`),
        type: 'Exam' as const
      });
    });
    return items;
  }, []);

  useDeadlineNotifications(deadlineItems);


  const advisor = {
    name: "Dr. Sarah Jenkins",
    department: "Computer Science",
    email: "s.jenkins@smartglobal.edu",
    phone: "+1 (555) 123-4567",
    office: "Building A, Room 402",
    officeHours: "Mon & Wed, 2:00 PM - 4:00 PM"
  };

  return (
    <div className="space-y-6">
      <GradeNotifier />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100 dark:border-emerald-900/50 shadow-sm" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shadow-sm">
              {user?.name?.charAt(0) || 'S'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Student Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium print:hidden shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Schedule</span>
          </button>
          <button
            onClick={handleDownloadTranscript}
            disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors font-medium print:hidden shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? "Generating..." : "Download Transcript"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium print:hidden shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <AppointmentReminderSystem />

      <AcademicOverviewWidget />

      {/* Existing overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Registered Courses</h3>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{enrolledCourses.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Upcoming Deadlines</h3>
          <p className="text-3xl font-black text-amber-500 dark:text-amber-400">3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area - 2 Columns wide on lg */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentAlertsWidget />
          <AIStudyPlannerWidget />
          <CourseProgressWidget />
          
          {/* Enrolled Courses */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Enrolled Courses
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map((course, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">{course.code}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {course.credits} Credits
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{course.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 mb-3">
                    <User className="w-3 h-3" /> {course.instructor}
                  </p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-auto">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <div className="mt-1 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Course Progress</span>
                    <span className="font-bold">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Upcoming Assignments */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Upcoming Assignment Deadlines
            </h3>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{assignment.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{assignment.course}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      {assignment.dueDate}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                      {assignment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Schedules */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-purple-500" />
              Exam Schedules
            </h3>
            <div className="space-y-4">
              {examSchedules.map((exam) => (
                <div key={exam.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{exam.course}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {exam.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {exam.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exam.time}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                      {exam.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <GradebookWidget />

          
          <StudentMedicalHistory />
          
          <ClinicAppointmentWidget />
          
          <PrescriptionRefillWidget />
          
          <CourseEnrollmentWidget />

          <CampusSpacesWidget />
                    <SupabaseDocumentUploader 
            bucketName="student-documents"
            folderPath={`uploads/students/${user?.id || 'default'}`}
            title="Academic Transcripts & Identification"
            description="Securely submit your required academic transcripts and personal identification documents."
          />
          
          <DocumentUploader 
            path={`documents/assignments/student/${user?.id || 'default'}`} 
            title="My Assignments & Feedback" 
            description="Upload your assignments here and view feedback from lecturers." 
          />
        </div>

        {/* Sidebar Area - 1 Column wide on lg */}
        <div className="space-y-6">
          
          <StudentFeeWidget />
          <FeeBreakdownWidget />
          <EventsWidget />
          <RecentMaterialsWidget />

          {/* Academic Advisor Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-indigo-600" />
              Academic Advisor
            </h3>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold mb-3">
                {advisor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">{advisor.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{advisor.department}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <a href={`mailto:${advisor.email}`} className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate">
                  {advisor.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <a href={`tel:${advisor.phone}`} className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  {advisor.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <p className="font-medium">Office Hours</p>
                  <p className="text-xs text-slate-500">{advisor.officeHours}</p>
                </div>
              </div>
            </div>
          </div>
          
          <AcademicTimelineWidget />
        </div>
      </div>
      <div className="mt-6">
        <FacilityBookingSystem />
      </div>
      <div className="mt-6">
        <DigitalResourceLibrary />
      </div>
      <div className="mt-6">
        <StudentCalendar />
      </div>
      <div className="mt-6">
        <QuickActions />
      </div>
      <PerformanceOverview />

      {/* Hidden Print Area */}
      <div id="print-area" className="hidden print:block p-8 bg-white text-black min-h-screen">
        <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-black mb-2">Smart Global College of Technology</h1>
          <h2 className="text-xl font-bold text-slate-600">Official Student Transcript Summary</h2>
        </div>
        
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold text-slate-500">Student Name:</p>
            <p className="font-bold text-lg">{user?.name || 'Student'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-500">Program:</p>
            <p className="font-bold text-lg">Computer Science</p>
          </div>
          <div>
            <p className="font-bold text-slate-500">Current CGPA:</p>
            <p className="font-bold text-lg">{cgpa !== null ? cgpa.toFixed(2) : '-'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-500">Academic Session:</p>
            <p className="font-bold text-lg">2025/2026 - 1st Semester</p>
          </div>
        </div>

        <div className="overflow-x-auto"><table className="w-full text-left mb-8 border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="py-3 font-bold">Course Code</th>
              <th className="py-3 font-bold">Course Title</th>
              <th className="py-3 font-bold">Credits</th>
              <th className="py-3 font-bold">Grade</th>
              <th className="py-3 font-bold">Points</th>
            </tr>
          </thead>
          <tbody>
            {currentGrades.map((grade, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="py-3 font-bold">{grade.course}</td>
                <td className="py-3">{grade.title}</td>
                <td className="py-3">{enrolledCourses.find(c => c.code === grade.course)?.credits || 3}</td>
                <td className="py-3 font-bold text-emerald-600">{grade.grade}</td>
                <td className="py-3">{grade.points}</td>
              </tr>
            ))}
          </tbody>
        </table></div>

        <div className="text-center mb-8 border-b-2 border-slate-800 pb-4 mt-12">
          <h2 className="text-xl font-bold text-slate-600">Financial Summary</h2>
        </div>

        <div className="overflow-x-auto"><table className="w-full text-left mb-8 border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="py-3 font-bold">Fee Description</th>
              <th className="py-3 font-bold">Amount</th>
              <th className="py-3 font-bold">Status</th>
              <th className="py-3 font-bold">Date Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-3">Tuition Fee - 1st Semester</td>
              <td className="py-3">$4,500.00</td>
              <td className="py-3 font-bold text-emerald-600">Paid</td>
              <td className="py-3">2025-08-15</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-3">Library & Technology Fee</td>
              <td className="py-3">$350.00</td>
              <td className="py-3 font-bold text-emerald-600">Paid</td>
              <td className="py-3">2025-08-15</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-3">Hostel Accommodation</td>
              <td className="py-3">$1,200.00</td>
              <td className="py-3 font-bold text-amber-500">Pending</td>
              <td className="py-3">-</td>
            </tr>
          </tbody>
        </table></div>

        <div className="text-sm text-slate-500 text-center mt-12 pt-8 border-t border-slate-200">
          <p>This is a computer-generated summary and does not require a signature.</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
