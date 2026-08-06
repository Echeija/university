import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { semester: 'Year 1 - Sem 1', gpa: 3.5, cgpa: 3.5 },
  { semester: 'Year 1 - Sem 2', gpa: 3.7, cgpa: 3.6 },
  { semester: 'Year 2 - Sem 1', gpa: 3.6, cgpa: 3.6 },
  { semester: 'Year 2 - Sem 2', gpa: 3.9, cgpa: 3.67 },
  { semester: 'Year 3 - Sem 1', gpa: 4.0, cgpa: 3.74 },
  { semester: 'Year 3 - Sem 2', gpa: 3.8, cgpa: 3.75 },
  { semester: 'Year 4 - Sem 1', gpa: 3.9, cgpa: 3.77 },
];

export default function PerformanceTrendChart() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 w-full">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Academic Performance Trend</h3>
      </div>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="semester" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              domain={[0, 4]} 
              ticks={[0, 1, 2, 3, 4]}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="gpa" 
              name="Semester GPA" 
              stroke="#0ea5e9" 
              strokeWidth={3}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="cgpa" 
              name="Cumulative GPA" 
              stroke="#10b981" 
              strokeWidth={3}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
