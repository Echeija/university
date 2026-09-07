import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import RootLayout from '../layouts/RootLayout';
import HomePage from '../pages/HomePage';
import PortalsPage from '../pages/PortalsPage';
import AboutPage from '../pages/AboutPage';
import ManagementStaffPage from '../pages/ManagementStaffPage';
import AdministrativeStaffPage from '../pages/AdministrativeStaffPage';
import AdmissionsPage from '../pages/AdmissionsPage';
import FacultiesPage from '../pages/FacultiesPage';
import CourseCatalogPage from '../pages/CourseCatalogPage';
import ResearchPage from '../pages/ResearchPage';
import GalleryPage from '../pages/GalleryPage';
import ContactPage from '../pages/ContactPage';
import NewsPage from '../pages/NewsPage';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ApplicantRegisterPage from '../pages/auth/ApplicantRegisterPage';
import DashboardRouter from '../pages/dashboards/DashboardRouter';
import LmsLayout from '../pages/lms/LmsLayout';
import LmsDashboard from '../pages/lms/LmsDashboard';
import LmsCourses from '../pages/lms/LmsCourses';
import LmsLiveClass from '../pages/lms/LmsLiveClass';
import LmsAssignments from '../pages/lms/LmsAssignments';
import LmsAnalytics from '../pages/lms/LmsAnalytics';
import LmsCalendar from '../pages/lms/LmsCalendar';
import LmsQuizBuilder from '../pages/lms/LmsQuizBuilder';
import LmsQuestionBank from '../pages/lms/LmsQuestionBank';
import ProtectedRoute from './ProtectedRoute';
import VerifyTranscript from '../pages/VerifyTranscript';

export default function AnimatedRoutes() {
  const location = useLocation();
  const topLevelPath = location.pathname.split('/')[1] || 'home';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={topLevelPath}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-grow flex flex-col w-full min-h-screen"
      >
        <Routes location={location}>
          {/* Public Routes with Website Layout */}
          <Route path="/verify-transcript/:code" element={<VerifyTranscript />} />
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="management-staff" element={<ManagementStaffPage />} />
            <Route path="administrative-staff" element={<AdministrativeStaffPage />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="faculties" element={<FacultiesPage />} />
            <Route path="courses" element={<CourseCatalogPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="portals" element={<PortalsPage />} />
          </Route>
          {/* Auth Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register-applicant" element={<ApplicantRegisterPage />} />
          
          {/* LMS Routes */}
          <Route path="/lms" element={<LmsLayout />}>
            <Route index element={<LmsDashboard />} />
            <Route path="courses" element={<LmsCourses />} />
            <Route path="live" element={<LmsLiveClass />} />
            <Route path="assignments" element={<LmsAssignments />} />
            <Route path="analytics" element={<LmsAnalytics />} />
            <Route path="calendar" element={<LmsCalendar />} />
            <Route path="quiz-builder" element={<LmsQuizBuilder />} />
            <Route path="question-bank" element={<LmsQuestionBank />} />
          </Route>
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<DashboardRouter />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
