import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Video, X, Calendar, Clock, Users, PlayCircle, FileText, ChevronRight } from 'lucide-react';
import LiveClass from './LiveClass';

export default function VirtualClasses() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<{ code: string; title: string } | null>(null);
  
  // Mock data for virtual classes
  const [scheduledClasses, setScheduledClasses] = useState([
    { id: 1, courseCode: 'COM301', title: 'Data Structures', instructor: 'Prof. Anderson', time: '10:00 AM', date: 'Today', participants: 42, isLive: true },
    { id: 2, courseCode: 'MTH202', title: 'Advanced Calculus', instructor: 'Dr. Sarah Jenkins', time: '2:00 PM', date: 'Today', participants: 120, isLive: false },
    { id: 3, courseCode: 'PHY101', title: 'General Physics I', instructor: 'Dr. Michael Chen', time: '9:00 AM', date: 'Tomorrow', participants: 85, isLive: false }
  ]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newClass, setNewClass] = useState({ courseCode: '', title: '', date: '', time: '' });

  const upcomingClasses = scheduledClasses;

  const [pastRecordings, setPastRecordings] = useState([
    { id: 101, courseCode: 'COM301', title: 'Introduction to Trees', date: 'Yesterday', duration: '1h 15m' },
    { id: 102, courseCode: 'MTH202', title: 'Integration Techniques', date: 'Oct 24', duration: '55m' },
  ]);
  
  const handleLeaveSession = (recordingDuration?: number) => {
    if (recordingDuration && recordingDuration > 0) {
      const minutes = Math.floor(recordingDuration / 60);
      const seconds = recordingDuration % 60;
      const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      
      setPastRecordings([
        {
          id: Date.now(),
          courseCode: activeSession?.code || '',
          title: activeSession?.title || '',
          date: 'Just now',
          duration: durationStr
        },
        ...pastRecordings
      ]);
    }
    setActiveSession(null);
  };
  

  if (activeSession) {
    return (
      <LiveClass
        courseCode={activeSession.code}
        courseTitle={activeSession.title}
        onLeave={handleLeaveSession}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Schedule Class</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                <input 
                  type="text" 
                  value={newClass.courseCode}
                  onChange={(e) => setNewClass({...newClass, courseCode: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  placeholder="e.g. COM301"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Topic / Title</label>
                <input 
                  type="text" 
                  value={newClass.title}
                  onChange={(e) => setNewClass({...newClass, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  placeholder="e.g. Data Structures"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newClass.date}
                    onChange={(e) => setNewClass({...newClass, date: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={newClass.time}
                    onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newClass.courseCode && newClass.title) {
                    setScheduledClasses([...scheduledClasses, {
                      id: Date.now(),
                      courseCode: newClass.courseCode,
                      title: newClass.title,
                      instructor: user?.name || 'Lecturer',
                      time: newClass.time || '12:00 PM',
                      date: newClass.date || 'Today',
                      participants: 0,
                      isLive: false
                    }]);
                    setShowScheduleModal(false);
                    setNewClass({ courseCode: '', title: '', date: '', time: '' });
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              >
                Schedule Class
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-600" />
            Virtual Classes
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join live sessions and access past recordings.</p>
        </div>
        {(user?.role === 'Lecturer' || user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'Administrator') && (
          <button onClick={() => setShowScheduleModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
            <Video className="w-5 h-5" /> Schedule New Class
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Upcoming & Live Sessions</h3>
            
            <div className="space-y-4">
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className={`p-5 rounded-xl border transition-all ${cls.isLive ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800/50' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-200 dark:hover:border-purple-700'}`}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-lg">{cls.courseCode}</span>
                        {cls.isLive && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-200 text-lg mb-1">{cls.title}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {cls.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.time}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {cls.participants} Enrolled</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {cls.isLive ? (
                        <button 
                          onClick={() => setActiveSession({ code: cls.courseCode, title: cls.title })}
                          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm shadow-purple-200 flex items-center justify-center gap-2"
                        >
                          Join Now
                        </button>
                      ) : (
                        <button className="w-full sm:w-auto bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                          Add to Calendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-emerald-600" /> Past Recordings
            </h3>
            
            <div className="space-y-4">
              {pastRecordings.map((rec) => (
                <div key={rec.id} className="group p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{rec.courseCode}: {rec.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{rec.date}</span>
                      <span>•</span>
                      <span>{rec.duration}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              View All Recordings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
