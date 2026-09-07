import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Search, FileText, UserPlus, Calendar, Plus, X, HeartPulse, Paperclip, Download, Info, Activity, Printer, AlertOctagon, PhoneCall, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ManagePrescriptionRefills from '../../../components/ManagePrescriptionRefills';
import ClinicInventoryWidget from '../../../components/ClinicInventoryWidget';
import HealthInsuranceWidget from '../../../components/HealthInsuranceWidget';
import ClinicQueueWidget from '../../../components/ClinicQueueWidget';
import ClinicalReportGeneratorWidget from '../../../components/ClinicalReportGeneratorWidget';
import ClinicLabRequestWidget from '../../../components/ClinicLabRequestWidget';
import ManageCampusWellnessFeed from '../../../components/ManageCampusWellnessFeed';
import ClinicFormBuilder from '../../../components/ClinicFormBuilder';
import DoctorStatusWidget from '../../../components/DoctorStatusWidget';

export default function ClinicDashboard() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  
  const [isSearching, setIsSearching] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const handleEmergencyAlert = () => {
    notify({
      title: 'EMERGENCY ALERT SENT',
      message: 'Campus security has been notified immediately.',
      type: 'error',
    });
    setShowEmergencyModal(true);
  };
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    prescription: '',
    status: 'Completed',
    notes: ''
  });

  useEffect(() => {
    fetchAllAppointments();
  }, [token]);

  const fetchAllAppointments = async () => {
    try {
      const res = await fetch('/api/clinic/appointments', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAllAppointments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/clinic/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Appointment status updated', type: 'success' });
        fetchAllAppointments();
      }
    } catch (err) {
      notify({ title: 'Error', message: 'Failed to update appointment', type: 'error' });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    setStudent(null);
    setRecords([]);
    setProfile(null);
    setDocuments([]);
    
    try {
      const res = await fetch(`/api/clinic/student/search/${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
        fetchStudentData(data.id);
      } else {
        notify({ title: 'Not Found', message: 'Student ID or Clinic Card not found', type: 'error' });
      }
    } catch (err) {
      notify({ title: 'Error', message: 'Search failed', type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      const [recordsRes, profileRes, docsRes] = await Promise.all([
        fetch(`/api/clinic/records/student/${studentId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/clinic/student/${studentId}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/clinic/student/${studentId}/documents`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (recordsRes.ok) setRecords(await recordsRes.json());
      if (profileRes.ok) setProfile(await profileRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
      
    } catch (err) {
      console.error(err);
    }
  };


  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    
    try {
      const url = editingRecordId ? `/api/clinic/records/${editingRecordId}` : '/api/clinic/records';
      const method = editingRecordId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          studentId: student.id,
          ...formData
        })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: `Clinic record ${editingRecordId ? 'updated' : 'added'}`, type: 'success' });
        setIsAddingRecord(false);
        setEditingRecordId(null);
        setFormData({
          symptoms: '', diagnosis: '', prescription: '', status: 'Completed', notes: ''
        });
        fetchStudentData(student.id);
      } else {
        notify({ title: 'Error', message: 'Failed to save record', type: 'error' });
      }
    } catch (err) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`/api/clinic/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Record deleted', type: 'success' });
        if (student) fetchStudentData(student.id);
      } else {
        notify({ title: 'Error', message: 'Failed to delete record', type: 'error' });
      }
    } catch (err) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const startEditRecord = (record: any) => {
    setFormData({
      symptoms: record.symptoms || '',
      diagnosis: record.diagnosis || '',
      prescription: record.prescription || '',
      status: record.status || 'Completed',
      notes: record.notes || ''
    });
    setEditingRecordId(record.id);
    setIsAddingRecord(true);
  };

  const handleDownloadPdf = (record: any) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text('Clinic Visit Summary', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 14, 30);
      
      // Patient Info
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Patient Information', 14, 45);
      
      autoTable(doc, {
        startY: 50,
        head: [['Name', 'ID', 'Blood Group', 'Genotype']],
        body: [[
          student?.name || 'N/A',
          student?.username || 'N/A',
          profile?.bloodGroup || 'N/A',
          profile?.genotype || 'N/A'
        ]],
        theme: 'plain',
        headStyles: { fillColor: [248, 250, 252], textColor: [100, 116, 139] },
        margin: { left: 14, right: 14 }
      });
      
      // Visit Details
      const finalY = (doc as any).lastAutoTable.finalY || 70;
      doc.setFontSize(12);
      doc.text('Visit Details', 14, finalY + 15);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Field', 'Details']],
        body: [
          ['Date', format(new Date(record.visitDate), 'MMM d, yyyy')],
          ['Status', record.status],
          ['Attended By', record.staffName || 'N/A'],
          ['Symptoms', record.symptoms || 'N/A'],
          ['Diagnosis', record.diagnosis || 'N/A'],
          ['Prescription', record.prescription || 'N/A'],
          ['Notes', record.notes || 'None']
        ],
        theme: 'striped',
        headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
        margin: { left: 14, right: 14 }
      });
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${i} of ${pageCount} • Official Clinic Record`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`Medical_Visit_${student?.username || 'Patient'}_${format(new Date(record.visitDate), 'yyyy-MM-dd')}.pdf`);
      notify({ title: 'Success', message: 'PDF downloaded successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'Failed to generate PDF', type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-rose-500" />
            Clinic Service
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Manage student health records and visits</p>
        </div>
        <button
          onClick={handleEmergencyAlert}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 animate-pulse"
        >
          <AlertOctagon className="w-6 h-6" />
          EMERGENCY ALERT
        </button>
      </div>

      <DoctorStatusWidget />

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Find Patient</h3>
        <form onSubmit={handleSearch} className="flex gap-4 max-w-xl">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Student ID or Username..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-slate-50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {!student && (<>
        <div className="mb-6">
          <ClinicQueueWidget appointments={allAppointments} />
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            Upcoming Appointments
          </h3>
          
          <div className="space-y-4">
            {allAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No appointments scheduled.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-sm text-slate-500">
                      <th className="pb-3 font-medium">Date & Time</th>
                      <th className="pb-3 font-medium">Patient</th>
                      <th className="pb-3 font-medium">Doctor</th>
                      <th className="pb-3 font-medium">Reason</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAppointments.map(appt => (
                      <tr key={appt.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                        <td className="py-3 text-sm text-slate-800">{format(new Date(appt.appointmentDate), 'MMM d, yyyy h:mm a')}</td>
                        <td className="py-3 text-sm text-slate-800 font-medium">
                          {appt.studentName}
                          <div className="text-xs text-slate-500 font-normal">{appt.studentUsername}</div>
                        </td>
                        <td className="py-3 text-sm text-slate-600">{appt.doctorName ? `Dr. ${appt.doctorName}` : 'Any'}</td>
                        <td className="py-3 text-sm text-slate-600 max-w-xs truncate" title={appt.reason}>{appt.reason}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${
                            appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                            appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                            appt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {appt.status === 'Scheduled' && (
                              <button
                                onClick={() => updateAppointmentStatus(appt.id, 'Confirmed')}
                                className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-xs font-medium transition-colors"
                              >
                                Confirm
                              </button>
                            )}
                            {(appt.status === 'Scheduled' || appt.status === 'Confirmed') && (
                              <button
                                onClick={() => updateAppointmentStatus(appt.id, 'Cancelled')}
                                className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            )}
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
        <div className="mt-6">
          <ManagePrescriptionRefills />
        </div>
        <div className="mt-6">
          <ClinicFormBuilder />
        </div>
        <div className="mt-6">
          <ClinicInventoryWidget />
        </div>
      </>)}

      {student && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Student Info & Profile */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-xl font-bold">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{student.name}</h3>
                  <p className="text-sm text-slate-500">{student.username}</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="block text-xs text-slate-500 mb-1">Blood Group</span>
                    <span className="font-semibold text-slate-800">{profile?.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="block text-xs text-slate-500 mb-1">Genotype</span>
                    <span className="font-semibold text-slate-800">{profile?.genotype || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-0.5">Allergies</span> <span className="font-medium text-slate-800">{profile?.allergies || 'None recorded'}</span></div>
                  <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-0.5">Past Conditions</span> <span className="font-medium text-slate-800">{profile?.pastConditions || 'None recorded'}</span></div>
                  <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-0.5">Current Meds</span> <span className="font-medium text-slate-800">{profile?.currentMedications || 'None recorded'}</span></div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 text-sm">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Emergency Contact</h4>
                  {profile?.emergencyContactName ? (
                    <div>
                      <div className="font-medium text-slate-800">{profile.emergencyContactName}</div>
                      <div className="text-slate-600">{profile.emergencyContactRelation} • {profile.emergencyContactPhone}</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs italic">No emergency contact</div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => { setEditingRecordId(null); setFormData({ symptoms: '', diagnosis: '', prescription: '', status: 'Completed', notes: '' }); setIsAddingRecord(true); }}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Medical Record
              </button>
            </div>
            
            {/* Medical Documents Box */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" />
                Medical Documents
              </h3>
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-sm">No documents found.</div>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border border-slate-100 rounded hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-medium text-xs text-slate-800 truncate">{doc.title}</div>
                          <div className="text-[10px] text-slate-500">{format(new Date(doc.createdAt), 'MMM d, yy')}</div>
                        </div>
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors" title="Download/View">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Health Insurance Box */}
            <HealthInsuranceWidget studentId={student.id} />

          </div>
          
          {/* Right Column: Medical History */}
          <div className="lg:col-span-2 space-y-6">
            <ClinicalReportGeneratorWidget 
              student={student} 
              onReportGenerated={() => fetchStudentData(student.id)} 
            />
            
            <ClinicLabRequestWidget student={student} />
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Clinic Visit History
              </h3>
              
              {records.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <HeartPulse className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>No medical records found for this student.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {records.map((record) => (
                    <div key={record.id} className="relative pl-6 pb-6 border-l-2 border-slate-100 last:border-0 last:pb-0">
                      <div className="absolute w-3 h-3 bg-rose-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-slate-800">Visit on {format(new Date(record.visitDate), 'MMM d, yyyy')}</h4>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => startEditRecord(record)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(record)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Download PDF"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              record.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              record.status === 'Referred' ? 'bg-amber-100 text-amber-700' :
                              record.status === 'Admitted' ? 'bg-rose-100 text-rose-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {record.status}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-0.5">Symptoms</span> <span className="text-slate-800">{record.symptoms}</span></div>
                          {record.diagnosis && <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-0.5">Diagnosis</span> <span className="text-slate-800">{record.diagnosis}</span></div>}
                          {record.prescription && (
                            <div className="mt-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                              <span className="text-indigo-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                                <Activity className="w-3.5 h-3.5" />
                                E-Prescription Issued
                              </span>
                              <span className="text-indigo-900 text-sm whitespace-pre-wrap">{record.prescription}</span>
                            </div>
                          )}
                          {record.notes && <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-0.5">Notes</span> <span className="text-slate-800">{record.notes}</span></div>}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-400 text-right">
                          Attended by: {record.staffName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">New Medical Record for {student?.name}</h3>
              <button onClick={() => setIsAddingRecord(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms *</label>
                <textarea 
                  required
                  value={formData.symptoms}
                  onChange={e => setFormData({...formData, symptoms: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                  <input 
                    type="text"
                    value={formData.diagnosis}
                    onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Active">Active (Observation)</option>
                    <option value="Referred">Referred</option>
                    <option value="Admitted">Admitted</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <label className="block text-sm font-semibold text-indigo-900">E-Prescription (Optional)</label>
                </div>
                <textarea 
                  value={formData.prescription}
                  onChange={e => setFormData({...formData, prescription: e.target.value})}
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="Enter medication, dosage, and instructions (will be sent to student's digital pharmacy record)"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingRecord(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-medium"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmergencyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border-2 border-red-500">
            <div className="bg-red-600 p-6 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertOctagon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Emergency Alert Sent!</h3>
              <p className="text-red-100">Campus security has been notified and is responding immediately.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-rose-600" />
                  Primary Emergency Contact
                </h4>
                
                {profile?.emergencyContactName ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Student Name</div>
                      <div className="font-bold text-lg text-slate-800 dark:text-slate-200">{student?.name}</div>
                    </div>
                    <div className="pt-2 border-t border-rose-200 dark:border-rose-800">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Contact Name</div>
                      <div className="font-bold text-lg text-slate-800 dark:text-slate-200">{profile.emergencyContactName}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{profile.emergencyContactRelation}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Phone Number</div>
                      <a href={`tel:${profile.emergencyContactPhone}`} className="text-2xl font-black text-rose-600 dark:text-rose-400 block hover:underline">
                        {profile.emergencyContactPhone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500 italic mb-2">No emergency contact info available.</p>
                    {student ? (
                      <p className="text-sm">No profile data for {student.name}.</p>
                    ) : (
                      <p className="text-sm">Search and select a student first.</p>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
