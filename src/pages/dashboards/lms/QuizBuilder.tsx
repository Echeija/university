import { useState } from 'react';
import { Plus, Trash2, Clock, Save, FileText, CheckCircle2, Edit2, X } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';

type QuestionType = 'multiple-choice' | 'essay';

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For multiple-choice
  correctOptionIndex?: number; // For multiple-choice
  points: number;
}

interface QuizBuilderProps {
  courseId: string;
  onSave: (quiz: any) => void;
  onCancel: () => void;
}

export default function QuizBuilder({ courseId, onSave, onCancel }: QuizBuilderProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const { notify } = useNotification();

  const [isBankOpen, setIsBankOpen] = useState(false);

  const [questionBank, setQuestionBank] = useState<Question[]>([
    {
      id: 'qb1',
      type: 'multiple-choice' as QuestionType,
      text: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
      correctOptionIndex: 1,
      points: 2
    },
    {
      id: 'qb2',
      type: 'essay' as QuestionType,
      text: 'Explain the process of photosynthesis.',
      points: 10
    },
    {
      id: 'qb3',
      type: 'multiple-choice' as QuestionType,
      text: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      correctOptionIndex: 1,
      points: 1
    }
  ]);

  const [editingBankQuestion, setEditingBankQuestion] = useState<Question | null>(null);

  const handleSaveBankQuestion = (q: Question) => {
    if (questionBank.find(bq => bq.id === q.id)) {
      setQuestionBank(questionBank.map(bq => bq.id === q.id ? q : bq));
      notify({
        title: 'Question Updated',
        message: 'Question successfully updated in the bank.',
        type: 'success'
      });
    } else {
      setQuestionBank([...questionBank, q]);
      notify({
        title: 'Question Added',
        message: 'Question successfully added to the bank.',
        type: 'success'
      });
    }
    setEditingBankQuestion(null);
  };

  const deleteBankQuestion = (id: string) => {
    setQuestionBank(questionBank.filter(bq => bq.id !== id));
    notify({
      title: 'Question Deleted',
      message: 'Question removed from the bank.',
      type: 'info'
    });
  };

  const importFromBank = (q: any) => {
    setQuestions([...questions, { ...q, id: Math.random().toString(36).substring(7) }]);
    notify({
      title: 'Question Imported',
      message: 'Question added to the current assessment.',
      type: 'success'
    });
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(7),
      type,
      text: '',
      points: 1,
      ...(type === 'multiple-choice' ? { options: ['', ''], correctOptionIndex: 0 } : {})
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { 
          ...q, 
          options: q.options.filter((_, idx) => idx !== optionIndex),
          correctOptionIndex: q.correctOptionIndex === optionIndex ? 0 : q.correctOptionIndex
        };
      }
      return q;
    }));
  };

  const handleSave = () => {
    onSave({
      title,
      duration: parseInt(duration),
      questions
    });
    notify({
      title: 'Assessment Saved',
      message: 'The assessment has been successfully created.',
      type: 'success'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className={`lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Create New Assessment</h3>
            <button
              onClick={() => setIsBankOpen(!isBankOpen)}
              className="lg:hidden text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-1"
            >
              <FileText className="w-4 h-4" /> Question Bank
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Mid-term Examination"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (minutes)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="number"
                min="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50">
            <div className="flex justify-between items-start mb-4">
              <span className="font-bold text-slate-700 dark:text-slate-300">Question {index + 1} ({q.type})</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <label className="text-slate-600 dark:text-slate-400">Points:</label>
                  <input
                    type="number"
                    min="1"
                    value={q.points}
                    onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                    className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-600 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <textarea
              value={q.text}
              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              placeholder="Enter your question here..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] mb-4"
            />

            {q.type === 'multiple-choice' && q.options && (
              <div className="space-y-3">
                {q.options.map((option, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuestion(q.id, { correctOptionIndex: optIdx })}
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        q.correctOptionIndex === optIdx
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-500'
                      }`}
                    >
                      {q.correctOptionIndex === optIdx && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                      placeholder={`Option ${optIdx + 1}`}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => removeOption(q.id, optIdx)}
                      disabled={q.options!.length <= 2}
                      className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(q.id)}
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-2"
                >
                  <Plus className="w-4 h-4" /> Add Option
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-4 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button
            onClick={() => addQuestion('multiple-choice')}
            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Multiple Choice
          </button>
          <button
            onClick={() => addQuestion('essay')}
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <FileText className="w-4 h-4" /> Add Essay Question
          </button>
        </div>
      </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title || questions.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Save Quiz
          </button>
        </div>
      </div>

      <div className={`lg:block ${isBankOpen ? 'block' : 'hidden'} bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden h-fit sticky top-24`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" /> Question Bank
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage and import questions.</p>
          </div>
          <button 
            onClick={() => setEditingBankQuestion({ id: Math.random().toString(36).substring(7), type: 'multiple-choice', text: '', points: 1, options: ['', ''], correctOptionIndex: 0 })}
            className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
            title="Create New Question"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {editingBankQuestion && (
            <div className="p-3 border-2 border-emerald-500 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Editing Question</span>
                <button onClick={() => setEditingBankQuestion(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
              <textarea 
                value={editingBankQuestion.text}
                onChange={(e) => setEditingBankQuestion({...editingBankQuestion, text: e.target.value})}
                placeholder="Question text..."
                className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 mb-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                rows={2}
              />
              <div className="flex gap-2 mb-2">
                <select 
                  value={editingBankQuestion.type}
                  onChange={(e) => setEditingBankQuestion({...editingBankQuestion, type: e.target.value as QuestionType, options: e.target.value === 'multiple-choice' ? ['', ''] : undefined})}
                  className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="essay">Essay</option>
                </select>
                <input 
                  type="number"
                  min="1"
                  value={editingBankQuestion.points}
                  onChange={(e) => setEditingBankQuestion({...editingBankQuestion, points: parseInt(e.target.value) || 1})}
                  className="w-16 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none"
                  title="Points"
                />
              </div>
              {editingBankQuestion.type === 'multiple-choice' && editingBankQuestion.options && (
                <div className="space-y-2 mb-3">
                  {editingBankQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="radio" 
                        name="correctOpt" 
                        checked={editingBankQuestion.correctOptionIndex === idx}
                        onChange={() => setEditingBankQuestion({...editingBankQuestion, correctOptionIndex: idx})}
                        className="text-emerald-500"
                      />
                      <input 
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editingBankQuestion.options!];
                          newOpts[idx] = e.target.value;
                          setEditingBankQuestion({...editingBankQuestion, options: newOpts});
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 outline-none"
                      />
                    </div>
                  ))}
                  <button onClick={() => setEditingBankQuestion({...editingBankQuestion, options: [...editingBankQuestion.options!, '']})} className="text-xs text-emerald-600 font-medium">+ Add Option</button>
                </div>
              )}
              <button 
                onClick={() => handleSaveBankQuestion(editingBankQuestion)}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Save to Bank
              </button>
            </div>
          )}

          {questionBank.map((q) => (
            <div key={q.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors group">
              <div className="flex justify-between items-start gap-2 mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{q.text}</p>
                <button
                  onClick={() => importFromBank(q)}
                  className="shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 rounded transition-colors"
                  title="Add to current quiz"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex gap-2">
                  <span className="capitalize bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{q.type.replace('-', ' ')}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingBankQuestion(q)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteBankQuestion(q.id)} className="p-1 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded text-slate-600 dark:text-slate-400" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
