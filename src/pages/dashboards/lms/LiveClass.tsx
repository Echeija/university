import { useState, useEffect, FormEvent, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Video, Mic, MicOff, VideoOff, MessageSquare, Users, PhoneOff, Share2, Hand, Settings, Maximize, PenTool, Disc2, Square, LayoutGrid, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Whiteboard from '../../../components/Whiteboard';

interface LiveClassProps {
  courseCode: string;
  courseTitle: string;
  onLeave: (recordingDuration?: number) => void;
}

export default function LiveClass({ courseCode, courseTitle, onLeave }: LiveClassProps) {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [messages, setMessages] = useState<{ id: number; sender: string; text: string; time: string; isSelf: boolean }[]>([
    { id: 1, sender: 'Prof. Anderson', text: 'Welcome to the live session everyone.', time: '10:00 AM', isSelf: false },
    { id: 2, sender: 'Sarah Jenkins', text: 'Good morning professor.', time: '10:01 AM', isSelf: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);

  const [notifications, setNotifications] = useState<{ id: number; text: string; type: 'hand' | 'info'; time: Date }[]>([]);

  useEffect(() => {
    if (user?.role === 'Lecturer' || user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'Administrator') {
      const timer1 = setTimeout(() => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          text: 'Sarah Jenkins raised hand',
          type: 'hand',
          time: new Date()
        }]);
      }, 8000);
      
      const timer2 = setTimeout(() => {
        setNotifications(prev => [...prev, {
          id: Date.now() + 1,
          text: 'Mike Wheeler raised hand',
          type: 'hand',
          time: new Date()
        }]);
      }, 15000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [user]);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  const [showBreakoutModal, setShowBreakoutModal] = useState(false);
  const [breakoutRooms, setBreakoutRooms] = useState<{ id: string; name: string; participants: string[] }[]>([]);
  const [numRooms, setNumRooms] = useState(2);
  const [activeBreakoutRoom, setActiveBreakoutRoom] = useState<string | null>(null);

  const createBreakoutRooms = () => {
    const mockStudents = ['Sarah Jenkins', 'Mike Wheeler', 'Dustin Henderson', 'Lucas Sinclair', 'Will Byers', 'Jane Hopper'];
    const newRooms = [];
    for (let i = 0; i < numRooms; i++) {
      newRooms.push({
        id: `room-${i + 1}`,
        name: `Room ${i + 1}`,
        participants: mockStudents.slice(i * Math.ceil(mockStudents.length / numRooms), (i + 1) * Math.ceil(mockStudents.length / numRooms))
      });
    }
    setBreakoutRooms(newRooms);
  };


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecorded(true);
    } else {
      setIsRecording(true);
      setHasRecorded(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLeave = () => {
    if (hasRecorded) {
      onLeave(recordingSeconds);
    } else {
      onLeave();
    }
  };


  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to get local stream", err);
      }
    }
    setupCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      setScreenStream(null);
      setIsScreenSharing(false);
      setShowWhiteboard(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        setShowWhiteboard(false);

        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.error("Failed to share screen", err);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };



  const handleRaiseHand = () => {
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);
    if (newHandState) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        text: 'You raised your hand',
        type: 'hand',
        time: new Date()
      }]);
    }
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages([...messages, {
      id: Date.now(),
      sender: user?.name || 'Student',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    }]);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans">

      {showBreakoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="font-bold text-xl text-white flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-emerald-500" /> Breakout Rooms
              </h3>
              <button onClick={() => setShowBreakoutModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {breakoutRooms.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-slate-300">Create smaller rooms to split participants for group discussions.</p>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Number of Rooms</label>
                    <select 
                      value={numRooms}
                      onChange={(e) => setNumRooms(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    >
                      {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Rooms</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={createBreakoutRooms}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Create Rooms
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {breakoutRooms.map(room => (
                    <div key={room.id} className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-white">{room.name}</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setActiveBreakoutRoom(activeBreakoutRoom === room.name ? null : room.name);
                              setShowBreakoutModal(false);
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${activeBreakoutRoom === room.name ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                          >
                            {activeBreakoutRoom === room.name ? 'Leave Room' : 'Join Room'}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {room.participants.map((p, idx) => (
                          <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => {
                      setBreakoutRooms([]);
                      setActiveBreakoutRoom(null);
                    }}
                    className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-3 rounded-xl transition-colors mt-4"
                  >
                    Close All Rooms
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5 animate-pulse">
              <Disc2 className="w-3.5 h-3.5" /> REC {formatTime(recordingSeconds)}
            </div>
          )}
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5 animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
          </div>
          {activeBreakoutRoom && (
            <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" /> ${activeBreakoutRoom}
            </div>
          )}
          <div>
            <h2 className="text-white font-bold">{courseCode}: {courseTitle}</h2>
            <p className="text-slate-400 text-xs">01:24:03 • 42 Participants</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative group">


            {/* Notifications Overlay */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
              <AnimatePresence>
                {notifications.map(note => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-slate-800 border border-slate-700 shadow-lg rounded-xl p-3 pr-4 flex items-center gap-3 w-72"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Hand className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{note.text}</p>
                      <p className="text-slate-400 text-xs">{note.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button 
                      onClick={() => removeNotification(note.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Whiteboard or Screen Share */}
            {showWhiteboard ? (
              <div className="absolute inset-0 z-10">
                <Whiteboard onClose={() => setShowWhiteboard(false)} />
              </div>
            ) : (
              
              <>
                {isScreenSharing && screenStream ? (
                  <video 
                    ref={screenVideoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Waiting for presenter's screen or video...</p>
                    </div>
                  </div>
                )}
                {/* Name badge */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm flex items-center gap-2">
                  {isScreenSharing ? 'Your Screen' : 'Prof. Anderson (Host)'}
                  <Mic className="w-3.5 h-3.5" />
                </div>
              </>

            )}

          </div>

          {/* Participant Strip (Mock) */}
          
          {/* Participant Strip */}
          <div className="h-32 mt-4 grid grid-cols-4 gap-4">
            {/* Local User */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`} 
              />
              {isVideoOff && (
                 <span className="text-3xl absolute">👤</span>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                You {isMuted && <MicOff className="w-3 h-3 text-red-400" />} {isHandRaised && <Hand className="w-3 h-3 text-amber-500" />}
              </div>
            </div>
            
            {/* Mock Users */}
            {[2, 3, 4].map(i => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <span className="text-3xl">👤</span>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                  Student {i}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Sidebar (Chat) */}
        {showChat && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-bold">In-call Messages</h3>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-300">{msg.isSelf ? 'You' : msg.sender}</span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <div className={`px-3 py-2 rounded-xl text-sm ${msg.isSelf ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a message..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 px-6">
        <button 
          onClick={toggleAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        
        <button 
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        
        <button 
          onClick={handleRaiseHand}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isHandRaised ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
          title="Raise Hand"
        >
          <Hand className="w-5 h-5" />
        </button>

        {(user?.role === 'Lecturer' || user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'Administrator') && (
          <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? "bg-emerald-600 text-white" : "bg-slate-800 text-white hover:bg-slate-700"}`} title="Share Screen"><Share2 className="w-5 h-5" /></button>
        )}
        
        <button 
          onClick={() => setShowWhiteboard(!showWhiteboard)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showWhiteboard ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
          title="Whiteboard"
        >
          <PenTool className="w-5 h-5" />
        </button>
        
        {(user?.role === 'Lecturer' || user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'Administrator') && (
          <button 
            onClick={() => setShowBreakoutModal(true)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${breakoutRooms.length > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            title="Breakout Rooms"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        )}

        
        <div className="w-px h-8 bg-slate-700 mx-2"></div>

        <div className="w-px h-8 bg-slate-700 mx-2"></div>

        <button 
          onClick={() => setShowChat(!showChat)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors relative ${showChat ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          <MessageSquare className="w-5 h-5" />
          {!showChat && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>}
        </button>

        <button 
          onClick={toggleRecording}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Disc2 className="w-5 h-5" />}
        </button>
        <div className="w-px h-8 bg-slate-700 mx-2"></div>
        <button className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors">
          <Users className="w-5 h-5" />
        </button>

        <button className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="w-px h-8 bg-slate-700 mx-2"></div>

        <button 
          onClick={handleLeave}
          className="px-6 h-12 rounded-full bg-red-600 text-white font-bold flex items-center gap-2 hover:bg-red-700 transition-colors ml-4"
        >
          <PhoneOff className="w-5 h-5" />
          Leave
        </button>
      </div>
    </div>
  );
}
