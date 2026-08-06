import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle2, Clock, AlertCircle, Search, Filter } from 'lucide-react';

interface QuizResultsDashboardProps {
  quizId: string;
  onClose: () => void;
}

export default function QuizResultsDashboard({ quizId, onClose }: QuizResultsDashboardProps) {
  // Mock data for quiz results
  const stats = {
    totalSubmissions: 45,
    averageScore: 78.5,
    highestScore: 98,
    lowestScore: 42,
    passRate: 85,
    averageTime: "24:30"
  };

  const chartData = [
    { range: '0-20%', count: 1 },
    { range: '21-40%', count: 2 },
    { range: '41-60%', count: 5 },
    { range: '61-80%', count: 22 },
    { range: '81-100%', count: 15 },
  ];

  const studentResults = [
    { id: 1, name: "Alice Johnson", score: 92, time: "21:15", status: "graded", submittedAt: "Oct 24, 10:15 AM" },
    { id: 2, name: "Bob Smith", score: 78, time: "28:40", status: "graded", submittedAt: "Oct 24, 10:45 AM" },
    { id: 3, name: "Charlie Davis", score: 85, time: "25:20", status: "graded", submittedAt: "Oct 24, 11:00 AM" },
    { id: 4, name: "Diana Evans", score: null, time: "30:00", status: "pending_review", submittedAt: "Oct 24, 11:30 AM" },
    { id: 5, name: "Evan Wright", score: 65, time: "29:50", status: "graded", submittedAt: "Oct 24, 12:15 PM" },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredResults = studentResults.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filter === 'all' || (filter === 'pending' && student.status === 'pending_review') || (filter === 'graded' && student.status === 'graded'))
  );

  const [activeTab, setActiveTab] = useState<'submissions' | 'insights'>('submissions');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={onClose}
            className="text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-1 hover:underline mb-2"
          >
            &larr; Back to Course
          </button>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Week 2 Knowledge Check Results</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Analytics and student submissions</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'submissions' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Submissions
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'insights' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Insights
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Submissions</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">{stats.totalSubmissions}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Score</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">{stats.averageScore}%</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pass Rate</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">{stats.passRate}%</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Time</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">{stats.averageTime}</h3>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'submissions' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Student Submissions</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 w-full sm:w-auto"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none dark:text-slate-200 w-full sm:w-auto"
                  >
                    <option value="all">All Status</option>
                    <option value="graded">Graded</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted At</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time Taken</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredResults.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{student.name}</div>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{student.submittedAt}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{student.time}</td>
                      <td className="p-4">
                        {student.status === 'graded' ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                            student.score! >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {student.score}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <AlertCircle className="w-3 h-3" /> Needs Review
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        No submissions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Score Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Question Performance</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400 truncate pr-4">Q1. What is the main concept?</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">88% correct</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400 truncate pr-4">Q2. Explain the process...</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">42% correct</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Topic Mastery Analysis</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Core Concepts</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Students show strong understanding of fundamental principles.</p>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Applied Methods</span>
                  <span className="text-sm font-bold text-amber-500">65%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Moderate difficulty with applying concepts to practical scenarios.</p>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Advanced Analysis</span>
                  <span className="text-sm font-bold text-red-500">38%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Significant struggle with analytical and evaluation questions.</p>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Actionable Recommendations</h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">Review Session Needed</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Question 2 ("Explain the process...") had a 42% success rate. Consider reviewing this topic in the next lecture.
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">Time Management</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  25% of students ran out of time. You may want to extend the quiz duration by 5 minutes for future attempts.
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h4 className="font-bold text-slate-800 dark:text-slate-300 text-sm mb-1">High Achievers</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  5 students scored above 90%. Consider providing advanced supplementary material.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
