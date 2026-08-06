import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useCountdownTimer } from '../../../hooks/useCountdownTimer';
import { useNotification } from '../../../contexts/NotificationContext';

interface QuizTakingProps {
  quiz: any; // We'll just pass the quiz object built by QuizBuilder
  onComplete: (score: number, answers: any) => void;
  onCancel: () => void;
}

export default function QuizTaking({ quiz, onComplete, onCancel }: QuizTakingProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { notify } = useNotification();

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    setShowConfirmation(false);
    setIsSubmitting(true);
    
    // Simulate API call for auto/manual submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    const finalScore = calculateScore();
    setScore(finalScore);
    localStorage.removeItem(`quiz_draft_${quiz.id}`);
    setIsSubmitting(false);
    
    notify({
      title: 'Assessment Submitted',
      message: 'Your responses have been successfully recorded.',
      type: 'success'
    });
  };

  const timeLeft = useCountdownTimer(
    quiz.duration * 60,
    handleSubmit,
    !isSubmitted && !isSubmitting
  );

  useEffect(() => {
    const draft = localStorage.getItem(`quiz_draft_${quiz.id}`);
    if (draft) {
      try {
        setAnswers(JSON.parse(draft));
      } catch (e) {}
    }
  }, [quiz.id]);

  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    setIsSaving(true);
    const saveTimer = setTimeout(() => {
      localStorage.setItem(`quiz_draft_${quiz.id}`, JSON.stringify(answers));
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [answers, quiz.id]);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerChange = (value: any) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const calculateScore = () => {
    let currentScore = 0;
    quiz?.questions?.forEach((q: any) => {
      if (q.type === 'multiple-choice') {
        if (answers[q.id] === q.correctOptionIndex) {
          currentScore += q.points;
        }
      }
      // Essays need manual grading, so we ignore them for auto-score
    });
    return currentScore;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const maxScore = quiz.questions.reduce((acc: number, q: any) => acc + (q.type === 'multiple-choice' ? q.points : 0), 0);
  const essayPoints = quiz.questions.reduce((acc: number, q: any) => acc + (q.type === 'essay' ? q.points : 0), 0);

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center max-w-2xl mx-auto mt-8">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Quiz Completed!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Your responses have been recorded successfully.</p>
        
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-700 mb-8 inline-block min-w-[250px]">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Auto-Graded Score</p>
          <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
            {score} / {maxScore}
          </div>
          {essayPoints > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              + {essayPoints} points pending manual review for essay questions.
            </p>
          )}
        </div>

        <div>
          <button
            onClick={() => onComplete(score, answers)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            Return to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">{quiz.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            )}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold font-mono ${timeLeft < 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-6">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {quiz.questions.map((q: any, idx: number) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                currentQuestionIndex === idx
                  ? 'bg-emerald-600 text-white border-transparent'
                  : answers[q.id] !== undefined && answers[q.id] !== ''
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{currentQuestion.text}</h4>
            <span className="shrink-0 ml-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold px-3 py-1 rounded-full">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'pt' : 'pts'}
            </span>
          </div>
          
          {currentQuestion.type === 'multiple-choice' && (
            <div className="space-y-3 mt-6">
              {currentQuestion.options.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerChange(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    answers[currentQuestion.id] === idx
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    answers[currentQuestion.id] === idx
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {answers[currentQuestion.id] === idx && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-slate-700 dark:text-slate-200">{option}</span>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'essay' && (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mt-4"
            />
          )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Exit
          </button>
          
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={() => setShowConfirmation(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
              className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Submitting Assessment...</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Please wait while we record your responses.</p>
          </div>
        </div>
      )}

      {showConfirmation && !isSubmitting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Submit Assessment?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              You are about to submit your quiz. Make sure you have answered all questions. You cannot undo this action.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
