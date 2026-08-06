import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UnifiedPortalWidget() {
  const [activeTab, setActiveTab] = useState<'info' | 'login'>('info');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col min-h-[420px]">
      <div className="p-8 pb-4 flex justify-between items-center bg-white/50">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Unified Portal
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('info')} className={`w-3 h-3 rounded-full transition-colors ${activeTab === 'info' ? 'bg-emerald-500' : 'bg-slate-300'}`} title="Info"></button>
          <button onClick={() => setActiveTab('login')} className={`w-3 h-3 rounded-full transition-colors ${activeTab === 'login' ? 'bg-purple-500' : 'bg-slate-300'}`} title="Login"></button>
        </div>
      </div>
      
      <div className="flex-1 relative p-8 pt-2">
        <AnimatePresence mode="wait">
          {activeTab === 'info' ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('login')}>
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">🎓</div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Student Management</h4>
                  <p className="text-[10px] text-emerald-700">Course Reg, Results, Fees</p>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('login')}>
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">💻</div>
                <div>
                  <h4 className="font-bold text-purple-900 text-sm">Next-Gen LMS</h4>
                  <p className="text-[10px] text-purple-700">Live Classes & CBT Exams</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('login')}>
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-xl">📄</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">E-Registry</h4>
                  <p className="text-[10px] text-slate-600">Transcripts & Document Uploads</p>
                </div>
              </div>

              <button onClick={() => setActiveTab('login')} className="block text-center w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 uppercase tracking-wider text-xs hover:opacity-90 transition-opacity">
                Access Dashboard
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="mb-4">
                   <h4 className="font-bold text-slate-900 text-lg">Quick Login</h4>
                   <p className="text-xs text-slate-500">Sign in to access your portal</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-[11px] font-medium p-2 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition-all font-medium text-slate-900 outline-none"
                      placeholder="student@smartglobal.edu.ng"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition-all font-medium text-slate-900 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-200 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-purple-700 hover:opacity-90 transition-opacity uppercase tracking-wider disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setActiveTab('info')} className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">
                    &larr; Back to Features
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
