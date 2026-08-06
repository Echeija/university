import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, 
  MessageSquare, Users, Hand, Smile, Maximize, Settings,
  PenTool, Square, Circle, Type, Send
} from 'lucide-react';
import { Stage, Layer, Line, Rect, Circle as KonvaCircle } from 'react-konva';

interface Message {
  id: number;
  sender: string;
  isMe: boolean;
  text: string;
  color: string;
}

export default function LmsLiveClass() {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'Prof. Alan Turing', isMe: false, text: 'Welcome to class! Please review the assignment guidelines before we start.', color: 'text-emerald-400' },
    { id: 2, sender: 'Sarah Connor', isMe: false, text: 'Will this session be recorded?', color: 'text-purple-400' },
    { id: 3, sender: 'You', isMe: true, text: "Yes, usually it's posted an hour after class.", color: 'text-indigo-400' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'You',
      isMe: true,
      text: newMessage.trim(),
      color: 'text-indigo-400'
    }]);
    setNewMessage('');
  };

  // Whiteboard State
  const [lines, setLines] = useState<any[]>([]);
  const [tool, setTool] = useState('pen');
  const [wbColor, setWbColor] = useState('#4f46e5');
  const isDrawing = useRef(false);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, color: wbColor, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  useEffect(() => {
    // Attempt to get user media for a realistic local video feed
    if (videoOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log('Camera access denied or not available', err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, [videoOn]);

  const toggleScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      stream.getVideoTracks()[0].onended = () => {
        // Switch back to normal camera if screen sharing stops
        setVideoOn(false); setTimeout(() => setVideoOn(true), 100);
      };
    } catch (err) {
      console.log('Screen sharing cancelled', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-900 overflow-hidden relative text-white">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur-md absolute top-0 w-full z-10 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
          <span className="font-medium text-sm">Advanced Algorithms (CS401)</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-300">00:45:12</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid area */}
      <div className="flex-1 flex pt-14 pb-20 relative">
        <div className={`flex-1 p-4 grid gap-4 ${whiteboardOpen ? 'grid-cols-1' : chatOpen ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} content-start overflow-y-auto`}>
          
          {whiteboardOpen ? (
            <div className="col-span-full h-full bg-white rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
               {/* Functional Konva Whiteboard */}
               <div className="absolute top-4 left-4 bg-white border border-slate-200 shadow-md rounded-lg p-1 z-10 flex flex-col gap-1 text-slate-700">
                  <button onClick={() => setTool('pen')} className={`p-2 rounded ${tool === 'pen' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100'}`}><PenTool className="w-5 h-5"/></button>
                  <button onClick={() => setTool('eraser')} className={`p-2 rounded ${tool === 'eraser' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100'}`}><Square className="w-5 h-5"/></button>
                  <div className="flex flex-col gap-1 mt-2 border-t pt-2 border-slate-200">
                    {['#4f46e5', '#e11d48', '#10b981', '#000000'].map(c => (
                      <button key={c} onClick={() => setWbColor(c)} className={`w-8 h-8 rounded-full border-2 ${wbColor === c ? 'border-slate-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button onClick={() => setLines([])} className="mt-2 text-xs font-bold text-rose-500 hover:bg-rose-50 p-2 rounded">Clear</button>
               </div>
               <div className="flex-1 bg-white cursor-crosshair">
                 <Stage 
                   width={window.innerWidth - 300} 
                   height={window.innerHeight - 150}
                   onMouseDown={handleMouseDown}
                   onMousemove={handleMouseMove}
                   onMouseup={handleMouseUp}
                 >
                   <Layer>
                     {lines.map((line, i) => (
                       <Line
                         key={i}
                         points={line.points}
                         stroke={line.color}
                         strokeWidth={line.tool === 'eraser' ? 20 : 5}
                         tension={0.5}
                         lineCap="round"
                         lineJoin="round"
                         globalCompositeOperation={
                           line.tool === 'eraser' ? 'destination-out' : 'source-over'
                         }
                       />
                     ))}
                   </Layer>
                 </Stage>
               </div>
               <div className="absolute bottom-4 right-4 text-slate-500 font-bold bg-white/80 px-3 py-1 rounded">Interactive Whiteboard</div>
            </div>
          ) : (
            <>
              {/* Local User */}
              <div className="relative bg-slate-800 rounded-2xl overflow-hidden aspect-video border-2 border-indigo-500 shadow-lg shadow-indigo-500/20">
                {videoOn ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">You</div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-xs font-medium flex items-center gap-2">
                  {!micOn && <MicOff className="w-3 h-3 text-rose-500" />}
                  You (Student)
                </div>
                {handRaised && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white p-1.5 rounded-full shadow-lg animate-bounce">
                    <Hand className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Remote Users (Mocks) */}
              {[
                { name: 'Prof. Alan Turing', role: 'Host', initial: 'AT', color: 'bg-emerald-600' },
                { name: 'Sarah Connor', role: 'Student', initial: 'SC', color: 'bg-purple-600' },
                { name: 'John Smith', role: 'Student', initial: 'JS', color: 'bg-amber-600' },
                { name: 'Emma Watson', role: 'Student', initial: 'EW', color: 'bg-rose-600' },
                { name: 'David Chen', role: 'Student', initial: 'DC', color: 'bg-blue-600' },
              ].map((user, i) => (
                <div key={i} className="relative bg-slate-800 rounded-2xl overflow-hidden aspect-video border border-slate-700">
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <div className={`w-20 h-20 ${user.color} rounded-full flex items-center justify-center text-2xl font-bold`}>{user.initial}</div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-xs font-medium flex items-center gap-2">
                    <MicOff className="w-3 h-3 text-rose-500" />
                    {user.name} {user.role === 'Host' && '(Host)'}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right Sidebar (Chat / Participants) */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-800 border-l border-white/10 flex flex-col shrink-0 z-20"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold">In-call Messages</h3>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white"><Max className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-xs text-center text-slate-400">10:05 AM</div>
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.isMe ? "bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-xl rounded-tr-sm text-sm ml-6" : "bg-slate-700/50 p-3 rounded-xl rounded-tl-sm text-sm mr-6"}>
                    {!msg.isMe && <span className={`font-bold ${msg.color} text-xs block mb-1`}>{msg.sender}</span>}
                    {msg.isMe && <span className="font-bold text-indigo-400 text-xs block mb-1">You</span>}
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="relative">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send a message..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white" 
                  />
                  <button type="submit" className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-white">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-slate-900 border-t border-white/10 absolute bottom-0 w-full flex items-center justify-between px-4 lg:px-8 z-30">
        <div className="flex items-center gap-2">
          <div className="text-slate-400 text-xs hidden md:block">
            <span className="font-bold text-white">Security:</span> End-to-End Encrypted
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 absolute left-1/2 transform -translate-x-1/2">
          <button 
            onClick={() => setMicOn(!micOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setVideoOn(!videoOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${videoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button 
            onClick={toggleScreenShare}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors hidden sm:flex"
            title="Share Screen"
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setHandRaised(!handRaised)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors hidden sm:flex ${handRaised ? 'bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setWhiteboardOpen(!whiteboardOpen)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors hidden sm:flex ${whiteboardOpen ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            title="Whiteboard"
          >
            <PenTool className="w-5 h-5" />
          </button>

          <button 
            className="w-14 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors px-4 ml-4 font-bold text-sm"
          >
            <PhoneOff className="w-4 h-4 mr-2 hidden sm:block" /> Leave
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 relative" title="Participants">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">24</span>
          </button>
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-2.5 rounded-full relative transition-colors ${chatOpen ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`} 
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
          </button>
          <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hidden md:block">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Dummy Max component since we need it for the close button
function Max({className}: {className?: string}) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
