import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, VideoOff, MonitorUp, PhoneOff, Users, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LiveLecture() {
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active seminar state (mock)
  const activeSeminar = {
    title: 'Advanced Software Engineering',
    lecturer: 'Dr. Sarah Johnson',
    participants: 124,
    startTime: '10:00 AM'
  };

  const startMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsJoined(true);
      setError(null);
    } catch (err: any) {
      console.log('Error accessing media devices.', err?.message || err);
      setError('Could not access camera/microphone. Please ensure permissions are granted.');
    }
  };

  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsJoined(false);
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Live Lecture</h2>
          <p className="text-slate-500 dark:text-slate-400">Join ongoing seminars and interact in real-time.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 shrink-0">
          {error}
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative flex flex-col shadow-xl">
          {!isJoined ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Camera className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{activeSeminar.title}</h3>
              <p className="text-slate-400 mb-8">with {activeSeminar.lecturer} • Started at {activeSeminar.startTime}</p>
              
              <button
                onClick={startMedia}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Join with Camera & Mic
              </button>
            </div>
          ) : (
            <>
              {/* Lecture View (Mock) & Self View */}
              <div className="flex-1 relative bg-black">
                {/* Mock Lecturer Video (Main) */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-slate-600 flex flex-col items-center">
                     <Users className="w-16 h-16 mb-4 opacity-50" />
                     <p>Waiting for host video stream...</p>
                   </div>
                </div>
                
                {/* Self View (Picture in Picture style) */}
                <div className="absolute bottom-6 right-6 w-48 sm:w-64 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user?.name?.charAt(0)}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur text-white text-xs rounded font-medium flex items-center gap-1">
                    {isMicMuted && <MicOff className="w-3 h-3 text-red-400" />}
                    You
                  </div>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="h-20 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-6 shrink-0">
                <div className="text-white hidden sm:block">
                  <h4 className="font-bold text-sm">{activeSeminar.title}</h4>
                  <p className="text-xs text-slate-400">{activeSeminar.lecturer}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleMic}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMicMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                  >
                    {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                  </button>
                  <button className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors hidden sm:flex">
                    <MonitorUp className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={stopMedia}
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors ml-2"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Chat / Participants */}
        <div className="w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden shrink-0 hidden lg:flex">
          <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
            <button className="flex-1 py-2 text-sm font-bold text-emerald-600 border-b-2 border-emerald-600 text-center">
              Chat
            </button>
            <button className="flex-1 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-center flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              {activeSeminar.participants}
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="text-center text-xs text-slate-500 my-2">Chat started at {activeSeminar.startTime}</div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg rounded-tl-none max-w-[90%]">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dr. Johnson</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Welcome everyone, we will start in 5 minutes.</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg rounded-tr-none ml-auto max-w-[90%]">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">You</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">Hello!</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 shrink-0 bg-slate-50 dark:bg-slate-900/50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                disabled={!isJoined}
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md disabled:opacity-50"
                disabled={!isJoined}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
