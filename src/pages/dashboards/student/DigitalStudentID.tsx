import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { BadgeCheck, Download, Share2, ScanLine, UserCircle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface StudentProfile {
  name: string;
  email: string;
  username: string; // Used as Matric Number
  phone: string;
  profilePicture: string | null;
}

export default function DigitalStudentID() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    fetch('/api/student/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setProfile(data);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      notify({ title: 'Error', message: 'Failed to load ID profile', type: 'error' });
      setIsLoading(false);
    });
  }, [token, notify]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="max-w-md mx-auto h-[500px] bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
      </div>
    );
  }

  if (!profile) return null;

  // Generate a verification string for the QR code
  const verificationData = JSON.stringify({
    id: profile.username,
    name: profile.name,
    type: 'Student',
    status: 'Active',
    verified: true,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <ScanLine className="w-8 h-8 text-indigo-600" />
          Digital Student ID
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Your official digital campus identification. Use this QR code for access verification.
        </p>
      </div>

      <div className="flex flex-col items-center">
        {/* ID Card Wrapper */}
        <div className="w-full max-w-sm relative group">
          {/* Card Hologram Effect (Subtle glow) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            {/* Card Header */}
            <div className="bg-indigo-600 p-6 text-center flex flex-col items-center">
              <img src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" alt="Smart Global Logo" className="w-36 h-36 mb-2 object-contain" />
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-2">
                <BadgeCheck className="w-4 h-4" /> Valid 2026/2027
              </div>
              <h3 className="text-white font-black text-xl tracking-tight">SMART GLOBAL COLLEGE OF TECHNOLOGY</h3>
              <p className="text-indigo-200 text-sm font-medium">Digital Identification</p>
            </div>

            {/* Card Body */}
            <div className="p-8 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-indigo-900 shadow-md">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <UserCircle className="w-20 h-20 text-slate-400 dark:text-slate-500" />
                    </div>
                  )}
                </div>
                {/* Active Status Badge */}
                <div className="absolute bottom-0 right-2 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="text-center w-full mb-8">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{profile.name}</h4>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wide mt-1 uppercase text-sm">
                  Student
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Matric No:</span>
                    <span className="text-slate-900 dark:text-white font-bold font-mono">{profile.username || 'PENDING'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty:</span>
                    <span className="text-slate-900 dark:text-white font-bold">Sciences</span>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 w-full flex flex-col items-center justify-center">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <QRCodeSVG 
                    value={verificationData} 
                    size={160} 
                    level="H" 
                    includeMargin={false}
                    className="rounded"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center flex items-center gap-1 font-medium">
                  <ScanLine className="w-3 h-3" /> Scan for real-time verification
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md">
            <Download className="w-4 h-4" /> Save to Device
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
