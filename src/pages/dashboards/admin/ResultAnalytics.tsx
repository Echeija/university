import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { BarChart3, Users, CheckCircle, XCircle, TrendingUp, TrendingDown, Medal, AlertTriangle, Download, Search, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

export default function ResultAnalytics() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    session: '2023/2024',
    semester: 'First',
    department: '',
    programme: '',
    level: '',
    courseCode: ''
  });

  const [data, setData] = useState({
    registered: 0,
    withResults: 0,
    passed: 0,
    failed: 0,
    passPercentage: 0,
    failPercentage: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    averageGpa: 0,
    gradeDistribution: [] as { name: string, value: number, color: string }[],
    performanceTrends: [] as { name: string, passRate: number, avgScore: number }[]
  });

  
  const exportToExcel = () => {
    if (!data) return;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary Data
    const summaryData = [
      { Metric: "Students Registered", Value: data.registered },
      { Metric: "Results Submitted", Value: data.withResults },
      { Metric: "Passed", Value: data.passed },
      { Metric: "Failed", Value: data.failed },
      { Metric: "Pass Rate (%)", Value: data.passPercentage },
      { Metric: "Fail Rate (%)", Value: data.failPercentage },
      { Metric: "Average Score", Value: data.averageScore },
      { Metric: "Highest Score", Value: data.highestScore },
      { Metric: "Lowest Score", Value: data.lowestScore },
      { Metric: "Average CGPA", Value: data.averageGpa.toFixed(2) },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Analytics Summary");

    // Grade Distribution Data
    const wsGrades = XLSX.utils.json_to_sheet(data.gradeDistribution.map(g => ({ Grade: g.name, Count: g.value })));
    XLSX.utils.book_append_sheet(wb, wsGrades, "Grade Distribution");

    // Performance Trends Data
    const wsTrends = XLSX.utils.json_to_sheet(data.performanceTrends);
    XLSX.utils.book_append_sheet(wb, wsTrends, "Performance Trends");

    // Save the file
    XLSX.writeFile(wb, `Result_Analytics_${filters.session.replace('/', '-')}_${filters.semester}.xlsx`);
  };

  const mockFetchData = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Mock data for demonstration purposes
      const registered = Math.floor(Math.random() * 500) + 200;
      const withResults = registered - Math.floor(Math.random() * 50);
      const passed = Math.floor(withResults * (0.6 + Math.random() * 0.3));
      const failed = withResults - passed;
      
      setData({
        registered,
        withResults,
        passed,
        failed,
        passPercentage: Number(((passed / withResults) * 100).toFixed(1)),
        failPercentage: Number(((failed / withResults) * 100).toFixed(1)),
        averageScore: Number((50 + Math.random() * 25).toFixed(1)),
        highestScore: Number((85 + Math.random() * 15).toFixed(1)),
        lowestScore: Number((10 + Math.random() * 30).toFixed(1)),
        averageGpa: Number((2.5 + Math.random() * 2).toFixed(2)),
        gradeDistribution: [
          { name: 'A', value: Math.floor(passed * 0.2), color: '#10b981' },
          { name: 'B', value: Math.floor(passed * 0.3), color: '#3b82f6' },
          { name: 'C', value: Math.floor(passed * 0.35), color: '#f59e0b' },
          { name: 'D', value: Math.floor(passed * 0.15), color: '#8b5cf6' },
          { name: 'F', value: failed, color: '#ef4444' }
        ],
        performanceTrends: [
          { name: '100 Level', passRate: 75, avgScore: 62 },
          { name: '200 Level', passRate: 82, avgScore: 65 },
          { name: '300 Level', passRate: 78, avgScore: 63 },
          { name: '400 Level', passRate: 90, avgScore: 71 },
          { name: '500 Level', passRate: 95, avgScore: 75 },
        ]
      });
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    mockFetchData();
  }, [filters]);

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Result Analytics</h1>
          <p className="text-slate-500">Comprehensive academic performance insights.</p>
        </div>
        <button onClick={exportToExcel} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm disabled:opacity-50">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Session</label>
          <select 
            value={filters.session}
            onChange={(e) => setFilters({...filters, session: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          >
            <option>2023/2024</option>
            <option>2022/2023</option>
            <option>2021/2022</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
          <select 
            value={filters.semester}
            onChange={(e) => setFilters({...filters, semester: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          >
            <option>All Semesters</option>
            <option>First</option>
            <option>Second</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Level</label>
          <select 
            value={filters.level}
            onChange={(e) => setFilters({...filters, level: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Levels</option>
            <option>100</option>
            <option>200</option>
            <option>300</option>
            <option>400</option>
            <option>500</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
          <select 
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Departments</option>
            <option>Computer Science</option>
            <option>Software Engineering</option>
            <option>Information Technology</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Programme</label>
          <select 
            value={filters.programme}
            onChange={(e) => setFilters({...filters, programme: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Programmes</option>
            <option>B.Sc.</option>
            <option>M.Sc.</option>
            <option>Ph.D.</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Code</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="e.g. CSC101"
              value={filters.courseCode}
              onChange={(e) => setFilters({...filters, courseCode: e.target.value})}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 uppercase"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500">Generating analytics...</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard 
              title="Students Registered" 
              value={data.registered.toLocaleString()} 
              icon={Users} 
              colorClass="bg-blue-100 text-blue-600" 
            />
            <StatCard 
              title="Results Submitted" 
              value={data.withResults.toLocaleString()} 
              subtitle={`${((data.withResults / data.registered) * 100).toFixed(1)}% completion`}
              icon={CheckCircle} 
              colorClass="bg-indigo-100 text-indigo-600" 
            />
            <StatCard 
              title="Overall Pass Rate" 
              value={`${data.passPercentage}%`} 
              subtitle={`${data.passed.toLocaleString()} students passed`}
              icon={TrendingUp} 
              colorClass="bg-emerald-100 text-emerald-600" 
              trend={2.4}
            />
            <StatCard 
              title="Overall Failure Rate" 
              value={`${data.failPercentage}%`} 
              subtitle={`${data.failed.toLocaleString()} students failed`}
              icon={TrendingDown} 
              colorClass="bg-rose-100 text-rose-600" 
              trend={-1.2}
            />
            <StatCard 
              title="Average CGPA" 
              value={data.averageGpa.toFixed(2)} 
              icon={Medal} 
              colorClass="bg-purple-100 text-purple-600" 
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Average Score</p>
                <h4 className="text-2xl font-bold text-slate-800">{data.averageScore}%</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Highest Score</p>
                <h4 className="text-2xl font-bold text-emerald-600">{data.highestScore}%</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Lowest Score</p>
                <h4 className="text-2xl font-bold text-red-600">{data.lowestScore}%</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-400">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Grade Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} Students`, 'Count']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Performance by Level</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.performanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="passRate" name="Pass Rate (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="right" dataKey="avgScore" name="Average Score" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
