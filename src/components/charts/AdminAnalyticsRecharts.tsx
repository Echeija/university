import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const enrollmentData = [
  { month: 'Jan', 'Engineering': 400, 'Science': 240, 'Arts': 240, 'Business': 300 },
  { month: 'Feb', 'Engineering': 300, 'Science': 139, 'Arts': 221, 'Business': 250 },
  { month: 'Mar', 'Engineering': 200, 'Science': 980, 'Arts': 229, 'Business': 400 },
  { month: 'Apr', 'Engineering': 278, 'Science': 390, 'Arts': 200, 'Business': 280 },
  { month: 'May', 'Engineering': 189, 'Science': 480, 'Arts': 218, 'Business': 310 },
  { month: 'Jun', 'Engineering': 239, 'Science': 380, 'Arts': 250, 'Business': 350 },
  { month: 'Jul', 'Engineering': 349, 'Science': 430, 'Arts': 210, 'Business': 410 },
];

const graduationData = [
  { faculty: 'Engineering', rate2023: 82, rate2024: 85, rate2025: 89 },
  { faculty: 'Science', rate2023: 78, rate2024: 81, rate2025: 84 },
  { faculty: 'Arts', rate2023: 90, rate2024: 92, rate2025: 91 },
  { faculty: 'Business', rate2023: 85, rate2024: 88, rate2025: 86 },
  { faculty: 'Law', rate2023: 92, rate2024: 94, rate2025: 95 },
  { faculty: 'Medicine', rate2023: 95, rate2024: 96, rate2025: 98 }
];

const performanceData = [
  { subject: 'Research', 'Engineering': 120, 'Science': 110, fullMark: 150 },
  { subject: 'Coursework', 'Engineering': 98, 'Science': 130, fullMark: 150 },
  { subject: 'Practicals', 'Engineering': 86, 'Science': 130, fullMark: 150 },
  { subject: 'Attendance', 'Engineering': 99, 'Science': 100, fullMark: 150 },
  { subject: 'Projects', 'Engineering': 85, 'Science': 90, fullMark: 150 },
  { subject: 'Exams', 'Engineering': 65, 'Science': 85, fullMark: 150 },
];

const performanceAverages = [
  { faculty: 'Engineering', avgGPA: 3.4 },
  { faculty: 'Science', avgGPA: 3.2 },
  { faculty: 'Arts', avgGPA: 3.6 },
  { faculty: 'Business', avgGPA: 3.5 },
  { faculty: 'Law', avgGPA: 3.7 },
  { faculty: 'Medicine', avgGPA: 3.8 }
];

export function EnrollmentTrendsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={enrollmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <RechartsTooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        <Line type="monotone" dataKey="Engineering" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
        <Line type="monotone" dataKey="Science" stroke="#82ca9d" strokeWidth={2} />
        <Line type="monotone" dataKey="Arts" stroke="#ffc658" strokeWidth={2} />
        <Line type="monotone" dataKey="Business" stroke="#ff8042" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GraduationRatesRecharts() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={graduationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="faculty" stroke="#64748b" fontSize={12} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
        <RechartsTooltip 
          cursor={{ fill: '#f1f5f9' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        <Bar dataKey="rate2023" name="2023 Rate (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="rate2024" name="2024 Rate (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="rate2025" name="2025 Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AcademicPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={performanceAverages} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 4.0]} />
        <YAxis dataKey="faculty" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <RechartsTooltip 
          cursor={{ fill: '#f1f5f9' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="avgGPA" name="Average GPA" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
