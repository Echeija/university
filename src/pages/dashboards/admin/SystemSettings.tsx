import React, { useState } from 'react';
import { Settings, Save, Database, Shield, Bell, Globe, Play, Square, CheckCircle2, XCircle } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSupabaseTheme } from '../../../hooks/useSupabaseTheme';

export default function SystemSettings() {
  const { notify } = useNotification();
  const { theme, setTheme } = useTheme();
  const { updateThemeInSupabase } = useSupabaseTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    updateThemeInSupabase(newTheme);
  };
  
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [isSessionOpen, setIsSessionOpen] = useState(true);
  const [isCourseRegOpen, setIsCourseRegOpen] = useState(true);

  const handleSave = () => {
    notify({
      title: 'Settings Saved',
      message: 'System settings have been successfully updated.',
      type: 'success'
    });
  };

  const handleToggleApplication = () => {
    setIsApplicationOpen(!isApplicationOpen);
    notify({
      title: !isApplicationOpen ? 'Application Portal Opened' : 'Application Portal Closed',
      message: `The application portal is now ${!isApplicationOpen ? 'open for new applicants' : 'closed'}.`,
      type: 'success'
    });
  };

  const handleToggleSession = () => {
    setIsSessionOpen(!isSessionOpen);
    notify({
      title: !isSessionOpen ? 'Session Opened' : 'Session Closed',
      message: `The current academic session is now ${!isSessionOpen ? 'active' : 'inactive'}.`,
      type: 'success'
    });
  };

  const handleToggleCourseReg = () => {
    setIsCourseRegOpen(!isCourseRegOpen);
    notify({
      title: !isCourseRegOpen ? 'Course Registration Opened' : 'Course Registration Closed',
      message: `Course registration is now ${!isCourseRegOpen ? 'open for students' : 'closed'}.`,
      type: 'success'
    });
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-slate-500 mt-1">Configure global application parameters and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 bg-white text-emerald-700 font-bold border-l-4 border-emerald-600 rounded-r-lg shadow-sm flex items-center gap-3">
            <Globe className="w-5 h-5" /> General
          </button>
          <button className="w-full text-left px-4 py-3 text-slate-600 font-bold hover:bg-slate-200/50 rounded-lg flex items-center gap-3 transition-colors">
            <Shield className="w-5 h-5" /> Security
          </button>
          <button className="w-full text-left px-4 py-3 text-slate-600 font-bold hover:bg-slate-200/50 rounded-lg flex items-center gap-3 transition-colors">
            <Database className="w-5 h-5" /> Backup & Storage
          </button>
          <button className="w-full text-left px-4 py-3 text-slate-600 font-bold hover:bg-slate-200/50 rounded-lg flex items-center gap-3 transition-colors">
            <Bell className="w-5 h-5" /> Notifications
          </button>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Institution Details</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Institution Name</label>
                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" defaultValue="Smart Global College of Technology" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Academic Session</label>
                <select className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium">
                  <option>2025/2026</option>
                  <option>2026/2027</option>
                  <option>2027/2028</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Semester</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="semester" defaultChecked className="text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-medium text-slate-700">1st Semester</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="semester" className="text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-medium text-slate-700">2nd Semester</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Portal Modules & Access</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-slate-900">Application Portal</div>
                    {isApplicationOpen ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" /> Closed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Allow new applicants to submit forms</div>
                </div>
                <button 
                  onClick={handleToggleApplication}
                  className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
                    isApplicationOpen 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {isApplicationOpen ? (
                    <><Square className="w-4 h-4" /> Close Portal</>
                  ) : (
                    <><Play className="w-4 h-4" /> Open Portal</>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-slate-900">Academic Session</div>
                    {isSessionOpen ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" /> Closed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Activate or deactivate the current academic session</div>
                </div>
                <button 
                  onClick={handleToggleSession}
                  className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
                    isSessionOpen 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {isSessionOpen ? (
                    <><Square className="w-4 h-4" /> Close Session</>
                  ) : (
                    <><Play className="w-4 h-4" /> Open Session</>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-slate-900">Course Registration</div>
                    {isCourseRegOpen ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" /> Closed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Allow students to register for courses</div>
                </div>
                <button 
                  onClick={handleToggleCourseReg}
                  className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
                    isCourseRegOpen 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {isCourseRegOpen ? (
                    <><Square className="w-4 h-4" /> Close Registration</>
                  ) : (
                    <><Play className="w-4 h-4" /> Open Registration</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
