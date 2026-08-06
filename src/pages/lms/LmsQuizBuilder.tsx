import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Save, Clock, HelpCircle, CheckCircle, Settings, GripVertical, History, X, RotateCcw, AlertTriangle, Eye, ChevronLeft, ChevronRight, PlayCircle, Users, Calendar, BarChart3, Edit3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

interface QuizVersion {
  id: string;
  timestamp: Date;
  title: string;
  timeLimit: number;
  isStrictTimer: boolean;
  assignedGroups: string[];
  availableFrom: string;
  availableUntil: string;
  questions: Question[];
}

type ViewMode = 'builder' | 'analytics';

export default function LmsQuizBuilder() {
  const [viewMode, setViewMode] = useState<ViewMode>('builder');
  const [quizTitle, setQuizTitle] = useState('Midterm Assessment');
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [isStrictTimer, setIsStrictTimer] = useState(false);
  const [assignedGroups, setAssignedGroups] = useState<string[]>(['CS-101']);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  
  const availableCohorts = ['CS-101', 'CS-202', 'SE-301', 'DB-405'];

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: 'What is the time complexity of binary search?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
      correctOptionIndex: 2
    }
  ]);

  const [versions, setVersions] = useState<QuizVersion[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<QuizVersion | null>(null);

  // Preview State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, number>>({});
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState<number>(0);
  const [isPreviewSubmitted, setIsPreviewSubmitted] = useState(false);

  useEffect(() => {
    if (!showPreviewModal || isPreviewSubmitted || previewTimeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setPreviewTimeRemaining(prev => {
        if (prev <= 1) {
          setIsPreviewSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showPreviewModal, isPreviewSubmitted, previewTimeRemaining]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0
      }
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const setCorrectOption = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, correctOptionIndex: optionIndex } : q));
  };

  const saveVersion = () => {
    const newVersion: QuizVersion = {
      id: Date.now().toString(),
      timestamp: new Date(),
      title: quizTitle,
      timeLimit,
      isStrictTimer,
      assignedGroups,
      availableFrom,
      availableUntil,
      questions: JSON.parse(JSON.stringify(questions))
    };
    setVersions([newVersion, ...versions]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveVersion();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizTitle, timeLimit, isStrictTimer, questions, versions, saveVersion, addQuestion]);

  const confirmRestore = () => {
    if (versionToRestore) {
      setQuizTitle(versionToRestore.title);
      setTimeLimit(versionToRestore.timeLimit);
      setIsStrictTimer(versionToRestore.isStrictTimer || false);
      setAssignedGroups(versionToRestore.assignedGroups || []);
      setAvailableFrom(versionToRestore.availableFrom || '');
      setAvailableUntil(versionToRestore.availableUntil || '');
      setQuestions(JSON.parse(JSON.stringify(versionToRestore.questions)));
      setVersionToRestore(null);
      setShowHistoryModal(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const openPreview = () => {
    setPreviewQuestionIndex(0);
    setPreviewAnswers({});
    setPreviewTimeRemaining(timeLimit * 60);
    setIsPreviewSubmitted(false);
    setShowPreviewModal(true);
  };

  const formatPreviewTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const calculatePreviewScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (previewAnswers[idx] === q.correctOptionIndex) {
        score++;
      }
    });
    return Math.round((score / questions.length) * 100);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 relative">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz Builder</h1>
          <p className="text-slate-600 mt-1">Create and manage multi-choice quizzes with auto-grading.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <History className="w-5 h-5" /> History ({versions.length})
          </button>
          <button 
            onClick={openPreview}
            className="px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Eye className="w-5 h-5" /> Preview
          </button>
          <button 
            onClick={saveVersion}
            title="Save Quiz (Ctrl+S or Cmd+S)"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-5 h-5" /> Save Quiz
          </button>
        </div>
      </motion.div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-max">
        <button 
          onClick={() => setViewMode('builder')} 
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${viewMode === 'builder' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Edit3 className="w-4 h-4" /> Builder
        </button>
        <button 
          onClick={() => setViewMode('analytics')} 
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${viewMode === 'analytics' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </button>
      </div>

      {viewMode === 'builder' ? (
        <>
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Quiz Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title</label>
            <input 
              type="text" 
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
              placeholder="e.g., Midterm Exam"
            />
          </div>
          
          <div className="md:col-span-2 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Assignment & Scheduling
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Cohorts</label>
                <div className="flex flex-wrap gap-2">
                  {availableCohorts.map(cohort => (
                    <button
                      key={cohort}
                      onClick={() => setAssignedGroups(prev => prev.includes(cohort) ? prev.filter(c => c !== cohort) : [...prev, cohort])}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${assignedGroups.includes(cohort) ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {cohort}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Available From
                </label>
                <input 
                  type="datetime-local" 
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Available Until
                </label>
                <input 
                  type="datetime-local" 
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                />
              </div>

              <div className="md:col-span-3 border-t border-slate-200 pt-6 mt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" /> Strict Time Limit
                    </label>
                    <p className="text-xs text-slate-500">Students must complete the quiz within this time limit after starting.</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center">
                       <input 
                        type="checkbox"
                        id="strict-timer"
                        checked={isStrictTimer}
                        onChange={(e) => setIsStrictTimer(e.target.checked)}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mr-2"
                       />
                       <label htmlFor="strict-timer" className="text-sm font-bold text-slate-700 cursor-pointer">Enforce Timer</label>
                     </div>
                     <input 
                      type="number" 
                      value={timeLimit}
                      disabled={!isStrictTimer}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900 disabled:opacity-50"
                      min="1"
                    />
                    <span className="text-sm font-medium text-slate-600">minutes</span>
                  </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
              <button 
                onClick={openPreview}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <Eye className="w-5 h-5" /> Preview Student Experience
              </button>
              <button 
                onClick={saveVersion}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <CheckCircle className="w-5 h-5" /> Finalize Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {questions.map((q, index) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-move">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-sm">Question {index + 1}</span>
                </div>
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove Question"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" /> Question Text
                  </label>
                  <textarea 
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-y"
                    placeholder="Type your question here..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Options & Auto-grading</label>
                  <p className="text-xs text-slate-500 mb-4">Select the radio button next to the correct answer.</p>
                  
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${q.correctOptionIndex === optIdx ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <button 
                        onClick={() => setCorrectOption(q.id, optIdx)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${q.correctOptionIndex === optIdx ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}
                      >
                        {q.correctOptionIndex === optIdx && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>
                      <input 
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none font-medium text-slate-700"
                        placeholder={`Option ${optIdx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button 
        onClick={addQuestion}
        title="Add New Question (Ctrl+Enter or Cmd+Enter)"
        className="w-full py-6 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-3xl hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Add New Question
      </button>
      </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-1">Average Score</p>
              <h2 className="text-4xl font-black text-indigo-600">82.1%</h2>
              <p className="text-emerald-500 text-sm font-medium mt-2 flex items-center gap-1">+4.2% from last cohort</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-1">Completion Rate</p>
              <h2 className="text-4xl font-black text-slate-800">94%</h2>
              <p className="text-slate-500 text-sm font-medium mt-2">112 of 120 assigned students</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-1">Avg Completion Time</p>
              <h2 className="text-4xl font-black text-slate-800">18m</h2>
              <p className="text-slate-500 text-sm font-medium mt-2">Time limit is {timeLimit}m</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-6">Student Scores Distribution</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { range: '0-50%', students: 2 },
                    { range: '51-60%', students: 5 },
                    { range: '61-70%', students: 12 },
                    { range: '71-80%', students: 35 },
                    { range: '81-90%', students: 42 },
                    { range: '91-100%', students: 16 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-6">Most Incorrect Answers</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={[
                    { question: 'Q1', incorrect: 12 },
                    { question: 'Q3', incorrect: 28 },
                    { question: 'Q4', incorrect: 19 },
                    { question: 'Q7', incorrect: 8 },
                    { question: 'Q9', incorrect: 15 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis dataKey="question" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={40} />
                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="incorrect" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" /> Version History
                </h3>
                <button onClick={() => { setShowHistoryModal(false); setVersionToRestore(null); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 relative">
                {versionToRestore ? (
                   <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm text-center"
                   >
                      <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-slate-900 mb-2">Restore Version?</h4>
                      <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                        Are you sure you want to restore to this version? Your current unsaved changes will be lost.
                      </p>
                      <div className="flex justify-center gap-3">
                         <button 
                            onClick={() => setVersionToRestore(null)}
                            className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                         >
                            Cancel
                         </button>
                         <button 
                            onClick={confirmRestore}
                            className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-2"
                         >
                            <RotateCcw className="w-4 h-4" /> Yes, Restore
                         </button>
                      </div>
                   </motion.div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 font-medium">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p>No saved versions yet.</p>
                    <p className="text-sm mt-1">Click "Save Quiz" to create your first version.</p>
                  </div>
                ) : (
                  versions.map((v, idx) => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-indigo-200 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">Version {versions.length - idx}</span>
                          <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                            {formatDate(v.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{v.title} • {v.questions.length} questions • {v.timeLimit} mins</p>
                        {v.assignedGroups && v.assignedGroups.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {v.assignedGroups.map(g => (
                              <span key={g} className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">
                                {g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => setVersionToRestore(v)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl transition-colors flex items-center gap-2 text-sm shrink-0"
                      >
                        <RotateCcw className="w-4 h-4" /> Restore
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-indigo-600" /> {quizTitle}
                </h3>
                <div className="flex items-center gap-4">
                  {!isPreviewSubmitted && (
                    <div className={`font-bold font-mono px-3 py-1 rounded-lg ${previewTimeRemaining < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>
                      {formatPreviewTime(previewTimeRemaining)}
                    </div>
                  )}
                  <button onClick={() => setShowPreviewModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
                {isPreviewSubmitted ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                      <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Quiz Completed!</h2>
                    <p className="text-lg text-slate-600">Your simulated score:</p>
                    <div className="text-5xl font-black text-indigo-600">{calculatePreviewScore()}%</div>
                    <button 
                      onClick={() => setShowPreviewModal(false)}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors mt-4 shadow-sm"
                    >
                      Close Preview
                    </button>
                  </div>
                ) : questions.length > 0 ? (
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-500 uppercase tracking-wider">
                      <span>Question {previewQuestionIndex + 1} of {questions.length}</span>
                      <span className="text-indigo-600">{Math.round(((previewQuestionIndex + 1) / questions.length) * 100)}%</span>
                    </div>
                    
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full" style={{ width: `${((previewQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 leading-snug">
                      {questions[previewQuestionIndex].text || "Untitled Question"}
                    </h3>

                    <div className="space-y-3">
                      {questions[previewQuestionIndex].options.map((opt, idx) => {
                        const isSelected = previewAnswers[previewQuestionIndex] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setPreviewAnswers(prev => ({ ...prev, [previewQuestionIndex]: idx }))}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                            <span className={`font-medium text-lg ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                              {opt || `Option ${idx + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 font-medium">
                    No questions available to preview.
                  </div>
                )}
              </div>

              {!isPreviewSubmitted && questions.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
                  <button 
                    onClick={() => setPreviewQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={previewQuestionIndex === 0}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous
                  </button>
                  
                  {previewQuestionIndex === questions.length - 1 ? (
                    <button 
                      onClick={() => setIsPreviewSubmitted(true)}
                      className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
                    >
                      Submit Quiz <CheckCircle className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setPreviewQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      className="px-6 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      Next <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
