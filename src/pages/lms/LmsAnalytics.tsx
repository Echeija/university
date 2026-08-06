import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LmsAnalytics() {
  const data = [
    { name: 'Week 1', attendance: 100, score: 85 },
    { name: 'Week 2', attendance: 90, score: 92 },
    { name: 'Week 3', attendance: 100, score: 78 },
    { name: 'Week 4', attendance: 80, score: 95 },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Student Analytics</h1>
        <p className="text-slate-600 mt-1">Track your progress and performance across modules.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Average Attendance</p>
          <p className="text-4xl font-black text-emerald-600">92%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Overall GPA</p>
          <p className="text-4xl font-black text-indigo-600">3.8</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center md:col-span-2 lg:col-span-1">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Certificates Earned</p>
          <p className="text-4xl font-black text-purple-600">4</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Score (%)" />
              <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} name="Attendance (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
