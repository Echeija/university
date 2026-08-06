import { countries } from '../../../lib/countries';
import { nigeriaStatesAndLgas } from '../../../lib/nigeria-states';
import { useAuth } from '../../../contexts/AuthContext';
import { coursesList } from '../../../lib/courses';
import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { z } from 'zod';
import DocumentPreviewModal from '../../../components/DocumentPreviewModal';
import { useNotification } from '../../../contexts/NotificationContext';
import { FileText, CheckCircle2, Clock, XCircle, FileCheck, Search, Eye, Printer, Calendar, Users } from 'lucide-react';



const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  dob: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  indigene: z.string().min(1, "State of Origin is required"),
  lga: z.string().min(1, "LGA is required"),
  religion: z.string().min(1, "Religion is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

const step2Schema = z.object({
  courseOfStudy: z.string().min(1, "Course of study is required"),
  programOfInterest: z.string().min(1, "Program of Interest is required"),
  session: z.string().min(1, "Session is required"),
  jambRegNo: z.string().optional(),
  jambScore: z.string().optional(),
});


const step4Schema = z.object({
  ssceDocument: z.string().optional(),
  birthCertificate: z.string().optional(),
  academicTranscript: z.string().min(1, 'Academic transcript is required'),
});

const step3Schema = z.object({
  nextOfKinName: z.string().min(2, "Next of kin name is required"),
  nextOfKinAddress: z.string().min(5, "Next of kin address is required"),
  sponsorName: z.string().min(2, "Sponsor name is required"),
  sponsorAddress: z.string().min(5, "Sponsor address is required"),
});

export const ApplicationTracker = ({ status }: { status: string }) => {
  const steps = [
    { id: 'submitted', label: 'Application Submitted', icon: FileCheck },
    { id: 'review', label: 'Under Review', icon: Search },
    { id: 'interview', label: 'Interview Scheduled', icon: Calendar },
    { id: 'decision', label: status === 'rejected' ? 'Application Rejected' : 'Admission Offered', icon: status === 'rejected' ? XCircle : CheckCircle2 },
  ];

  let currentStepIndex = 0;
  if (status === 'pending') currentStepIndex = 0;
  if (status === 'under review') currentStepIndex = 1;
  if (status === 'interview scheduled') currentStepIndex = 2;
  if (status === 'admitted' || status === 'rejected') currentStepIndex = 3;

  return (
    <div className="py-8">
      <h3 className="text-xl font-bold text-slate-900 mb-8 text-center">Application Status Tracker</h3>
      <div className="relative max-w-2xl mx-auto">
        {/* Connecting Line */}
        <div className="absolute top-6 left-12 right-12 h-1 bg-slate-200 rounded-full" />
        <div 
          className="absolute top-6 left-12 h-1 bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        <div className="flex justify-between relative z-10">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center w-32">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors ${
                    isCompleted 
                      ? status === 'rejected' && index === 3
                        ? 'bg-red-500 border-red-100 text-white'
                        : 'bg-emerald-500 border-emerald-100 text-white'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-4 text-center">
                  <p className={`text-sm font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      Current Stage
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      
    </div>
  );
};

export default function ApplicationForm() {
  const { user, token } = useAuth();
  const { notify } = useNotification();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [otherDocsCount, setOtherDocsCount] = useState(0);
  const [hasPaidFee, setHasPaidFee] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [previewDoc, setPreviewDoc] = useState<{url: string, title: string} | null>(null);

  // Email verification states


  const printRef = useRef<HTMLDivElement>(null);
  const previewPrintRef = useRef<HTMLDivElement>(null);
  const customPrint = async (target: HTMLIFrameElement) => {
    return new Promise<void>((resolve) => {
      const doc = target.contentDocument;
      if (doc) {
        const win = window.open('', '_blank', 'width=800,height=800');
        if (win) {
          win.document.write(doc.documentElement.outerHTML);
          win.document.close();
          win.focus();
          setTimeout(() => {
            win.print();
            win.close();
            resolve();
          }, 500);
        } else {
          notify({ title: 'Popup Blocked', message: 'Please allow popups to print.', type: 'error' });
          resolve();
        }
      } else {
        resolve();
      }
    });
  };

  const handlePreviewPrint = useReactToPrint({
    contentRef: previewPrintRef,
    documentTitle: 'Application_Preview',
    print: customPrint,
    onPrintError: (errorLocation, error) => {
      notify({ title: 'Print Blocked', message: 'Please open the application in a new tab to print.', type: 'warning' });
    }
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Application_Receipt_${application?.regNo || '0000'}`,
    print: customPrint,
    onPrintError: (errorLocation, error) => {
      notify({ title: 'Print Blocked', message: 'Please open the application in a new tab to print.', type: 'warning' });
    }
  });


  const validateStep = (step: number) => {
    setFormErrors({});
    try {
      if (step === 1) {
        step1Schema.parse(formData);
      } else if (step === 2) {
        step2Schema.parse(formData);
      } else if (step === 3) {
        step3Schema.parse(formData);
      } else if (step === 4) {
        step4Schema.parse(formData);
      } else if (step === 5) {
        return true;
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        (err as any).errors?.forEach((e: any) => {
          if (e.path[0]) {
            errors[e.path[0].toString()] = e.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };


  const handleNext = () => {
    if (!validateStep(currentStep)) {
      notify({ title: "Validation Error", type: "error", message: "Please fix the validation errors before proceeding." });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const [formData, setFormData] = useState({
    passport: '',
    firstName: '',
    middleName: '',
    lastName: '',
    regNo: '',
    email: user?.email || '', phone: '',
    dob: '',
    address: '',
    nationality: '',
    indigene: '',
    lga: '',
    level: '100',
    department: '',
    courseOfStudy: '',
    programOfInterest: '',
    session: '2026/2027',
    jambRegNo: '',
    jambScore: '',
    maritalStatus: 'Single',
    religion: '',
    nextOfKinName: '',
    nextOfKinAddress: '',
    sponsorName: '',
    sponsorAddress: '',
    fslcDocument: '',
    ssceDocument: '',
    birthCertificate: '',
    academicTranscript: '',
    stateOfOriginDocument: '',
    otherDocument1: '',
    otherDocument2: '',
    otherDocument3: '',
    otherDocument4: '',
    otherDocument5: '',
  });

    useEffect(() => {
    fetch('/api/applicant/status', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setApplication(data.application);
        if (!data.application) {
          fetch('/api/applicant/next-reg-no', {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(regData => {
              setFormData(prev => ({ ...prev, regNo: regData.regNo }));
              setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => setIsLoading(false));
  }, [token]);

  
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      notify({ title: "Error", type: "error", message: "Invalid file type. Only JPG and PNG images are allowed for passport." });
      e.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB for images
    if (file.size > maxSize) {
      notify({ title: "Error", type: "error", message: "Image is too large. Maximum size is 2MB." });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [fieldName]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      notify({ title: "Error", type: "error", message: "Invalid file type. Only PDF, JPG, and PNG are allowed." });
      e.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      notify({ title: "Error", type: "error", message: "File is too large. Maximum size is 5MB." });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [fieldName]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  
    const handlePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setHasPaidFee(true);
      notify({ title: "Payment Successful", type: "success", message: "Application fee paid successfully." });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) {
      notify({ title: "Validation Error", type: "error", message: "Please fix the validation errors before proceeding." });
      return;
    }
    setIsLoading(true);
    try {
      const submitRes = await fetch('/api/applicant/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const submitData = await submitRes.json();
      if (submitRes.ok && submitData.application) {
        setApplication(submitData.application);
        notify({
          title: 'Application Submitted',
          message: 'Your application has been successfully submitted.',
          type: 'success',
        });
      } else {
        notify({
          title: 'Submission Failed',
          message: submitData.error || 'Failed to submit application',
          type: 'error',
        });
      }
    } catch (e) {
      notify({
        title: 'Error',
        message: 'An error occurred during submission',
        type: 'error',
      });
    }
    setIsLoading(false);
  };


  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admission Application</h2>
        <p className="text-slate-500 mt-1">Submit and track your application to Smart Global University.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {application ? (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handlePrint()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Download PDF Receipt
                </button>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-900 mb-8 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-xl font-black flex items-center gap-2 mb-2"><CheckCircle2 className="w-6 h-6 text-emerald-600"/> Form Submitted Successfully!</h3>
                  <p className="text-sm font-medium">Your application has been received and is currently under review. Please print or download your application receipt below.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8" ref={printRef}>
              <ApplicationTracker status={application.status} />
              <div className="mt-8 border-t border-slate-100 pt-8">
                <h4 className="font-bold text-slate-900 mb-4">Application Details</h4>
                {application.passport && (
                  <div className="mb-6">
                    <img src={application.passport} alt="Applicant Passport" className="w-24 h-24 object-cover rounded-xl shadow-sm border border-slate-200" referrerPolicy="no-referrer" />
                  </div>
                )}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Applicant Name</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Registration No</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.regNo}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Email Address</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Date of Birth</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.dob}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Nationality & Indigene</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.nationality} ({application.lga ? application.lga + ' LGA, ' : ''}{application.indigene})</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Marital Status & Religion</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.maritalStatus}, {application.religion}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-slate-500">Address</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Course of Study</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.courseOfStudy} (Level {application.level})</dd>
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                    <dt className="text-sm font-medium text-slate-500 mb-2">Next of Kin Details</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.nextOfKinName}</dd>
                    <dd className="mt-1 text-sm text-slate-600">{application.nextOfKinAddress}</dd>
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                    <dt className="text-sm font-medium text-slate-500 mb-2">Sponsor Details</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.sponsorName}</dd>
                    <dd className="mt-1 text-sm text-slate-600">{application.sponsorAddress}</dd>
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                    <dt className="text-sm font-medium text-slate-500 mb-2">Documents Submitted</dt>
                    <dd className="mt-1 text-sm text-slate-600">
                      <ul className="list-disc pl-5 space-y-1">
                        {application.fslcDocument && <li><a href={application.fslcDocument} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">First School Leaving Certificate</a></li>}
                        {application.ssceDocument && <li><a href={application.ssceDocument} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">SSCE (WAEC) Result</a></li>}
                        {application.stateOfOriginDocument && <li><a href={application.stateOfOriginDocument} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">State of Origin Certificate</a></li>}
                        {application.otherDocument1 && <li><a href={application.otherDocument1} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Other Document 1</a></li>}
                        {application.otherDocument2 && <li><a href={application.otherDocument2} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Other Document 2</a></li>}
                        {application.otherDocument3 && <li><a href={application.otherDocument3} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Other Document 3</a></li>}
                        {application.otherDocument4 && <li><a href={application.otherDocument4} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Other Document 4</a></li>}
                        {application.otherDocument5 && <li><a href={application.otherDocument5} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Other Document 5</a></li>}
                      </ul>
                    </dd>
                  </div>
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <dt className="text-sm font-medium text-slate-500">Program of Interest</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.programOfInterest}</dd>
                  </div>
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <dt className="text-sm font-medium text-slate-500">Session</dt>
                    <dd className="mt-1 font-bold text-slate-900">{application.session}</dd>
                  </div>
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <dt className="text-sm font-medium text-slate-500">Date Submitted</dt>
                    <dd className="mt-1 font-bold text-slate-900">{new Date(application.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <dt className="text-sm font-medium text-slate-500">Application ID</dt>
                    <dd className="mt-1 font-bold text-slate-900 font-mono">APP-26-{application.id.toString().padStart(4, '0')}</dd>
                  </div>
                </dl>
              </div>
            </div>
</div>
) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              
              <div className="mb-12">
                <div className="relative flex justify-between items-center w-full">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}></div>
                  
                  {[
                    { num: 1, label: 'Personal' },
                    { num: 2, label: 'Academic' },
                    { num: 3, label: 'Kin & Sponsor' },
                    { num: 4, label: 'Documents' },
                    { num: 5, label: 'Preview' },
                  ].map((step) => (
                    <div key={step.num} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border-2 transition-all duration-300 ${currentStep > step.num ? 'bg-emerald-500 border-emerald-500 text-white' : currentStep === step.num ? 'bg-white border-emerald-500 text-emerald-600 ring-4 ring-emerald-50' : 'bg-white border-slate-200 text-slate-400'}`}>
                        {currentStep > step.num ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : step.num}
                      </div>
                      <span className={`absolute top-full mt-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors duration-300 ${currentStep >= step.num ? 'text-emerald-700' : 'text-slate-400'} ${currentStep === step.num ? 'block' : 'hidden sm:block'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Passport Photograph</label>
                    <div className="flex items-start gap-4">
                      {formData.passport && (
                        <div className="shrink-0">
                          <img src={formData.passport} alt="Passport Preview" className="w-24 h-24 object-cover rounded-xl shadow-sm border border-slate-200" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => handleImageUpload(e, 'passport')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Upload a clear, recent passport-sized photograph. Max size: 2MB. Format: JPG or PNG.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                      <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                      {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Middle Name</label>
                      <input type="text" value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                      <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                      {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Registration No</label>
                      <input type="text" value={formData.regNo} readOnly className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-50 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth</label>
                      <input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                      {formErrors.dob && <p className="text-red-500 text-xs mt-1">{formErrors.dob}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Marital Status</label>
                      <select value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium">
                        <option>Single</option>
                        <option>Married</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nationality</label>
                      <select required value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white">
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      {formErrors.nationality && <p className="text-red-500 text-xs mt-1">{formErrors.nationality}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">State of Origin (Indigene)</label>
                      <select required value={formData.indigene} onChange={(e) => setFormData({...formData, indigene: e.target.value, lga: ''})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white">
                        <option value="">Select State</option>
                        {Object.keys(nigeriaStatesAndLgas).sort().map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {formErrors.indigene && <p className="text-red-500 text-xs mt-1">{formErrors.indigene}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Local Government Area (LGA)</label>
                      <select required value={formData.lga} onChange={(e) => setFormData({...formData, lga: e.target.value})} disabled={!formData.indigene} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white disabled:bg-slate-50 disabled:text-slate-400">
                        <option value="">Select LGA</option>
                        {formData.indigene && nigeriaStatesAndLgas[formData.indigene]?.sort().map(lga => (
                          <option key={lga} value={lga}>{lga}</option>
                        ))}
                      </select>
                      {formErrors.lga && <p className="text-red-500 text-xs mt-1">{formErrors.lga}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Religion</label>
                      <select required value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white">
                        <option value="">Select Religion</option>
                        <option value="Christian">Christian</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Others">Others</option>
                      </select>
                      {formErrors.religion && <p className="text-red-500 text-xs mt-1">{formErrors.religion}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                    <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" rows={2}></textarea>
                      {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Academic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course of Study</label>
                                            <select required value={formData.courseOfStudy} onChange={(e) => setFormData({...formData, courseOfStudy: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium">
                        <option value="">Select Course</option>
                        {coursesList.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                      {formErrors.courseOfStudy && <p className="text-red-500 text-xs mt-1">{formErrors.courseOfStudy}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
                      <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium">
                        <option>100</option>
                        <option>200</option>
                        <option>300</option>
                        <option>400</option>
                        <option>500</option>
                        <option>600</option>
                        <option>700</option>
                        <option>800</option>
                        <option>900</option>
                        <option>HND I</option>
                        <option>HND II</option>
                        <option>ND I</option>
                        <option>ND II</option>
                        <option>NVC</option>
                        <option>NTC</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Program of Interest</label>
                      <select 
                        required
                        value={formData.programOfInterest || ""}
                        onChange={(e) => setFormData({...formData, programOfInterest: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="">Select Program</option>
                        <option value="PhD">PhD</option>
                        <option value="MSc">MSc</option>
                        <option value="BSc">BSc</option>
                        <option value="HND">HND</option>
                        <option value="ND">ND</option>
                        <option value="NTC">NTC</option>
                        <option value="NVC">NVC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Session</label>
                      <select 
                        required
                        value={formData.session || ""}
                        onChange={(e) => setFormData({...formData, session: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="">Select Session</option>
                        <option value="2024/2025">2024/2025</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2026/2027">2026/2027</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">JAMB Registration Number</label>
                      <input type="text" value={formData.jambRegNo} onChange={(e) => setFormData({...formData, jambRegNo: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" placeholder="e.g. 12345678AB" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">JAMB Score</label>
                      <input type="number" value={formData.jambScore} onChange={(e) => setFormData({...formData, jambScore: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" placeholder="e.g. 250" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Next of Kin & Sponsor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Next of Kin Name</label>
                      <input type="text" required value={formData.nextOfKinName} onChange={(e) => setFormData({...formData, nextOfKinName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                      {formErrors.nextOfKinName && <p className="text-red-500 text-xs mt-1">{formErrors.nextOfKinName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Next of Kin Address</label>
                      <input type="text" required value={formData.nextOfKinAddress} onChange={(e) => setFormData({...formData, nextOfKinAddress: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                      {formErrors.nextOfKinAddress && <p className="text-red-500 text-xs mt-1">{formErrors.nextOfKinAddress}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sponsor Name</label>
                      <input type="text" required value={formData.sponsorName} onChange={(e) => setFormData({...formData, sponsorName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                      {formErrors.sponsorName && <p className="text-red-500 text-xs mt-1">{formErrors.sponsorName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sponsor Address</label>
                      <input type="text" required value={formData.sponsorAddress} onChange={(e) => setFormData({...formData, sponsorAddress: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                      {formErrors.sponsorAddress && <p className="text-red-500 text-xs mt-1">{formErrors.sponsorAddress}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Document Uploads</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Birth Certificate</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'birthCertificate')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.birthCertificate && (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>
                            <button 
                              type="button" 
                              onClick={() => setPreviewDoc({url: formData.birthCertificate, title: 'Birth Certificate'})}
                              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Preview
                            </button>
                          </div>
                        )}
                      </div>
                      {formErrors.birthCertificate && <p className="text-red-500 text-xs mt-1">{formErrors.birthCertificate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Academic Transcript</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'academicTranscript')} className={`w-full p-3 border rounded-xl focus:ring-2 font-medium bg-white ${formErrors.academicTranscript ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'}`} />
                        {formData.academicTranscript && (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>
                            <button 
                              type="button" 
                              onClick={() => setPreviewDoc({url: formData.academicTranscript, title: 'Academic Transcript'})}
                              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Preview
                            </button>
                          </div>
                        )}
                      </div>
                      {formErrors.academicTranscript && <p className="text-red-500 text-xs mt-1">{formErrors.academicTranscript}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">O'Level Result (WAEC/NECO/NABTEB)</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'ssceDocument')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.ssceDocument && (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>
                            <button 
                              type="button" 
                              onClick={() => setPreviewDoc({url: formData.ssceDocument, title: "O'Level Result"})}
                              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Preview
                            </button>
                          </div>
                        )}
                      </div>
                      {formErrors.ssceDocument && <p className="text-red-500 text-xs mt-1">{formErrors.ssceDocument}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">First School Leaving Certificate</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'fslcDocument')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.fslcDocument && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">State of Origin Certificate</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'stateOfOriginDocument')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.stateOfOriginDocument && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    {Array.from({ length: otherDocsCount }).map((_, index) => {
                      const docKey = `otherDocument${index + 1}` as keyof typeof formData;
                      return (
                        <div key={docKey}>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Other Document {index + 1}</label>
                          <div className="flex items-center gap-4">
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, docKey as string)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                            {formData[docKey] && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                          </div>
                        </div>
                      );
                    })}
                    {otherDocsCount < 5 && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setOtherDocsCount(prev => prev + 1)}
                          className="px-4 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors"
                        >
                          + Add Other Document
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900 mb-8">
                    <h3 className="text-lg font-black mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-600"/> Final Review & Payment</h3>
                    <p className="text-sm font-medium">Please review your application details carefully. <strong className="font-black text-amber-700">Once you submit this form, it cannot be edited or modified.</strong> You must pay the application fee before final submission.</p>
                  </div>

                  {!hasPaidFee && (
                    <div className="bg-white border border-emerald-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Application Fee Required</h4>
                        <p className="text-sm text-slate-500 mt-1">A non-refundable fee of ₦10,000 is required to process your application.</p>
                      </div>
                      <button type="button" onClick={handlePayment} disabled={isProcessingPayment} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap">
                        {isProcessingPayment ? 'Processing...' : 'Pay ₦10,000 via Paystack'}
                      </button>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Preview Your Application</h3>
                  
                  <div className="flex justify-end mb-4">
                    <button type="button" onClick={() => handlePreviewPrint()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm">
                      <Printer className="w-4 h-4" /> Print Preview
                    </button>
                  </div>
                  <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100" ref={previewPrintRef}>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xl font-black text-slate-900">Application Preview</h4>
                      {formData.passport && (
                        <img src={formData.passport} alt="Passport Preview" className="w-24 h-24 object-cover rounded-xl shadow-sm border border-slate-200" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-700 uppercase tracking-wider mb-3">1. Personal Details</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div><dt className="text-slate-500">Full Name</dt><dd className="font-bold text-slate-900">{formData.firstName} {formData.middleName} {formData.lastName}</dd></div>
                        <div><dt className="text-slate-500">Email</dt><dd className="font-bold text-slate-900">{formData.email}</dd></div>
                        <div><dt className="text-slate-500">Phone</dt><dd className="font-bold text-slate-900">{formData.phone}</dd></div>
                        <div><dt className="text-slate-500">DOB</dt><dd className="font-bold text-slate-900">{formData.dob}</dd></div>
                        <div><dt className="text-slate-500">Nationality</dt><dd className="font-bold text-slate-900">{formData.nationality}</dd></div>
                        <div><dt className="text-slate-500">State / LGA</dt><dd className="font-bold text-slate-900">{formData.indigene} / {formData.lga}</dd></div>
                        <div><dt className="text-slate-500">Address</dt><dd className="font-bold text-slate-900">{formData.address}</dd></div>
                      </dl>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-sm font-black text-emerald-700 uppercase tracking-wider mb-3">2. Academic Details</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div><dt className="text-slate-500">Program of Interest</dt><dd className="font-bold text-slate-900">{formData.programOfInterest}</dd></div>
                        <div><dt className="text-slate-500">Course of Study</dt><dd className="font-bold text-slate-900">{formData.courseOfStudy}</dd></div>
                        {formData.jambRegNo && <div><dt className="text-slate-500">JAMB Reg No</dt><dd className="font-bold text-slate-900">{formData.jambRegNo}</dd></div>}
                        {formData.jambScore && <div><dt className="text-slate-500">JAMB Score</dt><dd className="font-bold text-slate-900">{formData.jambScore}</dd></div>}
                        <div><dt className="text-slate-500">Session</dt><dd className="font-bold text-slate-900">{formData.session}</dd></div>
                        <div><dt className="text-slate-500">Level</dt><dd className="font-bold text-slate-900">{formData.level}</dd></div>
                      </dl>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-sm font-black text-emerald-700 uppercase tracking-wider mb-3">3. Next of Kin & Sponsor</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div><dt className="text-slate-500">Next of Kin Name</dt><dd className="font-bold text-slate-900">{formData.nextOfKinName}</dd></div>
                        <div><dt className="text-slate-500">Next of Kin Address</dt><dd className="font-bold text-slate-900">{formData.nextOfKinAddress}</dd></div>
                        <div><dt className="text-slate-500">Sponsor Name</dt><dd className="font-bold text-slate-900">{formData.sponsorName}</dd></div>
                        <div><dt className="text-slate-500">Sponsor Address</dt><dd className="font-bold text-slate-900">{formData.sponsorAddress}</dd></div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 mt-8 border-t border-slate-100 flex justify-between gap-4">
                {currentStep > 1 && (
                  <button type="button" onClick={handlePrev} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">
                    Previous
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button type="button" onClick={handleNext} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors ml-auto shadow-lg shadow-emerald-200">
                    Next Step
                  </button>
                ) : (
                  <button type="submit" disabled={isLoading || !hasPaidFee} className={`px-8 py-3 text-white rounded-xl font-black transition-colors ml-auto shadow-lg ${hasPaidFee ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-slate-300 cursor-not-allowed'}`}>
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>

            </form>

          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Admission Guide</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Ensure all your details are correct before submitting. Once submitted, your application will be reviewed by the admissions board.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <p className="text-sm font-medium">Fill Biodata Form</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <p className="text-sm font-medium text-slate-400">Await Review</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <p className="text-sm font-medium text-slate-400">Acceptance & Enrollment</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    

      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentUrl={previewDoc?.url || ''}
        title={previewDoc?.title || ''}
      />
</div>
  );
}
