import { useState, useEffect } from 'react';
import { EnrollmentTrendsChart, GraduationRatesRecharts, AcademicPerformanceChart } from '../../../components/charts/AdminAnalyticsRecharts';

import FacultyWorkloadChartD3 from '../../../components/charts/FacultyWorkloadChartD3';
import { PeakAppointmentHoursChart, VisitReasonsChart, ClinicLoadHeatmap } from '../../../components/charts/ClinicUsageCharts';
import ClinicSurveyResultsWidget from '../../../components/ClinicSurveyResultsWidget';
import { Users, CreditCard, Activity, CheckCircle2, XCircle, Play, Square, Settings, Video, Download, Stethoscope, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import { StatCardSkeleton, ChartSkeleton, ActivityListSkeleton } from '../../../components/ui/DashboardSkeletons';
import { Skeleton } from '../../../components/ui/Skeleton';



export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  const { notify } = useNotification();
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [isSessionOpen, setIsSessionOpen] = useState(true);
  const [isCourseRegOpen, setIsCourseRegOpen] = useState(true);

  const handleToggleApplication = () => {
    setIsApplicationOpen(!isApplicationOpen);
    notify({
      title: !isApplicationOpen ? 'Application Portal Opened' : 'Application Portal Closed',
      message: `The application portal is now ${!isApplicationOpen ? 'open for new applicants' : 'closed'}.`,
      type: 'success'
    });
  };

  const handleToggleSession = () => {
    setIsSessionOpen(!isSessionOpen);
    notify({
      title: !isSessionOpen ? 'Session Opened' : 'Session Closed',
      message: `The current academic session is now ${!isSessionOpen ? 'active' : 'inactive'}.`,
      type: 'success'
    });
  };

  const handleToggleCourseReg = () => {
    setIsCourseRegOpen(!isCourseRegOpen);
    notify({
      title: !isCourseRegOpen ? 'Course Registration Opened' : 'Course Registration Closed',
      message: `Course registration is now ${!isCourseRegOpen ? 'open for students' : 'closed'}.`,
      type: 'success'
    });
  };

  useEffect(() => {
    // Simulate data fetching delay
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

    const enrollmentStatsD3 = [
    { month: 'Jan', enrollments: 65 },
    { month: 'Feb', enrollments: 59 },
    { month: 'Mar', enrollments: 80 },
    { month: 'Apr', enrollments: 81 },
    { month: 'May', enrollments: 56 },
    { month: 'Jun', enrollments: 120 }
  ];

  const graduationRatesD3 = [
    { year: '2020', rate: 82 },
    { year: '2021', rate: 85 },
    { year: '2022', rate: 88 },
    { year: '2023', rate: 87 },
    { year: '2024', rate: 91 },
    { year: '2025', rate: 93 },
  ];

  const facultyWorkloadD3 = [
    { category: 'Undergraduate', value: 45 },
    { category: 'Postgraduate', value: 20 },
    { category: 'Research', value: 25 },
    { category: 'Admin', value: 10 },
  ];

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Enrollment Trends\n";
    csvContent += "Month,Enrollments\n";
    enrollmentStatsD3.forEach(row => {
      csvContent += `${row.month},${row.enrollments}\n`;
    });
    csvContent += "\n";

    csvContent += "Graduation Rates (%)\n";
    csvContent += "Year,Rate\n";
    graduationRatesD3.forEach(row => {
      csvContent += `${row.year},${row.rate}\n`;
    });
    csvContent += "\n";

    csvContent += "Faculty Workload Distribution\n";
    csvContent += "Category,Value\n";
    facultyWorkloadD3.forEach(row => {
      csvContent += `${row.category},${row.value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify({
      title: 'Report Exported',
      message: 'Analytical reports have been successfully exported as CSV.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>
      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-1">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="flex justify-center mt-4">
                <Skeleton className="w-48 h-48 rounded-full" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <ActivityListSkeleton />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-1">Total Active Students</h3>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">1,650</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-1">Session Revenue</h3>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">₦16.1M</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-1">System Health</h3>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">Optimal</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              Quick Controls
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Application Portal</span>
                  {isApplicationOpen ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Open
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      <XCircle className="w-3 h-3" /> Closed
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleToggleApplication}
                  className={`w-full px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isApplicationOpen 
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40' 
                      : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  {isApplicationOpen ? (
                    <><Square className="w-4 h-4" /> Close Portal</>
                  ) : (
                    <><Play className="w-4 h-4" /> Open Portal</>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Academic Session</span>
                  {isSessionOpen ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      <XCircle className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleToggleSession}
                  className={`w-full px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isSessionOpen 
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40' 
                      : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  {isSessionOpen ? (
                    <><Square className="w-4 h-4" /> Close Session</>
                  ) : (
                    <><Play className="w-4 h-4" /> Open Session</>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Course Registration</span>
                  {isCourseRegOpen ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Open
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      <XCircle className="w-3 h-3" /> Closed
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleToggleCourseReg}
                  className={`w-full px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isCourseRegOpen 
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40' 
                      : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  {isCourseRegOpen ? (
                    <><Square className="w-4 h-4" /> Close Registration</>
                  ) : (
                    <><Play className="w-4 h-4" /> Open Registration</>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Clinic Services</span>
                </div>
                <Link
                  to="/dashboard/manage-clinic"
                  className="w-full px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  Manage Clinic
                </Link>
              </div>
              <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Website CMS</span>
                </div>
                <Link
                  to="/dashboard/cms"
                  className="w-full px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  Manage Content
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Cross-Departmental Enrollment Trends</h3>
              <div className="h-72">
                <EnrollmentTrendsChart />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Graduation Rates by Faculty</h3>
              <div className="h-72">
                <GraduationRatesRecharts />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Clinic Usage: Peak Appointment Hours</h3>
              <div className="h-72">
                <PeakAppointmentHoursChart />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Clinic Usage: Frequent Reasons for Visits</h3>
              <div className="h-72">
                <VisitReasonsChart />
              </div>
            </div>
          </div>
          
          
          <div className="mt-6 grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Academic Performance Averages by Faculty</h3>
              <div className="h-80">
                <AcademicPerformanceChart />
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">

              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Clinic Load Heatmap</h3>
              <p className="text-sm text-slate-500 mb-4">Visualizes clinic demand across days and weeks to optimize staffing and resource allocation.</p>
              <div className="h-80">
                <ClinicLoadHeatmap />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <ClinicSurveyResultsWidget />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Faculty Workload Dist.</h3>
              <div className="h-64 flex justify-center">
                <FacultyWorkloadChartD3 data={facultyWorkloadD3} />
              </div>
            </div>
            

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  Virtual Classes Status
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xl font-black text-purple-700 dark:text-purple-400">3</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Active Sessions</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Currently live</p>
                  </div>
                </div>
              </div>
              <Link 
                to="/dashboard/virtual-classes" 
                className="w-full text-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg font-bold text-sm transition-colors mt-2 block"
              >
                Manage Virtual Classes
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Recent System Activity</h3>
              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-4 py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-50 dark:bg-emerald-900/300"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">New student enrollment - Computer Science</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-blue-50 dark:bg-blue-900/300"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment received - Reference: PYM-2026-X81</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Course registration completed by 45 students</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
