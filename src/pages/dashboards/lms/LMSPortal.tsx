import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from "../../../contexts/NotificationContext";
import { Upload, X, MonitorPlay, PlayCircle, FileText, BookOpen, Clock, CheckCircle2, ChevronRight, Video, FileArchive, Plus, HelpCircle, Trash2, Layout, MessagesSquare, FileSignature, Users } from 'lucide-react';
import QuizBuilder from './QuizBuilder';
import QuizTaking from './QuizTaking';
import QuizResultsDashboard from './QuizResultsDashboard';
import LiveClass from './LiveClass';
import AIChatAssistant from '../../../components/AIChatAssistant';

import LMSDiscussions from './components/LMSDiscussions';
import LMSAssignments from './components/LMSAssignments';
import LMSPeople from './components/LMSPeople';
import LMSContentViewer from './components/LMSContentViewer';
import LMSGrades from './components/LMSGrades';
import LMSAdminPanel from './components/LMSAdminPanel';

export default function LMSPortal() {
  const { user, token } = useAuth();
  const { notify } = useNotification();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation tabs within a course
  const [activeTab, setActiveTab] = useState<'modules' | 'assignments' | 'discussions' | 'grades' | 'people'>('modules');

  const [isBuildingQuiz, setIsBuildingQuiz] = useState(false);
  const [takingQuiz, setTakingQuiz] = useState<any | null>(null);
  const [viewingResults, setViewingResults] = useState<any | null>(null);
  const [inLiveClass, setInLiveClass] = useState(false);
  
  // Content Viewer
  const [viewingContent, setViewingContent] = useState<any | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [lmsModules, setLmsModules] = useState<any[]>([]);
  const [uploadModuleTitle, setUploadModuleTitle] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialCategory, setMaterialCategory] = useState('Course Material');
  const [uploadCourseId, setUploadCourseId] = useState('');

  useEffect(() => {
    if (!selectedCourse) return;
    
    fetch(`/api/courses/${selectedCourse.id}/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then((docs: any[]) => {
      if (!Array.isArray(docs)) return;
      
      const modulesMap = new Map();
      docs.forEach(doc => {
        const modTitle = doc.description || 'General';
        if (!modulesMap.has(modTitle)) {
          modulesMap.set(modTitle, {
            id: modTitle,
            title: modTitle,
            items: []
          });
        }
        
        let type = 'document';
        if (doc.fileType.includes('video') || doc.title.endsWith('.mp4')) {
          type = 'video';
        } else if (doc.title.endsWith('.zip') || doc.title.endsWith('.scorm')) {
          type = 'scorm';
        }
        
        modulesMap.get(modTitle).items.push({
          id: doc.id,
          type: type,
          title: doc.title,
          size: (doc.fileSize / (1024 * 1024)).toFixed(1) + ' MB',
          category: doc.category,
          completed: false,
          docData: doc
        });
      });
      
      setLmsModules(Array.from(modulesMap.values()));
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  }, [selectedCourse, token]);

  useEffect(() => {
    let endpoint = '/api/courses';
    if (user?.role === 'Student') endpoint = '/api/student/courses';
    else if (user?.role === 'Lecturer') endpoint = '/api/lecturer/courses';
    
    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setCourses([]);
        setIsLoading(false);
      });
  }, [user?.role, token]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="mb-8">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-[280px]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="space-y-6 relative h-full flex flex-col">
        {viewingContent && (
          <LMSContentViewer 
            item={viewingContent}
            onClose={() => setViewingContent(null)}
          />
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={() => setSelectedCourse(null)}
              className="text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-1 hover:underline mb-2"
            >
              &larr; Back to Dashboard
            </button>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedCourse.code}: {selectedCourse.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Learning Management System</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setInLiveClass(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-colors text-sm flex items-center gap-2 shadow-sm shadow-purple-200"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Join Live Class
            </button>
            {['Lecturer', 'Administrator', 'ICT Admin', 'Admin'].includes(user?.role) && (
              <>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors text-sm flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload Material
                </button>
                <button 
                  onClick={() => setIsBuildingQuiz(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-colors text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Quiz
                </button>
              </>
            )}
          </div>
        </div>

        {inLiveClass ? (
          <LiveClass courseCode={selectedCourse.code} courseTitle={selectedCourse.title} onLeave={() => setInLiveClass(false)} />
        ) : isBuildingQuiz ? (
          <QuizBuilder courseId={selectedCourse.id} onSave={() => setIsBuildingQuiz(false)} onCancel={() => setIsBuildingQuiz(false)} />
        ) : takingQuiz ? (
          <QuizTaking quiz={takingQuiz} onComplete={() => setTakingQuiz(null)} onCancel={() => setTakingQuiz(null)} />
        ) : viewingResults ? (
          <QuizResultsDashboard quizId={viewingResults.id} onClose={() => setViewingResults(null)} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-2 space-y-1">
              <button 
                onClick={() => setActiveTab('modules')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'modules' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}
              >
                <Layout className="w-5 h-5" /> Modules
              </button>
              <button 
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'assignments' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}
              >
                <FileSignature className="w-5 h-5" /> Assignments
              </button>
              <button 
                onClick={() => setActiveTab('discussions')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'discussions' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}
              >
                <MessagesSquare className="w-5 h-5" /> Discussions
              </button>
              <button 
                onClick={() => setActiveTab('grades')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'grades' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}
              >
                <CheckCircle2 className="w-5 h-5" /> Grades
              </button>
              <button 
                onClick={() => setActiveTab('people')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'people' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}
              >
                <Users className="w-5 h-5" /> People
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full min-w-0">
              {activeTab === 'modules' && (
                <div className="space-y-4">
                  {lmsModules.map((module) => (
                    <div key={module.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{module.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                            {module.items.length} items
                          </span>
                          {(['Lecturer', 'Administrator', 'ICT Admin', 'Admin'].includes(user?.role)) && (
                            <button 
                              onClick={() => {
                                // Delete all items in module sequentially
                                Promise.all(module.items.map((item: any) => 
                                  fetch(`/api/documents/${item.id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                  })
                                )).then(() => {
                                  setLmsModules(prev => prev.filter(m => m.id !== module.id));
                                  notify({ title: 'Success', message: 'Module deleted', type: 'success' });
                                }).catch(() => notify({ title: 'Error', message: 'Failed to delete module', type: 'error' }));
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors"
                              title="Delete Module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {module.items.map((item: any) => (
                          <div 
                            key={item.id} 
                            onClick={() => {
                              if (item.type === 'quiz') {
                                if (user?.role === 'Student') setTakingQuiz(item.quizData);
                                else if (['Lecturer', 'Administrator', 'ICT Admin', 'Admin'].includes(user?.role)) setViewingResults(item);
                              } else {
                                setViewingContent(item);
                              }
                            }}
                            className="p-4 transition-colors flex items-center gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              item.completed 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'
                            }`}>
                              {item.type === 'video' ? <Video className="w-5 h-5" /> : item.type === 'document' ? <FileText className="w-5 h-5" /> : item.type === 'quiz' ? <HelpCircle className="w-5 h-5" /> : <FileArchive className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                {item.title}
                                {item.category && item.category !== 'Course Material' && (
                                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                    {item.category}
                                  </span>
                                )}
                              </p>
                              {['Lecturer', 'Administrator', 'ICT Admin', 'Admin'].includes(user?.role) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fetch(`/api/documents/${item.id}`, {
                                      method: 'DELETE',
                                      headers: { Authorization: `Bearer ${token}` }
                                    }).then(() => {
                                      setLmsModules(prev => prev.map(m => m.id === module.id ? { ...m, items: m.items.filter((i: any) => i.id !== item.id) } : m).filter(m => m.items.length > 0));
                                      notify({ title: 'Success', message: 'Item deleted', type: 'success' });
                                    });
                                  }}
                                  className="ml-auto text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {item.type === 'video' && <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span>}
                                {item.type === 'document' && <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><FileText className="w-3 h-3" /> {item.size}</span>}
                                {item.type === 'quiz' && <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span>}
                              </div>
                            </div>
                            <div className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'assignments' && <LMSAssignments role={user?.role} />}
              {activeTab === 'discussions' && <LMSDiscussions courseId={selectedCourse.id} />}
              {activeTab === 'people' && <LMSPeople role={user?.role} />}
              {activeTab === 'grades' && <LMSGrades role={user?.role} />}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Learning Portal</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Access your courses and materials</p>
        </div>
        <div className="flex gap-3">
          {['Lecturer', 'Administrator', 'ICT Admin', 'Admin'].includes(user?.role) && (
            <button 
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <Layout className="w-5 h-5" /> {showAdminPanel ? 'View Courses' : 'LMS Admin'}
            </button>
          )}
        </div>
        
      </div>

      {showAdminPanel ? (
        <LMSAdminPanel />
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <MonitorPlay className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Courses Found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {user?.role === 'Student' 
              ? "You haven't registered for any courses yet, or your courses haven't been published to the LMS." 
              : "You haven't been assigned to teach any courses yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors" onClick={() => setSelectedCourse(course)}>
              <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-700 p-6 flex items-end relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-white font-bold text-xl drop-shadow-sm relative z-10">{course.code}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">{course.title}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-auto">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.credits} Credits</span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-slate-50 dark:bg-slate-900/20 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                <span>Enter Course</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Course Material</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Material Title</label>
                  <input type="text" value={materialTitle} onChange={e => setMaterialTitle(e.target.value)} placeholder="e.g. Introduction Slides" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Module Title</label>
                  <input type="text" value={uploadModuleTitle} onChange={e => setUploadModuleTitle(e.target.value)} placeholder="e.g. Week 1: Introduction" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select value={materialCategory} onChange={e => setMaterialCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors">
                    <option value="Course Material">Course Material</option>
                    <option value="Lecture Slides">Lecture Slides</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Reading Material">Reading Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Upload File (SCORM, ZIP, PDF, MP4)</label>
                  <div 
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      accept=".zip,.pdf,.mp4,.scorm"
                    />
                    {selectedFile ? (
                      <div>
                        <FileArchive className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button 
                          className="text-red-500 hover:text-red-600 text-xs mt-2 font-medium" 
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to browse or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">Maximum file size: 500MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => { setShowUploadModal(false); setSelectedFile(null); setUploadModuleTitle(''); setMaterialTitle('');
                    setMaterialCategory('Course Material'); setMaterialCategory('Course Material'); }}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!uploadModuleTitle.trim()) {
                    notify({ title: 'Error', message: 'Please provide a module title', type: 'error' });
                    return;
                  }
                  const existingModule = lmsModules.find(m => m.title.toLowerCase() === uploadModuleTitle.toLowerCase().trim());
                  
                  if (!selectedFile) {
                    notify({ title: 'Error', message: 'Please select a file', type: 'error' });
                    return;
                  }
                  
                  (() => {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    formData.append('title', materialTitle.trim() || selectedFile.name);
                    formData.append('description', uploadModuleTitle.trim());
                    if (selectedCourse?.id) formData.append('courseId', selectedCourse.id.toString());
                    formData.append('category', materialCategory);
                    
                    return fetch('/api/documents', {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${token}`
                      },
                      body: formData
                    });
                  })()
                  .then(res => res.json())
                  .then(newDoc => {
                    notify({ title: 'Upload Successful', message: 'Course content uploaded successfully', type: 'success' });
                    
                    // Refresh modules if the upload was for the currently selected course
                    if (selectedCourse) {
                       setSelectedCourse({ ...selectedCourse }); // trigger re-fetch
                    }
                    
                    setShowUploadModal(false); 
                    setSelectedFile(null);
                    setUploadModuleTitle('');
                    setMaterialTitle('');
                  })
                  .catch(() => {
                    notify({ title: 'Error', message: 'Failed to upload document', type: 'error' });
                  });
                }}
                className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm shadow-emerald-200"
              >
                Upload Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
