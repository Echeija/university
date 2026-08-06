import React, { useState } from 'react';
import { Download, FileText, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function AcademicReportsWidget() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [isExporting, setIsExporting] = useState<'performance' | 'enrollment' | null>(null);

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const escape = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escape}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportEnrollment = async () => {
    try {
      setIsExporting('enrollment');
      const res = await fetch('/api/academic/reports/enrollment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const csv = convertToCSV(data);
        downloadCSV(csv, `enrollment_report_${new Date().toISOString().split('T')[0]}.csv`);
        notify({ title: 'Success', message: 'Enrollment report exported successfully', type: 'success' });
      } else {
        notify({ title: 'Error', message: 'Failed to fetch enrollment data', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Network error while exporting', type: 'error' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPerformance = async () => {
    try {
      setIsExporting('performance');
      const res = await fetch('/api/academic/reports/performance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const csv = convertToCSV(data);
        downloadCSV(csv, `performance_summary_${new Date().toISOString().split('T')[0]}.csv`);
        notify({ title: 'Success', message: 'Performance summary exported successfully', type: 'success' });
      } else {
        notify({ title: 'Error', message: 'Failed to fetch performance data', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Network error while exporting', type: 'error' });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Enrollment Reports</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Export student course enrollments across all faculties and departments.</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={handleExportEnrollment}
            disabled={isExporting !== null}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting === 'enrollment' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Export Enrollment CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Performance Summaries</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Export student academic performance, scores, and grades across courses.</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={handleExportPerformance}
            disabled={isExporting !== null}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting === 'performance' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Export Performance CSV
          </button>
        </div>
      </div>
    </div>
  );
}
