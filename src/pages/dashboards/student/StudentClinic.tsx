import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { HeartPulse, FileText, Calendar, Activity, Info, Upload, Edit2, Save, X, Paperclip, Download, Printer, AlertOctagon, PhoneCall } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HealthInsuranceWidget from '../../../components/HealthInsuranceWidget';
import HealthCertificateWidget from '../../../components/HealthCertificateWidget';
import WellnessTrackerWidget from '../../../components/WellnessTrackerWidget';
import MedicationReminderWidget from '../../../components/MedicationReminderWidget';
import CampusWellnessFeedWidget from '../../../components/CampusWellnessFeedWidget';
import ClinicSurveyModal from '../../../components/ClinicSurveyModal';
import ClinicAIChatbot from '../../../components/ClinicAIChatbot';

export default function StudentClinic() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  
  const [records, setRecords] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [reschedulingApptId, setReschedulingApptId] = useState<number | null>(null);
  const [ratingApptId, setRatingApptId] = useState<number | null>(null);
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    appointmentDate: '',
    reason: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    bloodGroup: '',
    genotype: '',
    allergies: '',
    pastConditions: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    immunizations: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', file: null as File | null });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const handleEmergencyAlert = () => {
    notify({
      title: 'EMERGENCY ALERT SENT',
      message: 'Campus security has been notified immediately.',
      type: 'error',
    });
    setShowEmergencyModal(true);
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
    
    // Real-time polling for doctor status
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/clinic/doctors`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setDoctors(await res.json());
      } catch (err) {}
    }, 5000);
    
    return () => clearInterval(interval);
  }, [token, user?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recordsRes, profileRes, docsRes, apptsRes, docsListRes] = await Promise.all([
        fetch(`/api/clinic/records/student/${user?.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/clinic/student/${user?.id}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/clinic/student/${user?.id}/documents`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/clinic/appointments/student/${user?.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/clinic/doctors`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (recordsRes.ok) setRecords(await recordsRes.json());
      if (profileRes.ok) {
        const p = await profileRes.json();
        setProfile(p);
        setProfileData({
          bloodGroup: p.bloodGroup || '',
          genotype: p.genotype || '',
          allergies: p.allergies || '',
          pastConditions: p.pastConditions || '',
          currentMedications: p.currentMedications || '',
          emergencyContactName: p.emergencyContactName || '',
          emergencyContactPhone: p.emergencyContactPhone || '', immunizations: p.immunizations || '',
          emergencyContactRelation: p.emergencyContactRelation || ''
        });
      }
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (apptsRes && apptsRes.ok) setAppointments(await apptsRes.json());
      if (docsListRes && docsListRes.ok) setDoctors(await docsListRes.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`/api/clinic/student/${user?.id}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(profileData)
      });
      
      if (res.ok) {
        setProfile(await res.json());
        setIsEditingProfile(false);
        notify({ title: 'Success', message: 'Medical profile updated', type: 'success' });
      }
    } catch (err) {
      notify({ title: 'Error', message: 'Failed to update profile', type: 'error' });
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', uploadData.file);

    try {
      // 1. Upload file
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { fileUrl } = await uploadRes.json();

      // 2. Create document record
      const docRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: uploadData.title,
          description: uploadData.description,
          category: 'Medical',
          fileUrl,
          fileType: uploadData.file.type || 'application/octet-stream',
          fileSize: uploadData.file.size
        })
      });

      if (docRes.ok) {
        notify({ title: 'Success', message: 'Medical document uploaded', type: 'success' });
        setUploadData({ title: '', description: '', file: null });
        fetchData();
      }
    } catch (err) {
      notify({ title: 'Error', message: 'Failed to upload document', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = reschedulingApptId 
        ? `/api/clinic/appointments/${reschedulingApptId}/reschedule` 
        : '/api/clinic/appointments';
      const method = reschedulingApptId ? 'PUT' : 'POST';
        
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: user?.id,
          doctorId: bookingData.doctorId || null,
          appointmentDate: bookingData.appointmentDate,
          reason: bookingData.reason
        })
      });
      if (res.ok) {
        notify({ title: 'Success', message: reschedulingApptId ? 'Appointment rescheduled successfully' : 'Appointment booked successfully', type: 'success' });
        setIsBooking(false);
        setReschedulingApptId(null);
        setBookingData({ doctorId: '', appointmentDate: '', reason: '' });
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        notify({ title: 'Error', message: data.error || `Failed to ${reschedulingApptId ? 'reschedule' : 'book'} appointment`, type: 'error' });
      }
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const openRescheduleModal = (appt: any) => {
    setReschedulingApptId(appt.id);
    setBookingData({
      doctorId: appt.doctorId?.toString() || '',
      appointmentDate: new Date(appt.appointmentDate).toISOString().slice(0, 16),
      reason: appt.reason
    });
    setIsBooking(true);
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
          user?.name || 'N/A',
          user?.username || 'N/A',
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
      
      doc.save(`Medical_Visit_${format(new Date(record.visitDate), 'yyyy-MM-dd')}.pdf`);
      notify({ title: 'Success', message: 'PDF downloaded successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'Failed to generate PDF', type: 'error' });
    }
  };

  const handlePrintOfficialRecord = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Official Medical Record', 14, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 14, 32);
      
      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 38, 196, 38);
      
      // Patient Info
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Patient Information', 14, 50);
      
      autoTable(doc, {
        startY: 55,
        head: [['Name', 'ID', 'Blood Group', 'Genotype']],
        body: [[
          user?.name || 'N/A',
          user?.username || 'N/A',
          profile?.bloodGroup || 'N/A',
          profile?.genotype || 'N/A'
        ]],
        theme: 'plain',
        headStyles: { fillColor: [248, 250, 252], textColor: [100, 116, 139] },
        margin: { left: 14, right: 14 }
      });
      
      // Medical Profile (Allergies & Conditions)
      const finalY1 = (doc as any).lastAutoTable.finalY || 80;
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Immunization & Allergy Profile', 14, finalY1 + 15);
      
      autoTable(doc, {
        startY: finalY1 + 20,
        head: [['Category', 'Details']],
        body: [
          ['Allergies', profile?.allergies || 'None recorded'],
          ['Past Conditions', profile?.pastConditions || 'None recorded'],
          ['Current Medications', profile?.currentMedications || 'None recorded'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
        margin: { left: 14, right: 14 }
      });
      
      // Emergency Contact
      const finalY2 = (doc as any).lastAutoTable.finalY || 130;
      doc.setFontSize(14);
      doc.text('Emergency Contact', 14, finalY2 + 15);
      
      autoTable(doc, {
        startY: finalY2 + 20,
        head: [['Name', 'Relationship', 'Phone']],
        body: [[
          profile?.emergencyContactName || 'N/A',
          profile?.emergencyContactRelation || 'N/A',
          profile?.emergencyContactPhone || 'N/A'
        ]],
        theme: 'plain',
        headStyles: { fillColor: [248, 250, 252], textColor: [100, 116, 139] },
        margin: { left: 14, right: 14 }
      });
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${i} of ${pageCount} • Official University Clinic Record`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`Official_Medical_Record_${user?.username || 'Student'}.pdf`);
      notify({ title: 'Success', message: 'Official record downloaded', type: 'success' });
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'Failed to generate official record PDF', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-rose-500" />
            Digital Medical History
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your medical profile and view clinical records</p>
        </div>
        <button
          onClick={handleEmergencyAlert}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 animate-pulse"
        >
          <AlertOctagon className="w-6 h-6" />
          EMERGENCY ALERT
        </button>
      </div>

      <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-rose-400/20">
          <HeartPulse className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm border border-white/30">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-2">{user?.name}</h3>
            <div className="flex flex-wrap gap-4 text-rose-100">
              <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-sm">
                <Info className="w-4 h-4" /> ID: {user?.username}
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-sm">
                <Activity className="w-4 h-4" /> Blood Group: {profile?.bloodGroup || 'Not specified'}
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-sm">
                <Activity className="w-4 h-4" /> Genotype: {profile?.genotype || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile & Docs */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-400" />
                Medical Profile
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintOfficialRecord} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Print Official Medical Record">
                  <Printer className="w-4 h-4" />
                </button>
                {!isEditingProfile ? (
                  <button onClick={() => setIsEditingProfile(true)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Edit Profile">
                    <Edit2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => setIsEditingProfile(false)} className="p-1.5 text-slate-400 hover:text-slate-600" title="Cancel">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Blood Group</label>
                    <select value={profileData.bloodGroup} onChange={e => setProfileData({...profileData, bloodGroup: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded">
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Genotype</label>
                    <select value={profileData.genotype} onChange={e => setProfileData({...profileData, genotype: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded">
                      <option value="">Select</option>
                      {['AA','AS','SS','AC','SC'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Allergies</label>
                  <input type="text" value={profileData.allergies} onChange={e => setProfileData({...profileData, allergies: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded" placeholder="E.g. Penicillin, Peanuts" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Past Conditions</label>
                  <input type="text" value={profileData.pastConditions} onChange={e => setProfileData({...profileData, pastConditions: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded" placeholder="E.g. Asthma" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Current Medications</label>
                  <input type="text" value={profileData.currentMedications} onChange={e => setProfileData({...profileData, currentMedications: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Immunizations</label>
                  <input type="text" value={profileData.immunizations} onChange={e => setProfileData({...profileData, immunizations: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded" placeholder="E.g. COVID-19, Yellow Fever" />
                </div>
                
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-800 mb-2 uppercase tracking-wider">Emergency Contact</h4>
                  <input type="text" value={profileData.emergencyContactName} onChange={e => setProfileData({...profileData, emergencyContactName: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded mb-2" placeholder="Contact Name" />
                  <input type="tel" value={profileData.emergencyContactPhone} onChange={e => setProfileData({...profileData, emergencyContactPhone: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded mb-2" placeholder="Contact Phone" />
                  <input type="text" value={profileData.emergencyContactRelation} onChange={e => setProfileData({...profileData, emergencyContactRelation: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded" placeholder="Relationship (e.g. Mother)" />
                </div>
                
                <button onClick={handleSaveProfile} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded font-medium hover:bg-rose-700">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div><span className="text-slate-500">Allergies:</span> <span className="font-medium text-slate-800">{profile?.allergies || 'None recorded'}</span></div>
                <div><span className="text-slate-500">Past Conditions:</span> <span className="font-medium text-slate-800">{profile?.pastConditions || 'None recorded'}</span></div>
                <div><span className="text-slate-500">Immunizations:</span> <span className="font-medium text-slate-800">{profile?.immunizations || 'None recorded'}</span></div>
                <div><span className="text-slate-500">Current Meds:</span> <span className="font-medium text-slate-800">{profile?.currentMedications || 'None recorded'}</span></div>
                
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Emergency Contact</h4>
                  {profile?.emergencyContactName ? (
                    <div>
                      <div className="font-medium text-slate-800">{profile.emergencyContactName}</div>
                      <div className="text-slate-600">{profile.emergencyContactRelation} • {profile.emergencyContactPhone}</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs italic">No emergency contact added</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-slate-400" />
              Medical Documents
            </h3>
            
            <form onSubmit={handleFileUpload} className="mb-6 space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <input required type="text" placeholder="Document Title (e.g. Lab Results)" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded bg-white" />
              <input required type="file" onChange={e => setUploadData({...uploadData, file: e.target.files?.[0] || null})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100" />
              <button disabled={isUploading || !uploadData.file} type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded font-medium hover:bg-slate-700 disabled:opacity-50">
                <Upload className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
            
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">No documents uploaded yet.</div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-sm text-slate-800 truncate">{doc.title}</div>
                        <div className="text-xs text-slate-500">{format(new Date(doc.createdAt), 'MMM d, yyyy')}</div>
                      </div>
                    </div>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Download/View">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <WellnessTrackerWidget />
          <div className="mt-6">
            <MedicationReminderWidget />
          </div>
          <div className="mt-6">
            <CampusWellnessFeedWidget />
          </div>
          <div className="mt-6">
            <HealthInsuranceWidget />
          </div>
          <div className="mt-6">
            <HealthCertificateWidget profile={profile} />
          </div>
        </div>
        {/* Appointments Box */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              My Appointments
            </h3>
            <button
              onClick={() => setIsBooking(true)}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-medium transition-colors"
            >
              Book New
            </button>
          </div>
          
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-sm">No upcoming appointments.</div>
            ) : (
              appointments.map(appt => (
                <div key={appt.id} className="p-3 border border-slate-100 rounded-lg hover:border-rose-100 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-slate-800 text-sm">{format(new Date(appt.appointmentDate), 'MMM d, yyyy h:mm a')}</div>
                    <div className="flex gap-2 items-center">
                      {(appt.status === 'Scheduled' || appt.status === 'Confirmed') && (
                        <button
                          onClick={() => openRescheduleModal(appt)}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition-colors"
                        >
                          Reschedule
                        </button>
                      )}
                      {appt.status === 'Completed' && (
                        <button
                          onClick={() => setRatingApptId(appt.id)}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 transition-colors"
                        >
                          Rate Visit
                        </button>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                        appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        appt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">With: {appt.doctorName || 'Any Available Specialist'}</div>
                  <div className="text-xs text-slate-600 truncate">Reason: {appt.reason}</div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* Right Column: Medical History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-full">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Clinic Visit History
            </h3>
            
            {records.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>You have no medical records on file.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {records.map((record) => (
                  <div key={record.id} className="relative pl-6 pb-6 border-l-2 border-slate-100 last:border-0 last:pb-0">
                    <div className="absolute w-3 h-3 bg-rose-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-lg">Visit on {format(new Date(record.visitDate), 'MMM d, yyyy')}</h4>
                          <p className="text-sm text-slate-500">Attended by {record.staffName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDownloadPdf(record)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            record.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            record.status === 'Referred' ? 'bg-amber-100 text-amber-700' :
                            record.status === 'Admitted' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Symptoms</span>
                          <p className="text-slate-800 text-sm">{record.symptoms}</p>
                        </div>
                        {record.diagnosis && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Diagnosis</span>
                            <p className="text-slate-800 text-sm">{record.diagnosis}</p>
                          </div>
                        )}
                        {record.prescription && (
                          <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100/50 mt-2">
                            <div className="flex items-center justify-between mb-3 border-b border-indigo-200/50 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
                                  <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-indigo-900 block">Digital E-Prescription</span>
                                  <span className="text-xs text-indigo-600">Issued by {record.staffName || 'Clinic Doctor'}</span>
                                </div>
                              </div>
                              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                record.prescriptionStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                record.prescriptionStatus === 'Ready for Pickup' ? 'bg-blue-100 text-blue-700' :
                                record.prescriptionStatus === 'Collected' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {record.prescriptionStatus || 'Pending'}
                              </span>
                            </div>
                            <div className="bg-white/60 p-3 rounded-lg border border-indigo-50/50 mb-3">
                              <p className="text-slate-800 text-sm whitespace-pre-wrap font-medium">{record.prescription}</p>
                            </div>
                            <div className="flex items-start gap-2 bg-indigo-100/50 p-3 rounded-lg text-xs text-indigo-800">
                              <Info className="w-4 h-4 shrink-0 mt-0.5" />
                              {record.prescriptionStatus === 'Ready for Pickup' ? (
                                <p><strong>Ready for Pickup:</strong> Your prescription is ready! Please present your University ID at the Campus Pharmacy (Building C, Ground Floor) to collect these medications.</p>
                              ) : record.prescriptionStatus === 'Collected' ? (
                                <p><strong>Collected:</strong> You have collected this prescription. Ensure you follow the dosage instructions provided by the doctor.</p>
                              ) : (
                                <p><strong>Processing:</strong> Your prescription has been sent to the pharmacy. Wait until it is marked as "Ready for Pickup" before visiting the Campus Pharmacy.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
      {isBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{reschedulingApptId ? "Reschedule Appointment" : "Book Appointment"}</h3>
              <button onClick={() => { setIsBooking(false); setReschedulingApptId(null); setBookingData({ doctorId: '', appointmentDate: '', reason: '' }); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialist (Optional)</label>
                <select
                  value={bookingData.doctorId}
                  onChange={e => setBookingData({...bookingData, doctorId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="">Any Available Specialist</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.name} {doc.doctorStatus ? `(${doc.doctorStatus})` : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingData.appointmentDate}
                  onChange={e => setBookingData({...bookingData, appointmentDate: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit *</label>
                <textarea
                  required
                  rows={3}
                  value={bookingData.reason}
                  onChange={e => setBookingData({...bookingData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Describe your symptoms or reason for appointment"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsBooking(false); setReschedulingApptId(null); setBookingData({ doctorId: '', appointmentDate: '', reason: '' }); }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-medium"
                >
                  {reschedulingApptId ? "Confirm Reschedule" : "Confirm Booking"}
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
                    <p className="text-slate-500 italic mb-2">No emergency contact info provided.</p>
                    <p className="text-xs text-rose-600 font-medium">Please update your profile when safe.</p>
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

    
      <ClinicAIChatbot />
    </div>
  );
}
