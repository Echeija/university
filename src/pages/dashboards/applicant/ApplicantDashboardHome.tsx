import DocumentUploader from '../../../components/DocumentUploader';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, Search, XCircle, ChevronRight, GraduationCap, Calendar } from 'lucide-react';
import { ApplicationTracker } from './ApplicationForm';

export default function ApplicantDashboardHome() {
  const { user, token } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [isProcessingAcceptance, setIsProcessingAcceptance] = useState(false);
  const [screeningScheduled, setScreeningScheduled] = useState(false);

  useEffect(() => {
    fetch('/api/applicant/status', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.application) {
          setApplication(data.application);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [token]);

  const handleAcceptAdmission = () => {
    setIsProcessingAcceptance(true);
    setTimeout(() => {
      setIsProcessingAcceptance(false);
      setHasAccepted(true);
      setShowAcceptanceModal(false);
    }, 2000);
  };

  const handlePrintAcceptanceLetter = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Acceptance Letter</title>');
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      printWindow.document.write('</head><body class="p-8 font-sans">');
      printWindow.document.write(`
        <div id="acceptance-letter" class="space-y-6 text-slate-800">
          <div class="text-center mb-8 border-b-2 border-slate-900 pb-4">
            <h1 class="text-2xl font-black uppercase tracking-widest">University of Excellence</h1>
            <p class="text-sm text-slate-500 uppercase tracking-widest mt-1">Office of the Registrar</p>
          </div>
          <div class="flex justify-between items-start text-sm">
            <div>
              <p class="font-bold">Date: ${new Date().toLocaleDateString()}</p>
              <p class="font-bold mt-2">Ref: APP-26-${application?.id?.toString().padStart(4, '0')}</p>
            </div>
          </div>
          <div class="mt-8">
            <p class="font-bold text-lg">${user?.name}</p>
            <p>${user?.email}</p>
          </div>
          <div class="mt-8 space-y-4">
            <p class="font-bold text-lg border-b border-slate-200 pb-2">ADMISSION ACCEPTANCE</p>
            <p>Dear Registrar,</p>
            <p>I, ${user?.name}, hereby accept the provisional offer of admission into the University of Excellence for the <strong>${application?.programOfInterest}</strong> program.</p>
            <p>I pledge to abide by all the rules and regulations of the institution.</p>
          </div>
          <div class="mt-16 pt-8">
            <p class="font-bold border-t border-slate-400 inline-block pt-2">Applicant Signature</p>
          </div>
        </div>
      `);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any; description: string }> = {
    pending: {
      label: 'Application Submitted',
      color: 'text-amber-600 bg-amber-50',
      icon: FileText,
      description: 'Your application has been received and is pending review.'
    },
    'under review': {
      label: 'Under Review',
      color: 'text-blue-600 bg-blue-50',
      icon: Search,
      description: 'Your application is currently being reviewed by the admissions board.'
    },
    'interview scheduled': {
      label: 'Interview Scheduled',
      color: 'text-purple-600 bg-purple-50',
      icon: Calendar,
      description: 'You have been scheduled for an interview. Please check your email for details.'
    },
    admitted: {
      label: 'Admission Offered',
      color: 'text-emerald-600 bg-emerald-50',
      icon: CheckCircle2,
      description: 'Congratulations! You have been offered admission. Check your email for further instructions.'
    },
    rejected: {
      label: 'Application Rejected',
      color: 'text-red-600 bg-red-50',
      icon: XCircle,
      description: 'Unfortunately, your application was not successful at this time.'
    }
  };

  const currentStatus = application ? (statusConfig[application.status] || statusConfig.pending) : null;
  const StatusIcon = currentStatus?.icon || Clock;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Session</p>
            <p className="text-lg font-bold text-slate-900">{application?.session || '2026/2027'}</p>
          </div>
        </div>
        {application && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Application ID</p>
              <p className="text-lg font-bold text-slate-900 font-mono">APP-26-{application.id.toString().padStart(4, '0')}</p>
            </div>
          </div>
        )}
      </div>

      {application ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">My Application Status</h3>
              <p className="text-sm text-slate-500 mt-1">Track the real-time status of your admission process.</p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm border border-white/50 shadow-sm ${currentStatus?.color}`}>
              <StatusIcon className="w-5 h-5" />
              {currentStatus?.label}
            </div>
          </div>
          
          <div className="p-8">
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <ApplicationTracker status={application.status} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
              <div className="mb-4 sm:mb-0">
                <h4 className="font-bold text-slate-900">Need to print your receipt?</h4>
                <p className="text-sm text-slate-500 mt-1">You can view and print your full application summary.</p>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                {application.status === 'admitted' && !hasAccepted && (
                  <button 
                    onClick={() => setShowAcceptanceModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Accept Admission
                  </button>
                )}
                {application.status === 'admitted' && (
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '', 'width=800,height=600');
                      if (printWindow) {
                        fetch('/api/registrar/admission-template', { headers: { Authorization: `Bearer ${token}` } })
                          .then(res => res.json())
                          .then(data => {
                            const template = data?.content || 'We are pleased to inform you that you have been offered provisional admission to the University of Excellence to pursue a degree in **[PROGRAM]**.\n\nThis offer is subject to the verification of your qualifications and payment of the required acceptance fees. Please log in to your portal to complete the necessary registration processes.\n\nCongratulations on your admission, and we look forward to welcoming you to our campus.';
                            const content = template
                              .replace(/\[NAME\]/g, user?.name || '')
                              .replace(/\[PROGRAM\]/g, application.programOfInterest || '');
                              
                            printWindow.document.write('<html><head><title>Print Admission Letter</title>');
                            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                            printWindow.document.write('</head><body class="p-8 font-sans">');
                            printWindow.document.write(`
                              <div id="admission-letter" class="space-y-6 text-slate-800">
                                <div class="text-center mb-8 border-b-2 border-slate-900 pb-4">
                                  <h1 class="text-2xl font-black uppercase tracking-widest">University of Excellence</h1>
                                  <p class="text-sm text-slate-500 uppercase tracking-widest mt-1">Office of the Registrar</p>
                                </div>
                                <div class="flex justify-between items-start text-sm">
                                  <div>
                                    <p class="font-bold">Date: ${new Date().toLocaleDateString()}</p>
                                    <p class="font-bold mt-2">Ref: APP-26-${application.id.toString().padStart(4, '0')}</p>
                                  </div>
                                </div>
                                <div class="mt-8">
                                  <p class="font-bold text-lg">${user?.name}</p>
                                  <p>${user?.email}</p>
                                </div>
                                <div class="mt-8 space-y-4">
                                  <p class="font-bold text-lg border-b border-slate-200 pb-2">PROVISIONAL OFFER OF ADMISSION</p>
                                  <p>Dear ${user?.name},</p>
                                  <div class="whitespace-pre-wrap leading-relaxed text-justify">${content}</div>
                                </div>
                                <div class="mt-16 pt-8">
                                  <p class="font-bold">Registrar</p>
                                  <p class="text-sm text-slate-500">University of Excellence</p>
                                </div>
                              </div>
                            `);
                            printWindow.document.write('</body></html>');
                            printWindow.document.close();
                            printWindow.focus();
                            setTimeout(() => {
                              printWindow.print();
                              printWindow.close();
                            }, 1000);
                          });
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Print Admission Letter
                  </button>
                )}
                {hasAccepted && (
                   <button 
                     onClick={handlePrintAcceptanceLetter}
                     className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                   >
                     Print Acceptance Letter
                   </button>
                )}
                <Link to="/dashboard/application" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm">
                  View Full Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {hasAccepted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div>
                    <h4 className="text-lg font-bold text-emerald-900 mb-1">Schedule Screening</h4>
                    <p className="text-sm text-emerald-700">You need to schedule a physical screening to verify your documents.</p>
                 </div>
                 <button 
                    onClick={() => {
                      setScreeningScheduled(true);
                      alert("Screening Scheduled for " + new Date(Date.now() + 86400000 * 7).toLocaleDateString());
                    }}
                    disabled={screeningScheduled}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl disabled:bg-emerald-300 whitespace-nowrap"
                 >
                    {screeningScheduled ? 'Screening Scheduled' : 'Schedule Now'}
                 </button>
              </div>
            )}
          </div>
          
      {application && (
        <div className="mt-8">
          <DocumentUploader 
            path={`applicants/${user?.id}/credentials`}
            title="Upload Credentials & Certificates"
            description="Securely upload your O-Level results, Birth Certificate, and other required documents. Only PDF, JPG, and PNG files are accepted."
          />
        </div>
      )}
</div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 max-w-2xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Start Your Application</h3>
          <p className="text-slate-600 mb-8 leading-relaxed text-lg">
            You haven't submitted an application yet. Click below to begin your admission process and fill out the necessary forms.
          </p>
          <Link to="/dashboard/application" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 text-lg">
            Fill Application Form <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {showAcceptanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowAcceptanceModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Accept Admission Offer</h3>
            <p className="text-slate-600 mb-6 font-medium">To formally accept this offer, you must pay a non-refundable Acceptance Fee of <strong>₦50,000</strong>.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAcceptAdmission} 
                disabled={isProcessingAcceptance}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {isProcessingAcceptance ? 'Processing Payment...' : 'Pay ₦50,000 via Paystack'}
              </button>
              <button onClick={() => setShowAcceptanceModal(false)} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
