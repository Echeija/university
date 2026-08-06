import { Network, FileCheck, Target } from 'lucide-react';

export default function FacultyManagement() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Management</h2>
        <p className="text-slate-500 mt-1">Oversee departments, approve results, and track faculty performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Network className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Departments</h3>
          <p className="text-3xl font-black text-slate-900 mb-4">5</p>
          <button className="text-emerald-600 font-bold text-sm hover:underline">View Departments &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Results Approval</h3>
          <p className="text-3xl font-black text-slate-900 mb-4">12</p>
          <button className="text-purple-600 font-bold text-sm hover:underline">Review Pending &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Faculty KPIs</h3>
          <p className="text-3xl font-black text-slate-900 mb-4">98%</p>
          <button className="text-blue-600 font-bold text-sm hover:underline">View Metrics &rarr;</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <p className="font-medium">Faculty overview dashboard.</p>
      </div>
    </div>
  );
}
