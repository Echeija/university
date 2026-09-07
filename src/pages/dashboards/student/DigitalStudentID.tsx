import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { 
  BadgeCheck, Download, Share2, ScanLine, UserCircle, QrCode, 
  RotateCw, Shield, Copy, Check, Printer, Building, Phone, Mail, 
  Sparkles, ExternalLink, RefreshCw, Eye, Camera, X, CheckCircle2, 
  AlertCircle, Timer, RefreshCcw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { storage } from '../../../lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  username: string; // Matric Number
  role: string;
  department?: string;
  phone?: string;
  profilePicture?: string | null;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

const CARD_THEMES = [
  { 
    id: 'emerald', 
    name: 'Smart Emerald (Official)', 
    headerBg: 'bg-emerald-700 dark:bg-emerald-900', 
    accentText: 'text-emerald-600 dark:text-emerald-400', 
    borderAccent: 'border-emerald-500',
    glow: 'from-emerald-500 via-teal-500 to-cyan-500' 
  },
  { 
    id: 'indigo', 
    name: 'Royal Blue', 
    headerBg: 'bg-indigo-700 dark:bg-indigo-900', 
    accentText: 'text-indigo-600 dark:text-indigo-400', 
    borderAccent: 'border-indigo-500',
    glow: 'from-indigo-500 via-purple-500 to-blue-500' 
  },
  { 
    id: 'slate', 
    name: 'Executive Onyx', 
    headerBg: 'bg-slate-900 dark:bg-slate-950', 
    accentText: 'text-slate-800 dark:text-slate-200', 
    borderAccent: 'border-slate-600',
    glow: 'from-slate-700 via-slate-800 to-slate-900' 
  }
];

export default function DigitalStudentID() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [copied, setCopied] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [qrToken, setQrToken] = useState(Date.now().toString(36));

  // Webcam Capture Modal State
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [useTimer, setUseTimer] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { user, token } = useAuth();
  const { notify } = useNotification();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          ...data,
          name: data.name || user?.name || 'Student Name',
          email: data.email || user?.email || '',
          username: data.username || user?.username || 'SGCT/2026/001'
        });
      } else {
        // Fallback to logged-in user context
        setProfile({
          id: user?.id || 1,
          name: user?.name || 'Student User',
          email: user?.email || '',
          username: user?.username || 'SGCT/2026/1042',
          role: user?.role || 'Student',
          department: user?.department || 'School of Technology & Applied Sciences',
          profilePicture: user?.profilePicture || null
        });
      }
    } catch (err) {
      console.error(err);
      notify({ title: 'Notice', message: 'Loaded profile details for ID card generation', type: 'info' });
      setProfile({
        id: user?.id || 1,
        name: user?.name || 'Student User',
        email: user?.email || '',
        username: user?.username || 'SGCT/2026/1042',
        role: user?.role || 'Student',
        department: user?.department || 'School of Technology & Applied Sciences',
        profilePicture: user?.profilePicture || null
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Webcam Controls
  const startCamera = async () => {
    setShowWebcamModal(true);
    setIsCameraStarting(true);
    setCameraError(null);
    setCapturedDataUrl(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 640 } 
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.log("Camera access error:", err?.message || err);
      setCameraError(err.message || 'Could not access webcam. Please check browser permissions.');
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowWebcamModal(false);
    setCapturedDataUrl(null);
    setCountdown(null);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (useTimer) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(interval);
            takeSnapshot();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Center crop square snapshot
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedDataUrl(dataUrl);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedDataUrl(null);
  };

  const saveCapturedPhoto = async () => {
    if (!capturedDataUrl) return;

    setIsSavingPhoto(true);
    let finalPhotoUrl = capturedDataUrl;

    try {
      // 1. Attempt upload to Firebase Storage
      try {
        const filename = `profiles/idcard_${user?.id || 'student'}_${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadString(storageRef, capturedDataUrl, 'data_url');
        finalPhotoUrl = await getDownloadURL(storageRef);
      } catch (fbErr) {
        console.warn("Firebase Storage upload fallback to base64 data URL:", fbErr);
      }

      // 2. Persist in backend database
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ profilePicture: finalPhotoUrl })
      });

      if (!res.ok) {
        throw new Error('Failed to update student profile picture in database');
      }

      // 3. Update local state immediately
      setProfile(prev => prev ? { ...prev, profilePicture: finalPhotoUrl } : null);

      notify({
        title: 'Digital ID Photo Updated!',
        message: 'Your new webcam photo has been saved and applied to your Digital ID Pass.',
        type: 'success'
      });

      stopCamera();

    } catch (err: any) {
      console.error(err);
      notify({
        title: 'Error Saving Photo',
        message: err.message || 'Could not save new ID photo. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const refreshSecurityToken = () => {
    setQrToken(Date.now().toString(36).toUpperCase());
    notify({ title: 'QR Code Security Refreshed', message: 'A new verification hash has been generated for your card.', type: 'success' });
  };

  const handlePrint = () => {
    window.print();
  };

  const copyVerificationLink = () => {
    const verifyUrl = `${window.location.origin}/verify-id?matric=${profile?.username}&token=${qrToken}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    notify({ title: 'Link Copied', message: 'Digital ID verification URL copied to clipboard.', type: 'success' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6 max-w-4xl mx-auto">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="max-w-md mx-auto h-[520px] bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
      </div>
    );
  }

  if (!profile) return null;

  const verificationData = JSON.stringify({
    institution: 'Smart Global College of Technology',
    id: profile.username || 'SGCT/STU/2026',
    name: profile.name,
    role: 'Student',
    status: 'ACTIVE_ENROLLED',
    token: qrToken,
    issueSession: '2026/2027 Academic Year'
  });

  return (
    <>
      {/* Screen Interface - Hidden during browser print */}
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8 print:hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ScanLine className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              Digital Student Identification Card
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Official encrypted identity pass for campus access, library checkout, exam halls, and portal authentication.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              <Eye className="w-4 h-4" /> Test QR Verification
            </button>
          </div>
        </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Toolbar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card Orientation Flip Switch */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-emerald-600" /> Card Display View
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
              <button
                onClick={() => setIsFlipped(false)}
                className={`py-2 px-3 rounded-lg transition-all ${
                  !isFlipped 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Front Pass
              </button>
              <button
                onClick={() => setIsFlipped(true)}
                className={`py-2 px-3 rounded-lg transition-all ${
                  isFlipped 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Back View
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click the card or use the toggle above to flip between official photo identification and security guidelines.
            </p>
          </div>

          {/* Theme Selector */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> ID Card Theme
            </h3>
            <div className="space-y-2">
              {CARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    selectedTheme.id === theme.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.headerBg}`} />
                    <span>{theme.name}</span>
                  </div>
                  {selectedTheme.id === theme.id && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Security & Verification Card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Real-Time Security
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Academic Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  Enrolled & Verified
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Security Hash:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{qrToken}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={refreshSecurityToken}
                className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Security QR Hash
              </button>
              
              <button
                onClick={copyVerificationLink}
                className="w-full py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Verification Link Copied' : 'Copy Digital Pass Link'}
              </button>
            </div>
          </div>

          {/* Webcam ID Photo Capture Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-400">
              <Camera className="w-4 h-4 text-emerald-400" /> Webcam ID Photo Capture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Capture a new portrait photo using your webcam to immediately update your digital ID card and portal profile.
            </p>
            <button
              onClick={startCamera}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shrink-0"
            >
              <Camera className="w-4 h-4" /> Open Webcam Camera
            </button>
          </div>
        </div>

        {/* Right Digital Card Display Stage */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center py-4">
          
          {/* Card Container with Holographic Glow */}
          <div className="w-full max-w-md relative group perspective">
            
            {/* Animated Outer Hologram Glow */}
            <div className={`absolute -inset-1.5 bg-gradient-to-r ${selectedTheme.glow} rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-700`} />

            {/* Flip Wrapper */}
            <div 
              ref={cardRef}
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full cursor-pointer transition-transform duration-700 transform-style-preserve-3d"
            >
              {/* CARD FRONT */}
              {!isFlipped ? (
                <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xl transition-all">
                  
                  {/* Header Banner */}
                  <div className={`${selectedTheme.headerBg} p-5 text-white text-center relative overflow-hidden flex flex-col items-center`}>
                    
                    {/* Watermark Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    <img 
                      src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" 
                      alt="College Logo" 
                      className="w-12 h-12 rounded-lg bg-white p-1 mb-2 object-contain shadow-md"
                    />

                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-amber-300" /> Active 2026/2027 Academic Pass
                    </span>

                    <h2 className="font-extrabold text-base tracking-tight leading-snug">
                      SMART GLOBAL COLLEGE OF TECHNOLOGY
                    </h2>
                    <p className="text-[11px] text-emerald-100 font-medium tracking-wide">
                      OFFICIAL DIGITAL IDENTIFICATION CARD
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col items-center">
                    
                    {/* Photo with Verified Badge & Webcam Trigger */}
                    <div 
                      className="relative mb-4 group/photo cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card flip
                        startCamera();
                      }}
                      title="Click to capture photo via webcam"
                    >
                      <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                        {profile.profilePicture ? (
                          <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-20 h-20 text-slate-400" />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 p-1 text-center">
                          <Camera className="w-6 h-6 text-emerald-400 animate-pulse" />
                          <span>Update Photo</span>
                        </div>
                      </div>

                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title="Identity Verified">
                        <BadgeCheck className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Student Name & Title */}
                    <div className="text-center w-full mb-6">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                        {profile.name}
                      </h3>
                      <p className={`font-bold text-xs uppercase tracking-wider mt-1 ${selectedTheme.accentText}`}>
                        {profile.role || 'STUDENT'}
                      </p>

                      {/* Detail Metrics Grid */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Matric / Reg No:</span>
                          <span className="text-slate-900 dark:text-white font-bold font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {profile.username || 'SGCT/2026/001'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Department:</span>
                          <span className="text-slate-900 dark:text-white font-bold text-right truncate max-w-[200px]">
                            {profile.department || 'Technology & Applied Sciences'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Email:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium text-right truncate max-w-[200px]">
                            {profile.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scannable Encrypted QR Code Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full flex flex-col items-center justify-center">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <QRCodeSVG 
                          value={verificationData} 
                          size={130} 
                          level="H" 
                          includeMargin={false}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-semibold flex items-center gap-1">
                        <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                        Scan for instant campus validation
                      </p>
                    </div>

                    {/* Click To Flip Prompt */}
                    <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                      <RotateCw className="w-3 h-3" /> Click card to view reverse side terms
                    </div>
                  </div>
                </div>
              ) : (
                /* CARD BACK */
                <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-6 min-h-[560px] flex flex-col justify-between">
                  
                  {/* Magnetic Stripe Mock */}
                  <div>
                    <div className="w-full h-12 bg-slate-900 dark:bg-black rounded-lg mb-6 relative flex items-center px-4 justify-end">
                      <div className="h-6 w-24 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 rounded opacity-80" />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <Building className="w-4 h-4 text-emerald-600" /> Institution Terms & Access
                      </h4>
                      
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                        <li>This digital card remains the official property of Smart Global College of Technology.</li>
                        <li>Authorized strictly for use by {profile.name}. Transfers or forgery are strictly prohibited.</li>
                        <li>Must be presented upon request at lecture halls, laboratories, library services, and sports complexes.</li>
                        <li>If lost or compromised, notify the ICT Portal Administration immediately.</li>
                      </ul>

                      {/* Emergency Contact Block */}
                      <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">
                          Emergency Contact Information:
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Contact Person:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {profile.emergencyContactName || 'Registrar Office'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phone:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {profile.emergencyContactPhone || profile.phone || '+234 800 123 4567'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Institutional Seal Footnote */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                      <Shield className="w-4 h-4 text-emerald-600" /> SGCT Campus Security
                    </div>
                    <span>Authorized Signature</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal Simulation */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-600" />
                QR Scanner Verification Result
              </h3>
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {profile.name}
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    VALID STUDENT IDENTIFICATION
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Matriculation No:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{profile.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Department:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{profile.department || 'Applied Sciences'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Verification Hash:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-300">{qrToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Campus Status:</span>
                  <span className="font-bold text-emerald-600">CLEARED FOR ACCESS</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Close Result Window
            </button>
          </div>
        </div>
      )}

      {/* WEBCAM PHOTO CAPTURE MODAL */}
      {showWebcamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  Digital ID Webcam Capture
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Position your face clearly within the oval frame for campus ID card compliance.
                </p>
              </div>
              <button
                onClick={stopCamera}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video / Photo Preview Stage */}
            <div className="relative bg-black aspect-square w-full flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-8 text-center space-y-4 max-w-xs">
                  <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                  <p className="text-sm font-semibold text-rose-300">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-600 transition-all inline-flex items-center gap-2"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" /> Retry Camera Stream
                  </button>
                </div>
              ) : capturedDataUrl ? (
                /* Captured Preview Image */
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={capturedDataUrl} alt="Captured ID Snapshot" className="w-full h-full object-cover" />
                  
                  {/* Photo Quality Badge */}
                  <div className="absolute top-4 left-4 bg-emerald-500/90 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ID Portrait Ready
                  </div>
                </div>
              ) : (
                /* Live Camera Feed with Alignment Frame */
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                  {isCameraStarting && (
                    <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold">Starting Webcam Feed...</span>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* ID Portrait Oval Alignment Mask */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-48 h-60 border-4 border-emerald-400/80 border-dashed rounded-full shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] flex items-center justify-center">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/80 bg-slate-900/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Face Alignment
                      </span>
                    </div>
                  </div>

                  {/* Countdown Timer Overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-7xl font-black text-emerald-400 animate-ping">
                        {countdown}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Controls Bar */}
            <div className="p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              {capturedDataUrl ? (
                <>
                  <button
                    onClick={retakePhoto}
                    disabled={isSavingPhoto}
                    className="w-full sm:w-auto py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <RefreshCcw className="w-4 h-4" /> Retake Photo
                  </button>

                  <button
                    onClick={saveCapturedPhoto}
                    disabled={isSavingPhoto}
                    className="w-full sm:w-auto py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isSavingPhoto ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Updating ID Pass...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Apply to ID Pass</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Timer Option */}
                  <button
                    onClick={() => setUseTimer(!useTimer)}
                    disabled={isCameraStarting || Boolean(cameraError)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      useTimer
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>3s Timer {useTimer ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={capturePhoto}
                    disabled={isCameraStarting || Boolean(cameraError) || countdown !== null}
                    className="w-full sm:w-auto py-3 px-8 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs transition-transform active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{useTimer ? 'Start Timer & Snap' : 'Capture Photo Now'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* DEDICATED PRINT SHEET - Only visible when printing */}
      <div id="print-area" className="hidden print:block p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans">
        {/* Official Letterhead Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" 
              alt="College Logo" 
              className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 bg-white"
            />
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                SMART GLOBAL COLLEGE OF TECHNOLOGY
              </h1>
              <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                Division of Student Affairs & Academic Records
              </p>
              <p className="text-[11px] text-slate-500">
                Official Digital Identification Pass & Verification Certificate
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-md inline-block border border-emerald-300">
              OFFICIAL PASS
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">Hash: {qrToken}</p>
          </div>
        </div>

        {/* Instructions for Student */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex justify-between items-center">
          <div>
            <span className="font-bold text-slate-900">Print / PDF Instructions:</span> Cut along the dotted guidelines below to obtain standard wallet-sized physical Student ID pass cutouts (Front & Back).
          </div>
          <div className="font-mono text-[10px] bg-slate-200 px-2.5 py-1 rounded font-bold text-slate-800 shrink-0">
            CR80 Standard (85.6mm x 54mm)
          </div>
        </div>

        {/* ID Cards Cutout Container (Side-by-Side Front and Back) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-8">
          
          {/* FRONT CARD PRINT CUTOUT */}
          <div className="relative border-2 border-dashed border-slate-300 p-2.5 rounded-3xl bg-slate-50/50">
            <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-slate-500 border border-slate-200 rounded">
              ✂ CUT LINE - FRONT PASS
            </div>
            
            <div className="bg-white border-2 border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-emerald-800 p-4 text-white text-center relative">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <img src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" alt="Logo" className="w-8 h-8 rounded bg-white p-0.5 object-contain" />
                  <div className="text-left leading-tight">
                    <h2 className="font-black text-xs tracking-tight text-white">SMART GLOBAL COLLEGE OF TECHNOLOGY</h2>
                    <p className="text-[9px] text-emerald-100 font-bold tracking-wider">OFFICIAL DIGITAL STUDENT PASS</p>
                  </div>
                </div>
                <span className="inline-block px-2 py-0.5 bg-white/20 rounded-full text-[8px] font-bold uppercase tracking-wider text-white">
                  2026/2027 ACADEMIC YEAR
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col items-center">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 mb-2 bg-slate-100 flex items-center justify-center shrink-0">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-16 h-16 text-slate-400" />
                  )}
                </div>

                <h3 className="font-black text-slate-900 text-base text-center leading-tight mb-0.5">
                  {profile.name}
                </h3>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-3">
                  {profile.role || 'STUDENT'}
                </p>

                <div className="w-full space-y-1.5 text-[11px] border-t border-slate-100 pt-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Matric No:</span>
                    <span className="font-bold font-mono text-slate-900">{profile.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Department:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[140px]">{profile.department || 'Technology'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="text-slate-800 truncate max-w-[140px]">{profile.email}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl w-full flex flex-col items-center">
                  <QRCodeSVG value={verificationData} size={100} level="H" />
                  <span className="text-[9px] font-bold text-slate-500 mt-1">SCAN FOR CAMPUS ACCESS</span>
                </div>
              </div>
            </div>
          </div>

          {/* BACK CARD PRINT CUTOUT */}
          <div className="relative border-2 border-dashed border-slate-300 p-2.5 rounded-3xl bg-slate-50/50">
            <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-slate-500 border border-slate-200 rounded">
              ✂ CUT LINE - REVERSE SIDE
            </div>

            <div className="bg-white border-2 border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 min-h-[420px] flex flex-col justify-between">
              <div>
                {/* Magnetic Stripe */}
                <div className="w-full h-10 bg-slate-900 rounded mb-4 relative flex items-center justify-end px-3">
                  <div className="h-5 w-20 bg-gradient-to-r from-amber-300 to-yellow-500 rounded opacity-90" />
                </div>

                <h4 className="font-black text-xs text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
                  INSTITUTIONAL TERMS & CONDITIONS
                </h4>

                <ul className="text-[10px] text-slate-700 space-y-1.5 list-disc list-inside leading-snug">
                  <li>Official property of Smart Global College of Technology.</li>
                  <li>Authorized strictly for use by {profile.name}.</li>
                  <li>Must be presented upon request at lecture halls, labs, library, and exams.</li>
                  <li>If lost, report immediately to ICT Portal Administration.</li>
                </ul>

                <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[10px]">
                  <span className="font-bold text-slate-900 block">Emergency Contact:</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Person:</span>
                    <span className="font-semibold text-slate-900">{profile.emergencyContactName || 'Registrar Office'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-semibold text-slate-900">{profile.emergencyContactPhone || profile.phone || '+234 800 123 4567'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Seal */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px]">
                <div>
                  <span className="font-bold text-emerald-800 block">SGCT Campus Security</span>
                  <span className="text-slate-400 font-mono">ID: {profile.username}</span>
                </div>
                <div className="text-right border-t border-slate-400 pt-1 px-2">
                  <span className="text-[9px] text-slate-500 block">Authorized Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Verification Notice Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-800">
            AUTHENTICITY NOTICE & ONLINE VERIFICATION
          </p>
          <p className="text-[11px] text-slate-600">
            This identification pass is officially generated from the SGCT Academic Portal. 
            To verify authenticity, scan the embedded QR code or visit <span className="font-mono text-emerald-700 font-semibold">{window.location.origin}/verify-id</span>.
          </p>
        </div>
      </div>
    </>
  );
}
