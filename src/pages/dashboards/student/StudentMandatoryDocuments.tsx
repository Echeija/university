import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { 
  FileText, Upload, CheckCircle2, Clock, XCircle, AlertTriangle, 
  Eye, Download, Trash2, Filter, Search, ShieldCheck, RefreshCw, 
  FileCheck2, ChevronRight, UserCheck, MessageSquare, Info, Sparkles, Plus,
  FileCode, X
} from 'lucide-react';

interface MandatoryDocument {
  id: number;
  studentId: number;
  documentType: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminFeedback?: string | null;
  reviewedById?: number | null;
  reviewedAt?: string | null;
  uploadedAt: string;
  student?: {
    id: number;
    name: string;
    email: string;
    username: string;
    department?: string;
    profilePicture?: string;
  };
  reviewer?: {
    id: number;
    name: string;
    role: string;
  };
}

const MANDATORY_DOC_TYPES = [
  { id: 'Academic Transcript', label: 'Academic Transcript (Official/Unofficial)', icon: FileText, req: true, desc: 'Previous institution academic record or semester transcript.' },
  { id: 'SSCE / O-Level Certificate', label: 'SSCE / O-Level Certificate (WAEC/NECO/NABTEB)', icon: FileCheck2, req: true, desc: 'Senior Secondary School Certificate Examination result statement.' },
  { id: 'Birth Certificate', label: 'Birth Certificate / Declaration of Age', icon: ShieldCheck, req: true, desc: 'Official government issued birth certificate or sworn declaration.' },
  { id: 'Certificate of Origin', label: 'Certificate of State of Origin', icon: Info, req: true, desc: 'Local government identification or origin certificate.' },
  { id: 'Passport Photo', label: 'Passport Photograph', icon: UserCheck, req: true, desc: 'Recent white background passport photograph.' },
  { id: 'Medical Fitness Certificate', label: 'Medical Fitness Certificate', icon: ShieldCheck, req: false, desc: 'University clinic health clearance certificate.' },
  { id: 'Other Clearance', label: 'Other Clearance / Reference Document', icon: FileCode, req: false, desc: 'Any additional supporting academic or conduct clearance.' }
];

export default function StudentMandatoryDocuments() {
  const { user, token } = useAuth();
  const { notify } = useNotification();

  const [documents, setDocuments] = useState<MandatoryDocument[]>([]);
  const [adminDocs, setAdminDocs] = useState<MandatoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-docs' | 'admin-review'>('my-docs');
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(MANDATORY_DOC_TYPES[0].id);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal state
  const [reviewingDoc, setReviewingDoc] = useState<MandatoryDocument | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [previewDoc, setPreviewDoc] = useState<MandatoryDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdminOrStaff = ['Administrator', 'Admin', 'ICT Admin', 'Admissions', 'Lecturer'].includes(user?.role || '');

  useEffect(() => {
    fetchStudentDocuments();
    if (isAdminOrStaff) {
      fetchAdminDocuments();
    }
  }, [token, user]);

  const fetchStudentDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/student/mandatory-documents', {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'Failed to load your uploaded documents', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminDocuments = async () => {
    try {
      const res = await fetch('/api/admin/mandatory-documents', {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminDocs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        notify({ title: 'File Too Large', message: 'Maximum file size allowed is 10MB', type: 'error' });
        return;
      }
      setSelectedFile(file);
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !fileDataUrl) {
      notify({ title: 'File Required', message: 'Please attach a document file to upload', type: 'error' });
      return;
    }

    try {
      setIsUploading(true);
      const res = await fetch('/api/student/mandatory-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentType: selectedDocType,
          title: customTitle || `${selectedDocType} File`,
          fileUrl: fileDataUrl || `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`,
          fileSize: selectedFile ? selectedFile.size : 1024 * 450,
          fileType: selectedFile ? selectedFile.type : 'application/pdf'
        })
      });

      if (res.ok) {
        notify({ title: 'Upload Successful', message: 'Your document has been submitted for admin verification.', type: 'success' });
        setShowUploadModal(false);
        setSelectedFile(null);
        setFileDataUrl('');
        setCustomTitle('');
        fetchStudentDocuments();
        if (isAdminOrStaff) fetchAdminDocuments();
      } else {
        const err = await res.json();
        notify({ title: 'Upload Failed', message: err.error || 'Failed to upload document', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'An error occurred during document upload', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      const res = await fetch(`/api/student/mandatory-documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        notify({ title: 'Document Removed', message: 'Document deleted successfully', type: 'success' });
        fetchStudentDocuments();
        if (isAdminOrStaff) fetchAdminDocuments();
      }
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'Failed to delete document', type: 'error' });
    }
  };

  const handleReviewAction = async (newStatus: 'Approved' | 'Rejected') => {
    if (!reviewingDoc) return;
    try {
      const res = await fetch(`/api/admin/mandatory-documents/${reviewingDoc.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          adminFeedback: reviewFeedback
        })
      });

      if (res.ok) {
        notify({ title: 'Review Saved', message: `Document has been marked as ${newStatus}.`, type: 'success' });
        setReviewingDoc(null);
        setReviewFeedback('');
        fetchAdminDocuments();
        fetchStudentDocuments();
      } else {
        notify({ title: 'Error', message: 'Failed to update review status', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'Failed to process review', type: 'error' });
    }
  };

  // Calculate Clearance Progress Metrics
  const requiredTypes = MANDATORY_DOC_TYPES.filter(t => t.req).map(t => t.id);
  const approvedTypeSet = new Set(documents.filter(d => d.status === 'Approved').map(d => d.documentType));
  const uploadedTypeSet = new Set(documents.map(d => d.documentType));

  const totalRequired = requiredTypes.length;
  const approvedCount = requiredTypes.filter(type => approvedTypeSet.has(type)).length;
  const progressPercent = Math.round((approvedCount / totalRequired) * 100);

  // Filtered documents list
  const filteredStudentDocs = documents.filter(doc => {
    if (statusFilter !== 'all' && doc.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return doc.title.toLowerCase().includes(query) || doc.documentType.toLowerCase().includes(query);
    }
    return true;
  });

  const filteredAdminDocs = adminDocs.filter(doc => {
    if (statusFilter !== 'all' && doc.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.documentType.toLowerCase().includes(query) ||
        doc.student?.name.toLowerCase().includes(query) ||
        doc.student?.username.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileCheck2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            Mandatory Student Document Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Securely upload official transcripts, certificates, age declarations, and origin passes for university verification.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isAdminOrStaff && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('my-docs')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'my-docs'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                My Documents
              </button>
              <button
                onClick={() => setActiveTab('admin-review')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin-review'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Verification Console
                {adminDocs.filter(d => d.status === 'Pending').length > 0 && (
                  <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                    {adminDocs.filter(d => d.status === 'Pending').length}
                  </span>
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Upload Mandatory Document
          </button>
        </div>
      </div>

      {/* Clearance Progress Meter for Students */}
      {activeTab === 'my-docs' && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-emerald-800/40">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Official Academic Clearance Status
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">
                Document Verification Meter
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete your mandatory clearance by uploading valid digital copies of all 5 required academic and personal documents below.
              </p>
            </div>

            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center">
                <span className="text-3xl font-black text-emerald-400">{progressPercent}%</span>
                <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Cleared</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Approved:</span>
                  <span className="font-bold text-emerald-400">{approvedCount} / {totalRequired}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Pending Review:</span>
                  <span className="font-bold text-amber-300">
                    {documents.filter(d => d.status === 'Pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar Visual */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <div className="w-full bg-slate-800/80 rounded-full h-3 p-0.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-700" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist items pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {MANDATORY_DOC_TYPES.filter(t => t.req).map(type => {
                const uploaded = documents.find(d => d.documentType === type.id);
                const isApproved = uploaded?.status === 'Approved';
                const isPending = uploaded?.status === 'Pending';
                const isRejected = uploaded?.status === 'Rejected';

                return (
                  <div
                    key={type.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      isApproved 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : isPending
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isRejected
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isPending && <Clock className="w-3.5 h-3.5 text-amber-300" />}
                    {isRejected && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    {!uploaded && <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{type.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'my-docs' ? "Search uploaded files..." : "Search by student name, matric no, or title..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Student My Documents List */}
      {activeTab === 'my-docs' && (
        <div className="space-y-6">
          {filteredStudentDocs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">No Mandatory Documents Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {statusFilter !== 'all' 
                    ? `There are no uploaded documents matching the "${statusFilter}" filter.` 
                    : "You haven't uploaded any mandatory verification documents yet. Upload your academic transcript or SSCE certificate to begin."}
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Upload Document Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudentDocs.map(doc => {
                const IconComponent = MANDATORY_DOC_TYPES.find(t => t.id === doc.documentType)?.icon || FileText;

                return (
                  <div 
                    key={doc.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                  >
                    <div>
                      {/* Top Row: Type Tag & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                          <IconComponent className="w-3.5 h-3.5" />
                          {doc.documentType}
                        </span>

                        {doc.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded text-[10px] font-extrabold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                          </span>
                        )}

                        {doc.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded text-[10px] font-extrabold">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Pending Review
                          </span>
                        )}

                        {doc.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 rounded text-[10px] font-extrabold">
                            <XCircle className="w-3 h-3 text-rose-600" /> Action Required
                          </span>
                        )}
                      </div>

                      {/* File Title & Meta */}
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {doc.title}
                      </h3>
                      
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <p className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{formatBytes(doc.fileSize)}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Uploaded:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>

                      {/* Admin Feedback Callout Box if Rejected or reviewed */}
                      {doc.adminFeedback && (
                        <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1 text-xs">
                          <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-rose-600" /> Admin Feedback:
                          </span>
                          <p className="text-rose-800 dark:text-rose-300 italic leading-relaxed">
                            "{doc.adminFeedback}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" /> Preview File
                      </button>

                      {doc.status !== 'Approved' && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all"
                          title="Delete / Re-upload"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Admin Verification Console */}
      {activeTab === 'admin-review' && isAdminOrStaff && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Student Submissions Queue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review student uploaded mandatory records, verify certificates, and issue clearance or rejection remarks.
                </p>
              </div>
              <button
                onClick={fetchAdminDocuments}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh List
              </button>
            </div>

            {filteredAdminDocs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                No student documents match the current queue criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="p-4">Student Info</th>
                      <th className="p-4">Document Type & Title</th>
                      <th className="p-4">Date Uploaded</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredAdminDocs.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {doc.student?.name || 'Student'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {doc.student?.username || 'Matric N/A'} • {doc.student?.department || 'General'}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {doc.title}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            {doc.documentType} ({formatBytes(doc.fileSize)})
                          </div>
                        </td>

                        <td className="p-4 text-slate-500">
                          {new Date(doc.uploadedAt).toLocaleString()}
                        </td>

                        <td className="p-4">
                          {doc.status === 'Approved' && (
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                            </span>
                          )}
                          {doc.status === 'Pending' && (
                            <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Pending Review
                            </span>
                          )}
                          {doc.status === 'Rejected' && (
                            <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-all"
                          >
                            View File
                          </button>
                          <button
                            onClick={() => {
                              setReviewingDoc(doc);
                              setReviewFeedback(doc.adminFeedback || '');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Review & Decide
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                Upload Mandatory Document
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              
              {/* Document Type Category Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Select Document Category *
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MANDATORY_DOC_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label} {type.req ? '(Required)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  {MANDATORY_DOC_TYPES.find(t => t.id === selectedDocType)?.desc}
                </p>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Document Title / Description *
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. WAEC O-Level Statement of Result (2022)"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* File Dropzone */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Attach Document File (PDF, JPG, PNG) *
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl text-center cursor-pointer transition-all space-y-2"
                >
                  <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  {selectedFile ? (
                    <div className="text-slate-900 dark:text-white font-bold">
                      <p>{selectedFile.name}</p>
                      <span className="text-[10px] text-emerald-600 font-mono">
                        {formatBytes(selectedFile.size)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Click or drag & drop file to upload</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, JPEG, PNG formats up to 10MB</p>
                    </div>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <Clock className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN REVIEW DECISION MODAL */}
      {reviewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Administrative Review Decision
              </h3>
              <button 
                onClick={() => setReviewingDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{reviewingDoc.student?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Matriculation No:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{reviewingDoc.student?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-bold text-emerald-600">{reviewingDoc.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Title:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{reviewingDoc.title}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                Administrative Feedback / Reason for Rejection:
              </label>
              <textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Provide notes or specific guidelines if requesting re-upload (e.g., 'Image blurred or transcript missing seal')."
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleReviewAction('Rejected')}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject & Request Re-upload
              </button>
              <button
                onClick={() => handleReviewAction('Approved')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Clear Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {previewDoc.title}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {previewDoc.documentType} • {formatBytes(previewDoc.fileSize)}
                </p>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Body */}
            <div className="flex-1 min-h-[350px] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center p-4">
              {previewDoc.fileUrl.startsWith('data:image') || previewDoc.fileType.includes('image') ? (
                <img 
                  src={previewDoc.fileUrl} 
                  alt={previewDoc.title} 
                  className="max-h-[500px] object-contain rounded-lg shadow-md" 
                />
              ) : previewDoc.fileUrl.startsWith('data:application/pdf') || previewDoc.fileType.includes('pdf') ? (
                <iframe 
                  src={previewDoc.fileUrl} 
                  title={previewDoc.title} 
                  className="w-full h-[450px] rounded-lg border border-slate-300 dark:border-slate-700" 
                />
              ) : (
                <div className="text-center space-y-3 p-8">
                  <FileText className="w-16 h-16 text-emerald-600 mx-auto" />
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    Document File Attached ({previewDoc.fileType || 'Document'})
                  </p>
                  <a
                    href={previewDoc.fileUrl}
                    download={previewDoc.title}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    <Download className="w-4 h-4" /> Download Official File
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Uploaded on {new Date(previewDoc.uploadedAt).toLocaleString()}
              </span>
              <a
                href={previewDoc.fileUrl}
                download={previewDoc.title}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Copy
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
