import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, ShieldAlert, Camera, Save, X, CheckCircle2, UploadCloud, BellRing, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { storage } from '../../../lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function StudentProfile() {
  const [formData, setFormData] = useState({
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    paymentRemindersEmail: true,
    paymentRemindersSMS: false,
    profilePicture: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const { token, user } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    fetch('/api/student/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData(prev => ({ ...prev, ...data }));
        }
      })
      .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) })
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleToggle = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Profile updated successfully', type: 'success' });
      } else {
        notify({ title: 'Error', message: 'Failed to update profile', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Camera Functions
  const startCamera = async () => {
    setShowCamera(true);
    setIsCameraStarting(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Camera Error', message: 'Could not access camera', type: 'error' });
      setShowCamera(false);
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Upload to Firebase
        try {
          setIsSaving(true);
          stopCamera();
          
          const filename = `profiles/${user?.id}_${Date.now()}.jpg`;
          const storageRef = ref(storage, filename);
          
          await uploadString(storageRef, dataUrl, 'data_url');
          const downloadUrl = await getDownloadURL(storageRef);
          
          setFormData(prev => ({ ...prev, profilePicture: downloadUrl }));
          notify({ title: 'Success', message: 'Photo captured and uploaded', type: 'success' });
          
        } catch (e) {
          console.error(e);
          notify({ title: 'Error', message: 'Failed to upload photo', type: 'error' });
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-indigo-600" />
          My Profile
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal and emergency contact information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Photo */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 mb-6 border-4 border-white dark:border-slate-800 shadow-lg relative">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-500">
                  <User className="w-20 h-20" />
                </div>
              )}
            </div>
            
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl transition-colors w-full justify-center"
            >
              <Camera className="w-4 h-4" /> 
              Take Photo
            </button>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <Phone className="w-5 h-5 text-indigo-500" />
              Contact Information
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:text-white"
                placeholder="e.g. +1 234 567 8900"
              />
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:text-white"
                  placeholder="Contact Person's Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:text-white"
                  placeholder="Emergency Phone"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Relationship</label>
                <input
                  type="text"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:text-white"
                  placeholder="e.g. Parent, Sibling, Spouse"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-md w-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-500" />
                Take Profile Photo
              </h3>
              <button 
                onClick={stopCamera}
                className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative bg-black aspect-[3/4] sm:aspect-square flex flex-col justify-center">
              {isCameraStarting && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  Starting camera...
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute inset-0 border-[6px] border-black/20 pointer-events-none rounded-full scale-[0.8] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
              <button
                onClick={takePhoto}
                disabled={isCameraStarting}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 transition-transform active:scale-95 border-4 border-indigo-200 dark:border-indigo-900"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
