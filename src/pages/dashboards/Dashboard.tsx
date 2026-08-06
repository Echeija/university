import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import ClinicDashboard from './clinic/ClinicDashboard';
import PharmacyDashboard from './pharmacy/PharmacyDashboard';
import LaboratoryDashboard from './laboratory/LaboratoryDashboard';
import StudentDashboard from './student/StudentDashboard';
import ApplicantDashboardHome from './applicant/ApplicantDashboardHome';
import LecturerDashboard from './lecturer/LecturerDashboard';
import RoleBasedAlerts from './RoleBasedAlerts';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const role = user.role;

  const renderDashboardContent = () => {
    switch (role) {
      case 'Administrator':
      case 'Admin':
      case 'Content Manager':
      case 'ICT Admin':
      case 'Portal':
        return <AdminDashboard />;

      case 'Clinic':
        return <ClinicDashboard />;
      case 'Pharmacy':
        return <PharmacyDashboard />;
      case 'Laboratory':
        return <LaboratoryDashboard />;
      case 'Student':
        return <StudentDashboard />;
      case 'Applicant':
        return <ApplicantDashboardHome />;
      case 'Lecturer':
        return <LecturerDashboard />;
      case 'Registrar':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Pending Applications</h3>
              <p className="text-3xl font-black text-amber-500">42</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Total Admitted</h3>
              <p className="text-3xl font-black text-emerald-600">850</p>
            </div>
          </div>
        );
      case 'Bursary':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Total Collection</h3>
              <p className="text-3xl font-black text-emerald-600">₦24.5m</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Pending Payments</h3>
              <p className="text-3xl font-black text-amber-500">24</p>
            </div>
          </div>
        );
      case 'HOD':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Department Courses</h3>
              <p className="text-3xl font-black text-emerald-600">45</p>
            </div>
          </div>
        );
      case 'Dean':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Total Departments</h3>
              <p className="text-3xl font-black text-emerald-600">5</p>
            </div>
          </div>
        );
      case 'Library':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Total Resources</h3>
              <p className="text-3xl font-black text-emerald-600">20,650</p>
            </div>
          </div>
        );
      default:
        return <div>Welcome to your dashboard.</div>;
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back, {user.name.split(' ')[0]}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here is what is happening with your account today.</p>
      </div>
      <RoleBasedAlerts role={role} />
      {renderDashboardContent()}
    </>
  );
}
