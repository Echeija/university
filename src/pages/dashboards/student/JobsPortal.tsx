import React, { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, Clock, Search, Filter, CheckCircle2, FileText, Upload } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { supabase } from '../../../lib/supabase';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string | null;
  salary: string | null;
  status: string;
  createdAt: string;
}

interface Application {
  application: {
    id: number;
    jobId: number;
    status: string;
    appliedAt: string;
  };
  job: Job;
}

export default function JobsPortal() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-applications'>('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/jobs/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          coverLetter
        })
      });
      
      if (res.ok) {
        notify({ title: 'Application Submitted', message: 'Your application has been submitted successfully.', type: 'success' });
        setIsApplying(false);
        setCoverLetter('');
        setSelectedJob(null);
        fetchApplications();
      } else {
        throw new Error('Failed to apply');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to submit application', type: 'error' });
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasApplied = (jobId: number) => {
    return applications.some(app => app.job?.id === jobId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            Jobs & Internships
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Discover and apply for career opportunities.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('discover')}
          className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'discover' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Discover Opportunities
        </button>
        <button
          onClick={() => setActiveTab('my-applications')}
          className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'my-applications' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          My Applications ({applications.length})
        </button>
      </div>

      {activeTab === 'discover' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search roles or companies..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">Loading opportunities...</div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No opportunities found.</div>
              ) : (
                filteredJobs.map(job => (
                  <div 
                    key={job.id} 
                    onClick={() => { setSelectedJob(job); setIsApplying(false); }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedJob?.id === job.id ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white border-slate-100 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-emerald-700'} shadow-sm`}
                  >
                    <h3 className="font-bold text-slate-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Building className="w-3 h-3" /> {job.company}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">{job.type}</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">{job.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedJob ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 lg:p-8 relative overflow-hidden">
                {!isApplying ? (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedJob.title}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {selectedJob.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedJob.type}</span>
                        </div>
                      </div>
                      
                      {hasApplied(selectedJob.id) ? (
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Applied
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsApplying(true)}
                          className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">About the Role</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                      </div>
                      
                      {selectedJob.requirements && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Requirements</h3>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for {selectedJob.title}</h2>
                      <button onClick={() => setIsApplying(false)} className="text-slate-500 hover:text-slate-700">Cancel</button>
                    </div>
                    
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <p className="text-emerald-800 dark:text-emerald-300 text-sm">
                        You are applying to <strong>{selectedJob.company}</strong>. Your student profile will be shared with the employer.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cover Letter (Optional)</label>
                      <textarea 
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Write a brief cover letter or note to the employer..."
                        className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white resize-none"
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setIsApplying(false)}
                        className="px-6 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleApply}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                      >
                        Submit Application
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select an Opportunity</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">Browse the list on the left and select a role to view details and apply.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'my-applications' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Applications Yet</h3>
              <p className="text-slate-500 dark:text-slate-400">When you apply for a job or internship, it will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-300">Role</th>
                    <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-300">Company</th>
                    <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-300">Applied On</th>
                    <th className="p-4 font-bold text-sm text-slate-600 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {applications.map((app) => (
                    <tr key={app.application.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{app.job?.title}</div>
                        <div className="text-xs text-slate-500">{app.job?.type}</div>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">
                        {app.job?.company}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {new Date(app.application.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.application.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          app.application.status === 'Reviewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          app.application.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {app.application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
