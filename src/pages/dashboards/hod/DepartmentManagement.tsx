import { Users, BookOpen, GraduationCap } from 'lucide-react';

export default function DepartmentManagement() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Department Management</h2>
        <p className="text-slate-500 mt-1">Manage departmental staff, courses, and student performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Academic Staff</h3>
          <p className="text-3xl font-black text-slate-900 mb-4">24</p>
          <button className="text-emerald-600 font-bold text-sm hover:underline">View Lecturers &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Total Courses</h3>
          <p className="text-3xl font-black text-slate-900 mb-4">45</p>
          <button className="text-blue-600 font-bold text-sm hover:underline">Manage Curriculum &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Registered Students</h3>
          <p className="text-3xl font-black text-slate-900 mb-4">850</p>
          <button className="text-purple-600 font-bold text-sm hover:underline">View Students &rarr;</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <p className="font-medium">Select an action above to manage your department.</p>
      </div>
    </div>
  );
}
