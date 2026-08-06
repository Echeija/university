import React, { useState } from 'react';
import { Shield, Lock, Unlock, Activity, Syringe, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function StudentMedicalHistory() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [isPrompting, setIsPrompting] = useState(false);

  const medicalHistory = [
    { condition: 'Asthma', diagnosisDate: '2015-04-12', status: 'Managed', physician: 'Dr. Sarah Jenkins' },
    { condition: 'Peanut Allergy', diagnosisDate: '2010-08-22', status: 'Severe', physician: 'Dr. Michael Chen' }
  ];

  const immunizations = [
    { vaccine: 'COVID-19 (Pfizer)', date: '2021-09-15', status: 'Completed', nextDue: 'N/A' },
    { vaccine: 'Influenza', date: '2023-10-01', status: 'Completed', nextDue: '2024-10-01' },
    { vaccine: 'Hepatitis B', date: '2018-05-10', status: 'Completed', nextDue: 'N/A' },
    { vaccine: 'Tetanus, Diphtheria, Pertussis (Tdap)', date: '2019-06-20', status: 'Completed', nextDue: '2029-06-20' }
  ];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') { // Dummy PIN for demo
      setIsUnlocked(true);
      setIsPrompting(false);
      setPin('');
      notify({
        title: 'Authentication Successful',
        message: 'Medical records decrypted and unlocked.',
        type: 'success'
      });
    } else {
      notify({
        title: 'Authentication Failed',
        message: 'Incorrect security PIN.',
        type: 'error'
      });
    }
  };

  const togglePrompt = () => {
    if (isUnlocked) {
      setIsUnlocked(false);
    } else {
      setIsPrompting(!isPrompting);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Protected Health Information (PHI)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Secure Medical & Immunization Records
            </p>
          </div>
        </div>
        <button
          onClick={togglePrompt}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            isUnlocked
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
          }`}
        >
          {isUnlocked ? (
            <><EyeOff className="w-4 h-4" /> Hide Records</>
          ) : (
            <><Eye className="w-4 h-4" /> View Records</>
          )}
        </button>
      </div>

      {isPrompting && !isUnlocked && (
        <div className="absolute inset-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex flex-col items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-sm w-full text-center">
            <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Security Verification</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Please enter your 4-digit medical PIN to access your protected health records. (Hint: 1234)
            </p>
            <form onSubmit={handleUnlock}>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="••••"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrompting(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pin.length < 4}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" /> Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`p-6 space-y-6 transition-all duration-500 ${isUnlocked ? 'opacity-100 filter-none' : 'opacity-40 blur-md select-none'}`}>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            Medical History
          </h4>
          <div className="grid gap-3">
            {medicalHistory.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {item.condition}
                    {item.status === 'Severe' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Diagnosed: {item.diagnosisDate} • Physician: {item.physician}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Severe' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-blue-500" />
            Immunization Records
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Vaccine</th>
                  <th className="px-4 py-3">Date Administered</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg">Next Due</th>
                </tr>
              </thead>
              <tbody>
                {immunizations.map((imm, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{imm.vaccine}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{imm.date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {imm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{imm.nextDue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {!isUnlocked && !isPrompting && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-600">
            <Lock className="w-4 h-4" /> Records Locked for Privacy
          </div>
        </div>
      )}
    </div>
  );
}
