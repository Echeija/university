import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { Activity, Search, Download, Filter } from 'lucide-react';
import Papa from 'papaparse';

export default function ResultAuditLogs() {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    fetch('/api/admin/result-audit-logs', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [token]);

  const uniqueActions = useMemo(() => Array.from(new Set(logs.map(log => log.action))), [logs]);
  const uniqueCourses = useMemo(() => Array.from(new Set(logs.map(log => log.course?.code).filter(Boolean))), [logs]);

  const filteredLogs = logs.filter(l => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      l.action.toLowerCase().includes(term) || 
      (l.user?.name && l.user.name.toLowerCase().includes(term)) ||
      (l.student?.matricNo && l.student.matricNo.toLowerCase().includes(term)) ||
      (l.reason && l.reason.toLowerCase().includes(term));
      
    const matchesAction = selectedAction ? l.action === selectedAction : true;
    const matchesCourse = selectedCourse ? l.course?.code === selectedCourse : true;
    
    return matchesSearch && matchesAction && matchesCourse;
  });

  const handleExport = () => {
    const csvData = filteredLogs.map(log => ({
      Timestamp: new Date(log.createdAt).toLocaleString(),
      Action: log.action,
      Actor: log.user ? `${log.user.name} (${log.role})` : 'Unknown',
      Student: log.student ? `${log.student.name} (${log.student.matricNo})` : 'Unknown',
      Course: log.course?.code || 'Unknown',
      'Old CA': log.oldCa,
      'New CA': log.newCa,
      'Old Exam': log.oldExam,
      'New Exam': log.newExam,
      'Old Grade': log.oldGrade,
      'New Grade': log.newGrade,
      Reason: log.reason || '',
      'IP Address': log.ipAddress || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `result_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-600" />
            Result Audit Trail
          </h2>
          <p className="text-slate-500 mt-1">Immutable ledger of all academic result operations.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search actor, student, reason..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>
          
          <div className="relative">
            <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All Courses</option>
              {uniqueCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Changes</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading audit trail...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No matching audit logs found.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                      {log.reason && <div className="text-xs text-slate-500 mt-1 max-w-[150px] truncate" title={log.reason}>Reason: {log.reason}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{log.user?.name || 'System'}</div>
                      <div className="text-xs text-slate-500">{log.role || 'System'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{log.student?.matricNo}</div>
                      <div className="text-xs text-slate-500">{log.student?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{log.course?.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      {(log.oldGrade !== log.newGrade || log.oldCa !== log.newCa) ? (
                        <div className="flex flex-col gap-1">
                           {log.oldGrade !== log.newGrade && (
                             <span className="text-xs"><span className="text-rose-500 line-through">{log.oldGrade || '-'}</span> <span className="text-slate-400">→</span> <span className="text-emerald-600 font-bold">{log.newGrade}</span></span>
                           )}
                           {log.oldCa !== log.newCa && (
                             <span className="text-xs text-slate-500">CA: {log.oldCa || '0'} → {log.newCa}</span>
                           )}
                           {log.oldExam !== log.newExam && (
                             <span className="text-xs text-slate-500">Exam: {log.oldExam || '0'} → {log.newExam}</span>
                           )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Status Update Only</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
