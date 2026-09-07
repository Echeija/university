import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Plus, Search, Tag, Filter, Edit, Trash2, CheckCircle, HelpCircle, Upload, X, AlertCircle, Save, History, RotateCcw, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';

interface Question {
  id: number;
  text: string;
  tags: string[];
  options: string[];
  correctOptionIndex: number;
}

interface BankVersion {
  id: string;
  timestamp: Date;
  questions: Question[];
}

export default function LmsQuestionBank() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);

  const [versions, setVersions] = useState<BankVersion[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<BankVersion | null>(null);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: 'What is the time complexity of binary search?',
      tags: ['Algorithms', 'Easy'],
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
      correctOptionIndex: 2
    },
    {
      id: 2,
      text: 'Which normal form deals with multivalued dependencies?',
      tags: ['Database', 'Hard'],
      options: ['1NF', '2NF', '3NF', '4NF'],
      correctOptionIndex: 3
    },
    {
      id: 3,
      text: 'What is the design pattern used to restrict instantiation of a class to one object?',
      tags: ['Software Engineering', 'Medium'],
      options: ['Factory', 'Singleton', 'Observer', 'Decorator'],
      correctOptionIndex: 1
    }
  ]);

  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)));

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? q.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setShowImportModal(true);
    setImportProgress(0);
    setPreviewQuestions([]);

    // simulate file reading progress for UX
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        parseFile(file);
      }
    }, 150);
  };

  const parseFile = (file: File) => {
    const fileReader = new FileReader();

    if (file.name.endsWith('.json')) {
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const newQuestions: Question[] = parsed.map((item, index) => ({
              id: Date.now() + index,
              text: item.text || 'Untitled Question',
              tags: Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []),
              options: Array.isArray(item.options) ? item.options : ['', '', '', ''],
              correctOptionIndex: typeof item.correctOptionIndex === 'number' ? item.correctOptionIndex : 0
            }));
            setPreviewQuestions(newQuestions);
          } else {
             throw new Error("Invalid format");
          }
        } catch (error) {
          console.error("Failed to parse JSON", error);
          alert("Invalid JSON format");
          setShowImportModal(false);
        }
      };
      fileReader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const newQuestions: Question[] = results.data.map((item: any, index) => {
            const tags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
            const options = [
              item.option1 || '',
              item.option2 || '',
              item.option3 || '',
              item.option4 || ''
            ];
            const correctIndex = parseInt(item.correctOptionIndex, 10);
            return {
              id: Date.now() + index,
              text: item.text || 'Untitled Question',
              tags,
              options,
              correctOptionIndex: isNaN(correctIndex) ? 0 : correctIndex
            };
          });
          setPreviewQuestions(newQuestions);
        },
        error: (error: any) => {
          console.error("Failed to parse CSV", error);
          alert("Invalid CSV format");
          setShowImportModal(false);
        }
      });
    } else {
      alert("Please upload a .csv or .json file");
      setShowImportModal(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    setQuestions(prev => [...prev, ...previewQuestions]);
    setShowImportModal(false);
    setPreviewQuestions([]);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setPreviewQuestions([]);
    setImportProgress(0);
  };

  const saveVersion = () => {
    const newVersion: BankVersion = {
      id: Date.now().toString(),
      timestamp: new Date(),
      questions: JSON.parse(JSON.stringify(questions))
    };
    setVersions([newVersion, ...versions]);
  };

  const confirmRestore = () => {
    if (versionToRestore) {
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

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-600 mt-1">Store, tag, and manage reusable questions for quizzes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <History className="w-5 h-5" /> History ({versions.length})
          </button>
          <button 
            onClick={saveVersion}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-5 h-5" /> Save Version
          </button>
          <input 
            type="file" 
            accept=".csv,.json" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-5 h-5" /> Import
          </button>
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-5 h-5" /> New Question
          </button>
        </div>
      </motion.div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar for Tags & Filters */}
        <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50 p-6 flex flex-col shrink-0">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-500" /> Filters
          </h2>
          
          <div className="space-y-2 mb-8">
            <button 
              onClick={() => setSelectedTag(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTag === null ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              All Questions
            </button>
            {allTags.map(tag => (
              <button 
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${selectedTag === tag ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <span className="flex items-center gap-2"><Tag className="w-3 h-3" /> {tag}</span>
                <span className="bg-white/50 px-1.5 rounded text-xs">{questions.filter(q => q.tags.includes(tag)).length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Questions List */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col">
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by text..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <AnimatePresence>
              {filteredQuestions.map(q => (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-colors bg-white shadow-sm group"
                >
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <h3 className="font-bold text-slate-900 text-lg flex items-start gap-2 leading-snug">
                      <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      {q.text}
                    </h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <div className="pl-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`text-sm px-3 py-2 rounded-lg border ${q.correctOptionIndex === i ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold flex items-center gap-2' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                          {q.correctOptionIndex === i && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {opt}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {q.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredQuestions.length === 0 && (
                <div className="text-center py-12 text-slate-500 font-medium">
                  No questions found matching your criteria.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <h3 className="font-bold text-lg text-slate-900">Import Questions</h3>
                <button onClick={closeImportModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col p-6">
                {importProgress < 100 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                     <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-indigo-600 animate-bounce" />
                     </div>
                     <div className="w-full max-w-md space-y-2">
                        <div className="flex justify-between text-sm font-bold text-slate-700">
                          <span>Processing file...</span>
                          <span>{importProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full" style={{ width: `${importProgress}%` }}></div>
                        </div>
                     </div>
                  </div>
                ) : previewQuestions.length > 0 ? (
                  <div className="flex flex-col h-full space-y-4">
                     <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 shrink-0">
                       <CheckCircle className="w-5 h-5" />
                       <span className="font-medium">Successfully parsed {previewQuestions.length} questions. Please review them below before confirming.</span>
                     </div>
                     
                     <div className="flex-1 overflow-auto border border-slate-200 rounded-xl rounded-t-xl bg-slate-50">
                        <div className="overflow-x-auto"><table className="w-full text-left border-collapse">
                          <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Question</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Tags</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Options</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase text-center">Correct</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {previewQuestions.map((q, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm text-slate-900 font-medium max-w-[200px] truncate" title={q.text}>{q.text}</td>
                                <td className="px-4 py-3 text-xs">
                                  <div className="flex flex-wrap gap-1">
                                    {q.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{t}</span>)}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate" title={q.options.join(', ')}>
                                  {q.options.join(', ')}
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-bold text-emerald-600">
                                  Option {q.correctOptionIndex + 1}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table></div>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
                    <p className="font-medium text-slate-900 text-lg">No valid questions found.</p>
                    <p className="mt-1 text-sm">Please check your CSV/JSON format and try again.</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button 
                  onClick={closeImportModal}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmImport}
                  disabled={importProgress < 100 || previewQuestions.length === 0}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  <Database className="w-4 h-4" /> Confirm Import
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
                    <p className="text-sm mt-1">Click "Save Version" to create your first version.</p>
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
                        <p className="text-sm text-slate-600 font-medium">{v.questions.length} questions</p>
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
    </div>
  );
}
