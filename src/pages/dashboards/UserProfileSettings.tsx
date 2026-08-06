import React, { useState, useRef, useEffect } from 'react';
import { Settings, Save, User, Lock, Bell, Mail, Camera, Upload, X, Eye, Award, Target, CheckCircle2, TrendingUp, Calendar, BookOpen, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSupabaseTheme } from '../../hooks/useSupabaseTheme';
import { useNotification } from '../../contexts/NotificationContext';
import { storage } from '../../lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';

export default function UserProfileSettings() {
  const { user, updateUser, token } = useAuth();
  const { notify } = useNotification();
  const { theme, setTheme, highContrast, toggleHighContrast, textScale, setTextScale } = useTheme();
  const { updateThemeInSupabase } = useSupabaseTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    updateThemeInSupabase(newTheme);
  };
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'accessibility' | 'achievements' | 'id-card'>('profile');
  const [passportUrl, setPassportUrl] = useState<string | null>(user?.profilePicture || null);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [faculty, setFaculty] = useState(user?.faculty || '');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error(err);
      notify({ title: 'Camera Error', message: 'Could not access the camera.', type: 'error' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Mirror the canvas to match the video display
        context.translate(canvasRef.current.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPassportUrl(dataUrl);
        stopCamera();
        uploadPhoto(dataUrl);
      }
    }
  };

  const uploadPhoto = async (dataUrl: string) => {
    if (!user) return;
    setIsUploading(true);
    try {
      const response = await fetch('/api/upload/base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          filename: `passport-${user.id || 'default'}.jpg`,
          base64Data: dataUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setPassportUrl(data.fileUrl);
      
      // Auto-save the new profile picture
      try {
        const updateRes = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            profilePicture: data.fileUrl,
            name: user.name, // Keep existing name
            phone: user.phone, // Keep existing phone
            department: user.department, // Keep existing
            faculty: user.faculty // Keep existing
          })
        });
        
        if (updateRes.ok) {
          const updateData = await updateRes.json();
          if (updateData.success) {
            updateUser(updateData.user);
          }
        }
      } catch (e) {
        console.error('Failed to auto-save profile picture:', e);
      }
      
      notify({ title: 'Success', message: 'Profile picture updated successfully.', type: 'success' });
    } catch (error) {
      console.error(error);
      notify({ title: 'Upload Failed', message: 'Failed to upload photo.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notify({ title: "Error", message: "File size must be less than 2MB", type: "error" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        uploadPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profilePicture: passportUrl,
          name,
          phone,
          department,
          faculty
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        updateUser(data.user);
        notify({
          title: 'Settings Saved',
          message: 'Your profile settings have been successfully updated.',
          type: 'success'
        });
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (e: any) {
      notify({
        title: 'Error',
        message: e.message,
        type: 'error'
      });
    }
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-600" />
            Profile Settings
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account details and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors font-bold ${activeTab === 'profile' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <User className="w-5 h-5" /> Personal Info
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors font-bold ${activeTab === 'security' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Lock className="w-5 h-5" /> Security
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors font-bold ${activeTab === 'notifications' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('accessibility')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors font-bold ${activeTab === 'accessibility' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Eye className="w-5 h-5" />
            Accessibility
          </button>


          <button 
            onClick={() => setActiveTab('achievements')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors font-bold ${activeTab === 'achievements' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Award className="w-5 h-5" />
            Achievements
          </button>
          
          <button 
            onClick={() => setActiveTab('id-card')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors font-bold ${activeTab === 'id-card' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <CreditCard className="w-5 h-5" />
            Digital ID Card
          </button>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          
          {activeTab === 'id-card' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Digital Student ID</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Use this QR code for easy campus scanning and verification.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-8">
                <div className="w-80 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative">
                  <div className="bg-emerald-600 p-4 text-center">
                    <h2 className="text-white font-black text-xl tracking-wider uppercase">University ID</h2>
                    <p className="text-emerald-100 text-xs font-medium tracking-widest mt-1">STUDENT CARD</p>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 mb-4 -mt-12 z-10 relative">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user?.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full text-slate-400 p-4" />
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-1">{user?.name || 'Student Name'}</h3>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">{user?.role || 'Student'}</p>
                    
                    <div className="w-full grid grid-cols-2 gap-4 text-left text-sm mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ID Number</p>
                        <p className="font-bold text-slate-900 dark:text-white">{user?.id?.toString()?.substring(0, 8).toUpperCase() || 'STD-000000'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issued Date</p>
                        <p className="font-bold text-slate-900 dark:text-white">{new Date().getFullYear()}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                      <QRCodeSVG 
                        value={JSON.stringify({ id: user?.id, name: user?.name, role: user?.role })}
                        size={120}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-4 text-center">Scan for verification</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student Achievements</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Track your progress and earn badges for consistent performance.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm rounded-full">Level 4</span>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Perfect Attendance</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">You have attended 95% of your classes this semester.</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <p className="text-xs text-right text-slate-500 dark:text-slate-400 mt-2">95 / 100 Days</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-sm rounded-full">Level 3</span>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">On-Time Submissions</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Consistently submitted assignments before the deadline.</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <p className="text-xs text-right text-slate-500 dark:text-slate-400 mt-2">15 / 17 Assignments</p>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Earned Badges</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent dark:from-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 mb-3 relative">
                    <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/30 rounded-full animate-pulse"></div>
                    <div className="absolute inset-1 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white text-center">Early Bird</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">Submitted 5 assignments early</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent dark:from-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 mb-3 relative">
                    <div className="absolute inset-1 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white text-center">Sharpshooter</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">100% on 3 Quizzes</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 mb-3 relative">
                    <div className="absolute inset-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-inner">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white text-center">Top 10%</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">Class Rank</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 opacity-60 grayscale cursor-not-allowed">
                  <div className="w-16 h-16 mb-3 relative">
                    <div className="absolute inset-1 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8 text-slate-500" />
                    </div>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white text-center">Scholar</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">4.0 GPA for a semester</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              
              {isCameraActive && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl max-w-lg w-full flex flex-col items-center">
                    <div className="flex justify-between items-center w-full mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">Take Photo</h3>
                      <button onClick={stopCamera} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl bg-black mb-4 h-64 object-cover -scale-x-100" />
                    <canvas ref={canvasRef} className="hidden" />
                    <button 
                      onClick={capturePhoto}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Capture
                    </button>
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Personal Information</h3>
              
              {/* Passport Photo Upload */}
              <div className="mb-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className={`w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center ${passportUrl ? '' : 'border-dashed border-slate-300 dark:border-slate-600'}`}>
                    {passportUrl ? (
                      <img src={passportUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Profile Passport</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 max-w-sm">
                    Upload a clear, recent passport-sized photograph. Max size 2MB. Accepted formats: JPG, PNG.
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </button>
                    <button 
                      onClick={startCamera}
                      className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                    {passportUrl && (
                      <button 
                        onClick={() => setPassportUrl(null)}
                        className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="email" className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white" value={user?.email || ''} readOnly disabled />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                  <input type="tel" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 012-3456" />
                </div>
                
                {['Student', 'Lecturer'].includes(user?.role || '') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Faculty</label>
                      <input 
                        type="text" 
                        value={faculty} 
                        onChange={(e) => setFaculty(e.target.value)} 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white" 
                        placeholder="e.g. Science" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                      <input 
                        type="text" 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)} 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white" 
                        placeholder="e.g. Computer Science" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Security Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>
          )}

          
          {activeTab === 'accessibility' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Accessibility Settings</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Customize the portal interface for better readability.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">High Contrast Mode</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Increase contrast between text and background.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={highContrast}
                      onChange={() => {
                        toggleHighContrast();
                        notify({ title: 'Accessibility Updated', message: 'High contrast mode toggled.', type: 'success' });
                      }}
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Text Scaling</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Adjust the size of text throughout the portal.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {(['normal', 'large', 'extra-large'] as const).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => {
                          setTextScale(scale);
                          notify({ title: 'Accessibility Updated', message: `Text scale set to ${scale}.`, type: 'success' });
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold border transition-colors ${textScale === scale ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        {scale.charAt(0).toUpperCase() + scale.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Email Notifications</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive important academic updates via email.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">SMS Alerts</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get text messages for urgent announcements.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
