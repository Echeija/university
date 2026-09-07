import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { CheckCircle2, AlertCircle, Calendar, Printer } from 'lucide-react';

export default function SemesterRegistration() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { notify } = useNotification();
  const { user } = useAuth();

  const handleRegister = () => {
    setIsRegistering(true);
    setTimeout(() => {
      setRegistered(true);
      setIsRegistering(false);
      notify({
        title: "Semester Registered",
        message: "You have successfully registered for the upcoming semester.",
        type: "success"
      });
    }, 1500);
  };

  return (
    <div id="print-area" className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Semester Registration</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Activate your student status for the current academic term.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium print:hidden shadow-sm">
          <Printer className="w-4 h-4" />
          <span>Print Registration</span>
        </button>
      </div>

      {registered ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Registration Complete</h3>
          <p className="text-slate-600 dark:text-slate-400">You are successfully registered for the 2026/2027 Academic Session (Fall Semester).</p>
          <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Student ID: {user?.id}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  Upcoming Semester
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  2026/2027 Academic Session - Fall Semester
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Financial clearance confirmed</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Previous results published</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300">Pending advisor approval (Not blocking)</span>
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold rounded-xl transition-colors"
              >
                {isRegistering ? "Processing..." : "Complete Semester Registration"}
              </button>
            </div>
            
            <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-700 text-sm">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Registration Requirements</h4>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400 list-disc list-inside">
                <li>All prior fees must be cleared.</li>
                <li>No active disciplinary holds.</li>
                <li>Medical clearance up to date.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
