import { motion, AnimatePresence } from 'motion/react';
import { FileText, CheckCircle, Clock, AlertCircle, UploadCloud } from 'lucide-react';
import { useState } from 'react';

export default function LmsAssignments() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Dijkstra Algorithm Implementation', course: 'CS401', dueDate: 'Oct 15, 2026', status: 'pending', type: 'code' },
    { id: 2, title: 'Database Normalization Essay', course: 'CS302', dueDate: 'Oct 18, 2026', status: 'submitted', type: 'doc', grade: '95/100' },
    { id: 3, title: 'Midterm Project Proposal', course: 'CS450', dueDate: 'Oct 10, 2026', status: 'late', type: 'pdf' },
  ]);

  const handleSubmit = (id: number) => {
    // In a real app, this would open a file picker
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'submitted' } : a
    ));
    alert('Assignment submitted successfully!');
  };

  const filtered = assignments.filter(a => {
    if (activeTab === 'Pending') return a.status === 'pending' || a.status === 'late';
    if (activeTab === 'Submitted') return a.status === 'submitted' && !a.grade;
    return a.grade;
  });

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="text-slate-600 mt-1">Submit your work and track your grades.</p>
      </motion.div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {['Pending', 'Submitted', 'Graded'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-12 text-center text-slate-500"
              >
                No assignments found for this category.
              </motion.div>
            ) : (
              filtered.map((assignment) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  key={assignment.id} 
                  className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    assignment.status === 'pending' ? 'bg-indigo-100 text-indigo-600' :
                    assignment.status === 'submitted' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-rose-100 text-rose-600'
                  }`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{assignment.course}</span>
                      {assignment.status === 'late' && <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Overdue</span>}
                      {assignment.status === 'submitted' && <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Submitted</span>}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{assignment.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" /> Due: {assignment.dueDate}
                    </p>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex items-center gap-4">
                    {assignment.grade && (
                      <div className="text-right mr-4">
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Grade</div>
                        <div className="font-black text-emerald-600 text-lg">{assignment.grade}</div>
                      </div>
                    )}

                    {assignment.status === 'pending' || assignment.status === 'late' ? (
                      <button 
                        onClick={() => handleSubmit(assignment.id)}
                        className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" /> Submit Work
                      </button>
                    ) : (
                      <button className="w-full md:w-auto px-6 py-2.5 border-2 border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                        View Submission
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
