import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Video, PlayCircle, MoreVertical, Download, X, Upload } from 'lucide-react';
import { useState, useRef } from 'react';

export default function LmsCourses() {
  const courses = [
    { id: 1, title: 'Advanced Algorithms', code: 'CS401', instructor: 'Prof. Alan Turing', progress: 45, color: 'bg-indigo-500' },
    { id: 2, title: 'Database Management', code: 'CS302', instructor: 'Dr. Edgar Codd', progress: 78, color: 'bg-emerald-500' },
    { id: 3, title: 'Software Engineering', code: 'CS450', instructor: 'Margaret Hamilton', progress: 20, color: 'bg-purple-500' },
  ];

  const [modules, setModules] = useState([
    { title: 'Week 1: Introduction to Graph Theory', type: 'video', duration: '45 mins', size: '', due: '' },
    { title: 'Graph Traversal Algorithms.pdf', type: 'pdf', duration: '', size: '2.4 MB', due: '' },
    { title: 'Assignment 1: Dijkstra Implementation', type: 'assignment', duration: '', size: '', due: 'Oct 15' }
  ]);

  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('pdf');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;
    
    let size = '';
    let duration = '';
    let due = '';
    
    if (uploadType === 'pdf' || uploadType === 'ppt') {
       size = uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB';
    } else if (uploadType === 'video') {
       duration = '30 mins'; // mock
    } else if (uploadType === 'assignment') {
       due = 'Next Week'; // mock
    }
    
    setModules([...modules, {
      title: uploadTitle,
      type: uploadType,
      duration,
      size,
      due
    }]);
    
    setIsUploading(false);
    setUploadTitle('');
    setUploadFile(null);
    setUploadType('pdf');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <p className="text-slate-600 mt-1">Access your course materials, video lectures, and resources.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        <div className="w-full lg:w-1/3 overflow-y-auto pr-2 space-y-4 shrink-0">
          {courses.map((course) => (
            <div 
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedCourse.id === course.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`px-2 py-1 rounded text-xs font-bold text-white ${course.color}`}>
                  {course.code}
                </div>
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{course.instructor}</p>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className={`${course.color} h-1.5 rounded-full`} style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-6 border-b border-slate-200 shrink-0">
            <h2 className="text-2xl font-bold text-slate-900">{selectedCourse.title}</h2>
            <p className="text-slate-600">Course Materials & Modules</p>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Current Module</h3>
              
              <AnimatePresence>
              {modules.map((mod, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      mod.type === 'video' ? 'bg-rose-100 text-rose-600' :
                      (mod.type === 'pdf' || mod.type === 'ppt') ? 'bg-blue-100 text-blue-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {mod.type === 'video' && <PlayCircle className="w-5 h-5" />}
                      {(mod.type === 'pdf' || mod.type === 'ppt') && <FileText className="w-5 h-5" />}
                      {mod.type === 'assignment' && <BookOpen className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{mod.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {mod.type === 'video' ? mod.duration : (mod.type === 'pdf' || mod.type === 'ppt') ? mod.size : `Due: ${mod.due}`}
                      </p>
                    </div>
                  </div>
                  {(mod.type === 'pdf' || mod.type === 'ppt') && (
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
            
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100 text-center border-dashed">
              <p className="text-slate-500 text-sm mb-3">Teachers can upload new materials here.</p>
              <button 
                onClick={() => setIsUploading(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                + Upload Material (PDF, PPT, MP4)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Upload Course Material</h3>
              <button onClick={() => setIsUploading(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Material Title</label>
                <input 
                  type="text" 
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Chapter 4: Dynamic Programming"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Material Type</label>
                <select 
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="pdf">Document (PDF)</option>
                  <option value="ppt">Presentation (PPT)</option>
                  <option value="video">Video Lecture (MP4)</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              
              {uploadType !== 'assignment' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-700">
                      {uploadFile ? uploadFile.name : 'Click to select file'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF, PPTX, MP4 up to 50MB
                    </p>
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Upload Material
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
