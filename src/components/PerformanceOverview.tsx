import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const gpaData = [
  { semester: 'Year 1 - Sem 1', gpa: 3.5, cgpa: 3.5 },
  { semester: 'Year 1 - Sem 2', gpa: 3.8, cgpa: 3.65 },
  { semester: 'Year 2 - Sem 1', gpa: 3.6, cgpa: 3.63 },
  { semester: 'Year 2 - Sem 2', gpa: 4.0, cgpa: 3.72 },
  { semester: 'Year 3 - Sem 1', gpa: 3.9, cgpa: 3.76 },
];

export default function PerformanceOverview() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mt-6">
      <div className="mb-6">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">Academic Performance Trend</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">GPA progression over the previous semesters.</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={gpaData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="semester" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              domain={[2.0, 4.0]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}
            />
            <Line 
              type="monotone" 
              dataKey="gpa" 
              name="Semester GPA" 
              stroke="#059669" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="cgpa" 
              name="Cumulative GPA" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
