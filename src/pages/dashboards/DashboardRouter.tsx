import AlertsNotifications from "./AlertsNotifications";
import LiveLecture from './LiveLecture';
import LecturerResultUpload from './lecturer/LecturerResultUpload';
import LecturerContinuousAssessment from './lecturer/LecturerContinuousAssessment';
import LecturerAssignments from './lecturer/LecturerAssignments';
import LecturerTeachingMaterials from './lecturer/LecturerTeachingMaterials';
import LecturerVideoUpload from './lecturer/LecturerVideoUpload';
import LecturerClassManagement from './lecturer/LecturerClassManagement';
import LecturerAnnouncements from './lecturer/LecturerAnnouncements';
import LecturerResearch from './lecturer/LecturerResearch';
import LecturerPerformanceAnalytics from './lecturer/LecturerPerformanceAnalytics';

import AcademicDashboard from "./academic/AcademicDashboard";
import Dashboard from "./Dashboard";
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseTheme } from '../../hooks/useSupabaseTheme';
import { useTheme } from '../../contexts/ThemeContext';
import { BookText, Bell, Menu, X, FolderOpen, Megaphone, BarChart3, LogOut, Microscope, Layout, User, Briefcase, Pill, Activity, ScanLine, Building, ClipboardList, CheckSquare, Calendar, Home, Users, Settings, BookOpen, GraduationCap, CreditCard, LayoutTemplate, FileSpreadsheet, FileText, Network, Book, ShieldAlert, Moon, Sun, MonitorPlay, Video, Star, MessageSquare, PenSquare, Eye, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationsMenu from '../../components/NotificationsMenu';
import PortalFooter from "../../components/PortalFooter";
import GlobalSearch from '../../components/GlobalSearch';

import CourseRegistration from './student/CourseRegistration';
import AcademicResults from './student/AcademicResults';
import Payments from './student/Payments';
import FeeReceiptModule from './student/FeeReceiptModule';
import CourseEvaluations from "./student/CourseEvaluations";

import ResourceLibrary from './student/ResourceLibrary';
import LibraryBooking from './student/LibraryBooking';
import ResearchLabBooking from './student/ResearchLabBooking';
import MentorshipMatching from './student/MentorshipMatching';
import TranscriptRequest from './student/TranscriptRequest';
import DegreeAudit from './student/DegreeAudit';
import StudentDashboard from './student/StudentDashboard';
import UserProfileSettings from './UserProfileSettings';
import SessionManager from '../../components/SessionManager';
import StudentProfile from './student/StudentProfile';
import JobsPortal from './student/JobsPortal';
import TranscriptRequests from './student/TranscriptRequests';
import PortfolioBuilder from './student/PortfolioBuilder';

import ClinicDashboard from './clinic/ClinicDashboard';
import PharmacyInventory from './clinic/PharmacyInventory';
import StudentClinic from './student/StudentClinic';
import StudentClinicForm from './student/StudentClinicForm';
import PharmacyDashboard from './pharmacy/PharmacyDashboard';
import LaboratoryDashboard from './laboratory/LaboratoryDashboard';


import VirtualClasses from './lms/VirtualClasses';

import UserManagement from './admin/UserManagement';
import SystemSettings from './admin/SystemSettings';
import PaymentSettings from './admin/PaymentSettings';
import AdminAuditLogs from './admin/AdminAuditLogs';
import EvaluationReports from './admin/EvaluationReports';
import MessagesPortal from './student/MessagesPortal';
import AdminDashboard from './admin/AdminDashboard';
import AdminCMSDashboard from './admin/AdminCMSDashboard';
import CourseManagement from './admin/CourseManagement';
import AssistantWidget from './AssistantWidget';
import FloatingQuickActions from '../../components/FloatingQuickActions';

import LecturerDashboard from './lecturer/LecturerDashboard';
import AssignedCourses from './lecturer/AssignedCourses';
import Grading from './lecturer/Grading';
import AttendanceTracking from './lecturer/AttendanceTracking';
import StudentAttendance from './student/StudentAttendance';

import DocumentRepository from './DocumentRepository';
import DigitalStudentID from './student/DigitalStudentID';
import ApplicationForm from './applicant/ApplicationForm';

import ManageHostels from './admin/ManageHostels';
import HostelApplications from './admin/HostelApplications';
import HostelApplication from './student/HostelApplication';


import LMSPortal from './lms/LMSPortal';
import AdmissionsInquiries from './registrar/AdmissionsInquiries';
import AdmissionManagement from './registrar/AdmissionManagement';
import PaymentManagement from './bursary/PaymentManagement';
import DepartmentManagement from './hod/DepartmentManagement';
import ManageDepartments from './admin/ManageDepartments';
import ManageFaculties from './admin/ManageFaculties';
import FacultyManagement from './dean/FacultyManagement';
import LibraryManagement from './library/LibraryManagement';
import DigitalLibrary from './DigitalLibrary';
import NewsAndEvents from './NewsAndEvents';
import PerformanceOverview from '../../components/PerformanceOverview';

import QuickActions from '../../components/QuickActions';
import GradeNotifier from '../../components/GradeNotifier';

import CourseEnrollmentWidget from '../../components/CourseEnrollmentWidget';

import ApplicantDashboardHome from './applicant/ApplicantDashboardHome';
import Complaints from './student/Complaints';
import SemesterRegistration from './student/SemesterRegistration';

import RealtimeNotifications from '../../components/RealtimeNotifications';

export default function DashboardRouter() {
  const { user, logout } = useAuth();
  useSupabaseTheme();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();
            
          if (data && !error) {
            setUserProfile(data);
          } else {
            setUserProfile(user);
          }
        } catch (e) {
          setUserProfile(user);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };
    fetchProfile();
  }, [user]);
  const { theme, toggleTheme, highContrast, toggleHighContrast, textScale, setTextScale } = useTheme();
  const role = userProfile?.role || user?.role || '';
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingProfile) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  }


  const getPageTitle = () => {
    if (location.pathname.includes('/courses')) return 'Course Registration';
    if (location.pathname.includes('/manage-courses')) return 'Course Management';
    if (location.pathname.includes('/results')) return 'Academic Results';
    if (location.pathname.includes("/evaluations")) return "Course Evaluations";

    if (location.pathname.includes('/payments')) return 'Payments';
    if (location.pathname.includes('/users')) return 'User Management';
    if (location.pathname.includes("/payment-settings")) return "Payment Settings";
    if (location.pathname.includes('/settings')) return 'System Settings';
    if (location.pathname.includes('/assigned-courses')) return 'Assigned Courses';
    if (location.pathname.includes('/grading')) return 'Grading';
    if (location.pathname.includes('/application')) return 'Admission Form';
    if (location.pathname.includes('/admissions')) return 'Admissions';
    if (location.pathname.includes('/bursary')) return 'Payment Ledger';
    if (location.pathname.includes('/department')) return 'Department';
    if (location.pathname.includes('/faculty')) return 'Faculty';
    if (location.pathname.includes('/digital-library')) return 'Digital Resource Library';
    if (location.pathname.includes('/news-events')) return 'News & Events';
    if (location.pathname.includes('/resources')) return 'Resource Library';
    if (location.pathname.includes('/library-booking')) return 'Library Booking';
    if (location.pathname.includes('/lab-booking')) return 'Lab Booking';
    if (location.pathname.includes('/student-profile')) return 'My Profile';
    if (location.pathname.includes('/mentorship')) return 'Mentorship Matching';
    if (location.pathname.includes('/transcripts')) return 'Transcript Request';
    if (location.pathname.includes('/library')) return 'Library';
    return 'Overview';
  };

  const isActive = (path: string) => location.pathname.startsWith(path) && (path !== '/dashboard' || location.pathname === '/dashboard');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex h-screen print:h-auto overflow-hidden print:overflow-visible transition-colors">
      <SessionManager />
      <RealtimeNotifications />
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-emerald-900 print:hidden dark:bg-emerald-950 text-white flex flex-col shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" alt="Smart Global Logo" className="w-10 h-10 object-contain bg-white rounded-md p-1" />
            <span className="font-extrabold text-lg tracking-tight">SGCT Portal</span>
          </Link>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-white/10">
          <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">Logged in as</p>
          <p className="font-medium truncate">{user.name}</p>
          <span className="inline-block px-2 py-1 mt-2 bg-purple-600/30 text-purple-300 text-[10px] font-bold rounded uppercase tracking-wider border border-purple-500/20">
            {user.role}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">


          <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Home className="w-5 h-5 opacity-75" />
            Dashboard
          </Link>
          <Link to="/dashboard/clinic" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/clinic') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Activity className="w-5 h-5 opacity-75" />
            Clinic
          </Link>

          <Link to="/dashboard/digital-library" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/digital-library') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Book className="w-5 h-5 opacity-75" />
            Digital Resource Library
          </Link>
          <Link to="/dashboard/news-events" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/news-events') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Calendar className="w-5 h-5 opacity-75" />
            News & Events
          </Link>
          <Link to="/dashboard/alerts" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/alerts') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Bell className="w-5 h-5 opacity-75" />
            Alerts & Notifications
          </Link>
          
          
          {(role === 'Administrator' || role === 'Portal') && (
            <>
              <Link to="/dashboard/manage-hostels" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/manage-hostels') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Building className="w-5 h-5 opacity-75" />
                Manage Hostels
              </Link>
              <Link to="/dashboard/hostel-applications" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/hostel-applications') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <ClipboardList className="w-5 h-5 opacity-75" />
                Hostel Applications
              </Link>
            </>
          )}

          {(role === 'Administrator' || role === 'ICT Admin') && (
            <>
              <Link to="/dashboard/users" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/users') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Users className="w-5 h-5 opacity-75" />
                User Management
              </Link>
              <Link to="/dashboard/payment-settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive("/dashboard/payment-settings") ? "bg-emerald-800 text-white" : "text-emerald-100 hover:bg-emerald-800/50"}`}>
                <CreditCard className="w-5 h-5 opacity-75" />
                Payment Settings
              </Link>


              <Link to="/dashboard/portfolio" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/portfolio') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Layout className="w-5 h-5 opacity-75" />
                Portfolio
              </Link>
              <Link to="/dashboard/transcripts" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/transcripts') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <FileText className="w-5 h-5 opacity-75" />
                Transcripts
              </Link>

              <Link to="/dashboard/student-profile" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/student-profile') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <User className="w-5 h-5 opacity-75" />
                My Profile
              </Link>

              <Link to="/dashboard/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/settings') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Settings className="w-5 h-5 opacity-75" />
                System Settings
              </Link>
              <Link to="/dashboard/audit" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/audit') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <ShieldAlert className="w-5 h-5 opacity-75" />
                System Audit Logs
              </Link>
              
              <Link to="/lms" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-emerald-100 hover:bg-emerald-800/50`}>
                <MonitorPlay className="w-5 h-5 opacity-75" />
                Manage LMS
              </Link>
              <Link to="/dashboard/virtual-classes" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/virtual-classes') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Video className="w-5 h-5 opacity-75" />
                Virtual Classes
              </Link>
              
              <Link to="/dashboard/evaluation-reports" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/evaluation-reports') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Star className="w-5 h-5 opacity-75" />
                Evaluation Reports
              </Link>
              <Link to="/dashboard/manage-courses" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/manage-courses') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Course Management
              </Link>

            </>
          )}

          {role === 'Student' && (
            <>
                            <Link to="/dashboard/digital-id" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/digital-id') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <ScanLine className="w-5 h-5 opacity-75" />
                Digital Student ID
              </Link>
              <Link to="/dashboard/live-lecture" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/live-lecture') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <MonitorPlay className="w-5 h-5 opacity-75" />
                Live Lecture
              </Link>

              <Link to="/dashboard/hostel" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/hostel') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Home className="w-5 h-5 opacity-75" />
                Hostel Apply
              </Link>
              <Link to="/dashboard/my-attendance" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/my-attendance') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <CheckSquare className="w-5 h-5 opacity-75" />
                My Attendance
              </Link>


              <Link to="/dashboard/jobs" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/jobs') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Briefcase className="w-5 h-5 opacity-75" />
                Jobs & Internships
              </Link>
              <Link to="/dashboard/degree-audit" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/degree-audit') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <GraduationCap className="w-5 h-5 opacity-75" />
                Degree Audit
              </Link>

              <Link to="/dashboard/messages" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/messages') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <MessageSquare className="w-5 h-5 opacity-75" />
                Messages
              </Link>
              <Link to="/dashboard/lms" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/lms') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <MonitorPlay className="w-5 h-5 opacity-75" />
                Learning Portal
              </Link>
              <Link to="/dashboard/calendar" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/calendar') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Calendar className="w-5 h-5 opacity-75" />
                Timetable & Calendar
              </Link>
          <Link to="/dashboard/alerts" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/alerts') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Bell className="w-5 h-5 opacity-75" />
            Alerts & Notifications
          </Link>
              <Link to="/dashboard/virtual-classes" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/virtual-classes') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Video className="w-5 h-5 opacity-75" />
                Virtual Classes
              </Link>
              <Link to="/dashboard/courses" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/courses') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Course Registration
              </Link>
              <Link to="/dashboard/semester-registration" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/semester-registration') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Book className="w-5 h-5 opacity-75" />
                Semester Registration
              </Link>
              <Link to="/dashboard/results" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/results') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <GraduationCap className="w-5 h-5 opacity-75" />
                Academic Results
              </Link>

                            <Link to="/dashboard/library-booking" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/library-booking') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Book className="w-5 h-5 opacity-75" />
                Library Booking
              </Link>
              <Link to="/dashboard/lab-booking" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/lab-booking') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Microscope className="w-5 h-5 opacity-75" />
                Lab Booking
              </Link>
              <Link to="/dashboard/resources" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/resources') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Book className="w-5 h-5 opacity-75" />
                Resource Library
              </Link>
              <Link to="/dashboard/mentorship" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/mentorship') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Users className="w-5 h-5 opacity-75" />
                Mentorship Matching
              </Link>
              <Link to="/dashboard/payments" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/payments') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <CreditCard className="w-5 h-5 opacity-75" />
                Payments
              </Link>
              <Link to="/dashboard/fee-receipts" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/fee-receipts') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <FileText className="w-5 h-5 opacity-75" />
                Fee Receipts
              </Link>
              <Link to="/dashboard/evaluations" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive("/dashboard/evaluations") ? "bg-emerald-800 text-white" : "text-emerald-100 hover:bg-emerald-800/50"}`}>
                <Star className="w-5 h-5 opacity-75" />
                Course Evaluations
              </Link>
              <Link to="/dashboard/transcripts" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/transcripts') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <FileText className="w-5 h-5 opacity-75" />
                Transcripts
              </Link>
              <Link to="/dashboard/complaints" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/complaints') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <MessageSquare className="w-5 h-5 opacity-75" />
                Complaints
              </Link>
            </>
          )}

          {role === 'Lecturer' && (
            <>
              <Link to="/dashboard/attendance" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/attendance') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <CheckSquare className="w-5 h-5 opacity-75" />
                Attendance Tracking
              </Link>

              <Link to="/dashboard/documents" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/documents') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <FileText className="w-5 h-5 opacity-75" />
                Document Repository
              </Link>

              <Link to="/dashboard/messages" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/messages') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <MessageSquare className="w-5 h-5 opacity-75" />
                Messages
              </Link>
              <Link to="/dashboard/lms" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/lms') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <MonitorPlay className="w-5 h-5 opacity-75" />
                Learning Portal
              </Link>
              <Link to="/dashboard/calendar" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/calendar') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Calendar className="w-5 h-5 opacity-75" />
                Calendar
              </Link>
          <Link to="/dashboard/alerts" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/alerts') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Bell className="w-5 h-5 opacity-75" />
            Alerts & Notifications
          </Link>
              <Link to="/dashboard/virtual-classes" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/virtual-classes') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Video className="w-5 h-5 opacity-75" />
                Virtual Classes
              </Link>
              
              <Link to="/dashboard/evaluation-reports" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/evaluation-reports') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Star className="w-5 h-5 opacity-75" />
                Evaluation Reports
              </Link>
              <Link to="/dashboard/assigned-courses" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/assigned-courses') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Assigned Courses
              </Link>

              {/* Grading will be accessed via courses, but can have a global link or not */}
            </>
          )}
          {role === 'Applicant' && (
            <>
              <Link to="/dashboard/application" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/application') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <FileText className="w-5 h-5 opacity-75" />
                Admission Form
              </Link>
            </>
          )}

          {(role === 'Registrar' || role === 'Administrator' || role === 'Admission Officer') && (
            <>
              
              <Link to="/dashboard/admissions" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/admissions') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Users className="w-5 h-5 opacity-75" />
                Admissions
              </Link>
              <Link to="/dashboard/inquiries" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/inquiries') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <MessageSquare className="w-5 h-5 opacity-75" />
                Admissions Inquiries
              </Link>
            </>
          )}

          {(role === 'Bursary' || role === 'Administrator') && (
            <>
              <Link to="/dashboard/bursary" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/bursary') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <CreditCard className="w-5 h-5 opacity-75" />
                Payment Ledger
              </Link>
            </>
          )}

          {(role === 'HOD' || role === 'Administrator') && (
            <>
              <Link to="/dashboard/department" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/department') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Users className="w-5 h-5 opacity-75" />
                Department
              </Link>
            </>
          )}

          {(role === 'Academic Officer' || role === 'Administrator') && (
            <>
              <Link to="/dashboard/academic" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/academic') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Academic
              </Link>
            </>
          )}
          {(role === 'Dean' || role === 'Administrator') && (
            <>
              <Link to="/dashboard/faculty" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/faculty') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Network className="w-5 h-5 opacity-75" />
                Faculty
              </Link>
            </>
          )}

                    
          {(role === 'Clinic' || role === 'Administrator') && (
            <>
              <Link to="/dashboard/manage-clinic" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/manage-clinic') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Activity className="w-5 h-5 opacity-75" />
                Manage Clinic
              </Link>
            </>
          )}
          {(role === 'Laboratory' || role === 'Administrator') && (
            <>
              <Link to="/dashboard/manage-lab" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/manage-lab') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Microscope className="w-5 h-5 opacity-75" />
                Laboratory
              </Link>
            </>
          )}
          {(role === 'Pharmacy' || role === 'Administrator') && (
            <>
              <Link to="/dashboard/pharmacy" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/pharmacy') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Pill className="w-5 h-5 opacity-75" />
                Pharmacy
              </Link>
            </>
          )}
          {(role === 'Library' || role === 'Administrator') && (
            <>
              <Link to="/dashboard/library" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/library') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
                <Book className="w-5 h-5 opacity-75" />
                Library
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full hover:bg-red-900/50 text-red-200 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-75" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen print:h-auto overflow-y-auto print:overflow-visible bg-slate-50 dark:bg-slate-900 print:bg-white">
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 sticky top-0 z-10 transition-colors print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-emerald-600">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs md:max-w-none hidden md:block">{getPageTitle()}</h1>
          </div>
          <div className="flex-1 max-w-md md:ml-8 md:mr-auto hidden sm:block">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-4">
            <div className="sm:hidden w-8">
              <GlobalSearch />
            </div>
            <button onClick={toggleHighContrast} className={`p-2 rounded-full transition-colors relative ${highContrast ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`} aria-label="Toggle high contrast">
              <Eye className="w-5 h-5" />
            </button>
            <button onClick={() => setTextScale(textScale === 'normal' ? 'large' : textScale === 'large' ? 'extra-large' : 'normal')} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors relative" aria-label="Toggle text scale">
              <Type className="w-5 h-5" />
              {textScale !== 'normal' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 text-[9px] font-bold text-white flex items-center justify-center">
                  {textScale === 'large' ? 'L' : 'XL'}
                </span>
              )}
            </button>
            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors relative" aria-label="Toggle dark mode">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <NotificationsMenu />
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <div className="flex items-center gap-3">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100 dark:border-emerald-900/50" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
              </div>
            </div>
          </div>
        </header>
        <div className="p-8 pb-20">
          <AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full"><Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lms" element={<LMSPortal />} />
            <Route path="/virtual-classes" element={<VirtualClasses />} />
            <Route path="/evaluations" element={<CourseEvaluations />} />
            <Route path="/evaluation-reports" element={<EvaluationReports />} />

            <Route path="/courses" element={<CourseRegistration />} />
            <Route path="/results" element={<AcademicResults />} />
            <Route path="/resources" element={<ResourceLibrary />} />
            <Route path="/library-booking" element={<LibraryBooking />} />
            <Route path="/lab-booking" element={<ResearchLabBooking />} />
            <Route path="/mentorship" element={<MentorshipMatching />} />

            <Route path="/clinic" element={<StudentClinic />} />
            <Route path="/forms/:formId" element={<StudentClinicForm />} />
            <Route path="/manage-clinic" element={<ClinicDashboard />} />
            <Route path="/manage-lab" element={<LaboratoryDashboard />} />
            <Route path="/pharmacy" element={<PharmacyDashboard />} />

            <Route path="/transcripts" element={<TranscriptRequest />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/fee-receipts" element={<FeeReceiptModule />} />
            
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={role === 'Admin' ? <SystemSettings /> : <UserProfileSettings />} />
            <Route path="/student-profile" element={<StudentProfile />} />
            <Route path="/jobs" element={<JobsPortal />} />
            <Route path="/transcripts" element={<TranscriptRequests />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/semester-registration" element={<SemesterRegistration />} />
            <Route path="/portfolio" element={<PortfolioBuilder />} />
            <Route path="/payment-settings" element={<PaymentSettings />} />
            <Route path="/audit" element={<AdminAuditLogs />} />
            <Route path="/cms" element={<AdminCMSDashboard />} />
            <Route path="/manage-courses" element={<CourseManagement />} />

            <Route path="/assigned-courses" element={<AssignedCourses />} />
            <Route path="/grading/:courseId" element={<Grading />} />
            <Route path="/attendance" element={<AttendanceTracking />} />
            <Route path="/my-attendance" element={<StudentAttendance />} />

            <Route path="/application" element={<ApplicationForm />} />
            
            <Route path="/admissions" element={<AdmissionManagement />} />
            <Route path="/inquiries" element={<AdmissionsInquiries />} />
            <Route path="/bursary" element={<PaymentManagement />} />
            <Route path="/department" element={role === 'Administrator' ? <ManageDepartments /> : <DepartmentManagement />} />
            <Route path="/faculty" element={role === 'Administrator' ? <ManageFaculties /> : <FacultyManagement />} />
            <Route path="/library" element={<LibraryManagement />} />
            
            
            
            <Route path="/digital-library" element={<DigitalLibrary />} />
            <Route path="/news-events" element={<NewsAndEvents />} />
            <Route path="/degree-audit" element={<DegreeAudit />} />
            
            <Route path="/digital-id" element={<DigitalStudentID />} />
            <Route path="/hostel" element={<HostelApplication />} />
            <Route path="/manage-hostels" element={<ManageHostels />} />
            <Route path="/hostel-applications" element={<HostelApplications />} />

            <Route path="/documents" element={<DocumentRepository />} />
            <Route path="/academic" element={<AcademicDashboard />} />
            <Route path="/messages" element={<MessagesPortal />} />
            <Route path="/alerts" element={<AlertsNotifications />} />
                        <Route path="/live-lecture" element={<LiveLecture />} />
            <Route path="/result-upload" element={<LecturerResultUpload />} />
            <Route path="/continuous-assessment" element={<LecturerContinuousAssessment />} />
            <Route path="/assignments" element={<LecturerAssignments />} />
            <Route path="/teaching-materials" element={<LecturerTeachingMaterials />} />
            <Route path="/video-upload" element={<LecturerVideoUpload />} />
            <Route path="/class-management" element={<LecturerClassManagement />} />
            <Route path="/announcements" element={<LecturerAnnouncements />} />
            <Route path="/research" element={<LecturerResearch />} />
            <Route path="/performance-analytics" element={<LecturerPerformanceAnalytics />} />
          </Routes></motion.div></AnimatePresence>
        </div>
        <PortalFooter />
      </main>
      <FloatingQuickActions />
      <AssistantWidget />
    </div>
  );
}
