import DocumentUploader from '../../../components/DocumentUploader';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Printer, X } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import SkeletonLoader from '../../../components/SkeletonLoader';

export default function AdmissionManagement() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewApp, setPreviewApp] = useState<any | null>(null);
  const [screeningApp, setScreeningApp] = useState<any | null>(null);
  const [screeningNotes, setScreeningNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateContent, setTemplateContent] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const fetchApplications = () => {
    fetch('/api/registrar/applications', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setApplications(data);
        setIsLoading(false);
      });
  };

  const fetchTemplate = () => {
    fetch('/api/registrar/admission-template', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data && data.content) {
          setTemplateContent(data.content);
        }
      });
  };

  useEffect(() => {
    fetchApplications();
    fetchTemplate();
  }, [token]);

  const saveTemplate = async () => {
    setIsSavingTemplate(true);
    try {
      const res = await fetch('/api/registrar/admission-template', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: templateContent })
      });
      if (res.ok) {
        notify({ title: "Success", type: "success", message: "Admission letter template saved" });
        setIsEditingTemplate(false);
      } else {
        notify({ title: "Error", type: "error", message: "Failed to save template" });
      }
    } catch (e) {
      notify({ title: "Error", type: "error", message: "Error saving template" });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const updateStatus = async (id: number, status: string, notes?: string, interview?: string) => {
    try {
      const res = await fetch(`/api/registrar/applications/${id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status, screeningNotes: notes || '', interviewDate: interview || '' })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (e) {
      notify({ title: "Error", type: "error", message: "Error updating status" });
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.programOfInterest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admission Management</h2>
          <p className="text-slate-500 mt-1">Review and process student applications.</p>
        </div>
        <button
          onClick={() => setIsEditingTemplate(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm"
        >
          Edit Letter Template
        </button>
      </div>

      {isEditingTemplate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Edit Admission Letter</h3>
              <button onClick={() => setIsEditingTemplate(false)} className="text-slate-400 hover:text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Use <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">[NAME]</code> for the applicant's name and <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">[PROGRAM]</code> for their intended program of study.
              </p>
              <textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                className="w-full h-64 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none leading-relaxed"
                placeholder="Enter admission letter template content..."
              />
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsEditingTemplate(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={isSavingTemplate}
                className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingTemplate ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all text-sm"
              placeholder="Search by name or program..."
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none flex items-center gap-2 pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under review">Under Review</option>
              <option value="interview scheduled">Interview Scheduled</option>
              <option value="admitted">Admitted</option>
              <option value="rejected">Rejected</option>
            </select>
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">App ID</th>
                <th className="px-6 py-4">Applicant Name</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4">
                    <SkeletonLoader type="table" count={5} />
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No applications found.</td></tr>
              ) : (
                filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">
                      APP-26-{app.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{app.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{app.programOfInterest}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          app.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          app.status === 'under review' ? 'bg-blue-50 text-blue-700' :
                          app.status === 'interview scheduled' ? 'bg-purple-50 text-purple-700' :
                          app.status === 'admitted' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {app.status === 'pending' && <Clock className="w-3 h-3" />}
                          {app.status === 'under review' && <Clock className="w-3 h-3" />}
                          {app.status === 'interview scheduled' && <Clock className="w-3 h-3" />}
                          {app.status === 'admitted' && <CheckCircle className="w-3 h-3" />}
                          {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          <span className="capitalize">{app.status}</span>
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                                        
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setPreviewApp(app);
                          }}
                          className="px-3 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Print
                        </button>
                        {['pending', 'under review', 'interview scheduled'].includes(app.status) && (
                          <button
                            onClick={() => {
                              setScreeningApp(app);
                              setScreeningNotes(app.screeningNotes || '');
                              setInterviewDate('');
                            }}
                            className="px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded font-bold text-xs transition-colors"
                          >
                            Update / Screen
                          </button>
                        )}
                        {app.status === 'admitted' && (
                          <button
                            onClick={() => setPreviewApp({...app, isLetter: true})}
                            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Letter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      {screeningApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Screen Application</h3>
              <button onClick={() => setScreeningApp(null)} className="text-slate-400 hover:text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="font-bold text-slate-900">{screeningApp.fullName}</p>
                <p className="text-sm text-slate-500">{screeningApp.programOfInterest}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Screening Notes (Optional)</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none mb-4"
                  rows={3}
                  placeholder="Enter evaluation notes..."
                  value={screeningNotes}
                  onChange={(e) => setScreeningNotes(e.target.value)}
                ></textarea>
                
                <label className="block text-sm font-bold text-slate-700 mb-2">Interview Date & Time (For Scheduling)</label>
                <input 
                  type="datetime-local"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      updateStatus(screeningApp.id, 'under review', screeningNotes);
                      setScreeningApp(null);
                    }}
                    className="flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-bold text-sm transition-colors"
                  >
                    Mark 'Under Review'
                  </button>
                  <button 
                    onClick={() => {
                      if (!interviewDate) {
                        notify({ title: "Error", type: "error", message: "Please select an interview date and time" });
                        return;
                      }
                      updateStatus(screeningApp.id, 'interview scheduled', screeningNotes, interviewDate);
                      setScreeningApp(null);
                    }}
                    className="flex-1 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-bold text-sm transition-colors"
                  >
                    Schedule Interview
                  </button>
                </div>
                <div className="flex gap-3 mt-2 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      updateStatus(screeningApp.id, 'admitted', screeningNotes);
                      setScreeningApp(null);
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors"
                  >
                    Admit Student
                  </button>
                  <button 
                    onClick={() => {
                      updateStatus(screeningApp.id, 'rejected', screeningNotes);
                      setScreeningApp(null);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                  >
                    Reject Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{previewApp.isLetter ? 'Admission Letter Preview' : 'Application Form Print'}</h3>
              <button onClick={() => window.print()} className="mr-4 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button>
              <button onClick={() => setPreviewApp(null)} className="text-slate-400 hover:text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto print:p-0 print:overflow-visible">
              <div id="admission-letter" className="space-y-6 text-slate-800">
                <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                  <h1 className="text-2xl font-black uppercase tracking-widest">University of Excellence</h1>
                  <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">Office of the Registrar</p>
                </div>
                
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-bold">Date: {new Date().toLocaleDateString()}</p>
                    <p className="font-bold mt-2">Ref: APP-26-{previewApp.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="font-bold text-lg">{previewApp.fullName}</p>
                  <p>{previewApp.email}</p>
                  <p>{previewApp.phone}</p>
                </div>

                <div className="mt-8 space-y-4">
                  <p className="font-bold text-lg border-b border-slate-200 pb-2">PROVISIONAL OFFER OF ADMISSION</p>
                  <p>Dear {previewApp.fullName},</p>
                  <div className="whitespace-pre-wrap leading-relaxed text-justify">
                    {templateContent 
                      ? templateContent
                          .replace(/\[NAME\]/g, previewApp.fullName)
                          .replace(/\[PROGRAM\]/g, previewApp.programOfInterest)
                      : 'Please set up the admission letter template in the settings.'}
                  </div>
                </div>

                <div className="mt-16 pt-8">
                  <p className="font-bold">Registrar</p>
                  <p className="text-sm text-slate-500">University of Excellence</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => setPreviewApp(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const printContent = document.getElementById('admission-letter');
                  if (printContent) {
                    const printWindow = window.open('', '', 'width=800,height=600');
                    if (printWindow) {
                      printWindow.document.write('<html><head><title>Print</title>');
                      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                      printWindow.document.write('</head><body class="p-8">');
                      printWindow.document.write(printContent.innerHTML);
                      printWindow.document.write('</body></html>');
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 1000);
                    }
                  }
                }}
                className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
