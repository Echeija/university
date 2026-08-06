import { useState, FormEvent } from 'react';
import { FileText, Send, CheckCircle2, Clock, Download } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TranscriptRequest {
  id: string;
  type: 'Official' | 'Student Copy';
  status: 'Pending' | 'Processing' | 'Completed';
  dateRequested: string;
  destination: string;
}

const mockRequests: TranscriptRequest[] = [
  {
    id: 'TR-1029',
    type: 'Official',
    status: 'Completed',
    dateRequested: 'May 15, 2026',
    destination: 'Harvard University Admissions',
  },
  {
    id: 'TR-1045',
    type: 'Student Copy',
    status: 'Processing',
    dateRequested: 'Jul 05, 2026',
    destination: 'Personal Email',
  }
];

export default function TranscriptRequest() {
  const [type, setType] = useState<'Official' | 'Student Copy'>('Student Copy');
  const [destination, setDestination] = useState('');
  const [requests, setRequests] = useState<TranscriptRequest[]>(mockRequests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useNotification();
  const { user } = useAuth();

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(22);
    doc.text('Smart Global College of Technology', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Academic Transcript (Unofficial)', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 45);
    doc.text(`Student: ${user?.name || 'Verified Student'}`, 14, 52);
    doc.text(`Student ID: SGCT-${Math.floor(Math.random() * 90000) + 10000}`, 14, 59);

    autoTable(doc, {
      startY: 70,
      head: [['Course Code', 'Course Title', 'Credits', 'Grade', 'Points']],
      body: [
        ['CSC 101', 'Introduction to Computer Science', '3', 'A', '12.0'],
        ['MTH 101', 'Calculus I', '4', 'B', '12.0'],
        ['PHY 101', 'General Physics I', '3', 'A', '12.0'],
        ['ENG 101', 'English Composition', '2', 'A', '8.0'],
        ['CSC 201', 'Data Structures and Algorithms', '3', 'A', '12.0'],
        ['MTH 201', 'Linear Algebra', '3', 'B', '9.0'],
      ],
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.text(`CGPA: 3.85`, 14, finalY + 15);
    
    doc.save(`${user?.name?.replace(/\s+/g, '_') || 'Student'}_Transcript.pdf`);
    
    notify({
      title: 'Download Started',
      message: 'Your transcript PDF has been generated successfully.',
      type: 'success'
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!destination) return;
    
    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      const newRequest: TranscriptRequest = {
        id: `TR-${Math.floor(Math.random() * 9000) + 1000}`,
        type,
        status: 'Pending',
        dateRequested: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        destination,
      };
      
      setRequests([newRequest, ...requests]);
      setDestination('');
      setIsSubmitting(false);
      
      notify({
        title: 'Request Submitted',
        message: 'Your transcript request has been successfully submitted.',
        type: 'success'
      });
    }, 1000);
  };

  const getStatusIcon = (status: TranscriptRequest['status']) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Processing': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-emerald-600" />
          Transcript Request
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Request official or student copies of your academic transcripts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6 print:hidden">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">New Request</h3>
            
                        <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Transcript Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as 'Official' | 'Student Copy')}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 dark:text-slate-300 transition-all"
                >
                  <option value="Student Copy">Student Copy (Digital)</option>
                  <option value="Official">Official Transcript (Sealed)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Destination</label>
                <input 
                  type="text"
                  required
                  placeholder={type === 'Official' ? 'Institution Name & Address' : 'Email Address'}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 dark:text-slate-300 transition-all"
                />
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  type="submit"
                  disabled={isSubmitting || !destination}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
                
                {type === 'Student Copy' && (
                  <button 
                    type="button"
                    onClick={generatePDF}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Instant PDF
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        <div className="md:col-span-2 print:col-span-1 print:md:col-span-3">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full print:shadow-none print:border-none print:p-0 print:bg-transparent">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Request History</h3>
            
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{req.id}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                          {req.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        To: <span className="font-medium text-slate-700 dark:text-slate-300">{req.destination}</span>
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Requested on {req.dateRequested}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium w-max">
                      {getStatusIcon(req.status)}
                      <span className={
                        req.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' :
                        req.status === 'Processing' ? 'text-blue-600 dark:text-blue-400' :
                        'text-amber-600 dark:text-amber-400'
                      }>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p>No transcript requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
