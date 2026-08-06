import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { MessageSquare, Calendar, Mail, Phone, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import SkeletonLoader from '../../../components/SkeletonLoader';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  courseOfStudy: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdmissionsInquiries() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setInquiries(data);
      }
    } catch (e) {
      notify({
        title: 'Error',
        message: 'Failed to fetch inquiries',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inq => 
    inq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inq.courseOfStudy && inq.courseOfStudy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admissions Inquiries</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage questions from prospective students.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <SkeletonLoader type="list" count={4} />
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No inquiries found</p>
            <p className="text-sm mt-1">There are no inquiries matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Prospective Student</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Course of Study</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Message</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Date Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">{inquiry.name}</div>
                      <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {inquiry.email}</span>
                        {inquiry.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {inquiry.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {inquiry.courseOfStudy || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="text-slate-600 dark:text-slate-300 max-w-md whitespace-pre-wrap">{inquiry.message}</p>
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
