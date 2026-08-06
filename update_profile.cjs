const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/student/StudentProfile.tsx', 'utf8');

// 1. Add notification imports
if (!code.includes('BellRing')) {
  code = code.replace(
    "import { User, Phone, ShieldAlert, Camera, Save, X, CheckCircle2, UploadCloud } from 'lucide-react';",
    "import { User, Phone, ShieldAlert, Camera, Save, X, CheckCircle2, UploadCloud, BellRing, Mail, MessageSquare } from 'lucide-react';"
  );
}

// 2. Add fields to formData state
if (!code.includes('paymentRemindersEmail')) {
  code = code.replace(
    "emergencyContactRelation: '',",
    "emergencyContactRelation: '',\n    paymentRemindersEmail: true,\n    paymentRemindersSMS: false,"
  );
}

// 3. Add handleToggle function
if (!code.includes('const handleToggle')) {
  code = code.replace(
    "const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {",
    "const handleToggle = (field: string) => {\n    setFormData(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));\n  };\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {"
  );
}

// 4. Add Notification Preferences section
const newSection = `          {/* Notification Preferences */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <BellRing className="w-5 h-5 text-amber-500" />
              Notification Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Email Notifications</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receive payment deadlines and receipts via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.paymentRemindersEmail}
                    onChange={() => handleToggle('paymentRemindersEmail')}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">SMS Alerts</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Get text messages for urgent payment deadlines</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.paymentRemindersSMS}
                    onChange={() => handleToggle('paymentRemindersSMS')}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">`;

if (!code.includes('Notification Preferences')) {
  code = code.replace(
    '<div className="flex justify-end pt-4">',
    newSection
  );
}

fs.writeFileSync('src/pages/dashboards/student/StudentProfile.tsx', code);
console.log("Updated StudentProfile.tsx");
