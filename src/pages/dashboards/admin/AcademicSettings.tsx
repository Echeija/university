import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Save, AlertCircle, Plus, Trash2, Settings, BookOpen, GraduationCap, Percent, FileText } from 'lucide-react';

export default function AcademicSettings() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    caMax: '30',
    examMax: '70',
    repeatCoursePolicy: 'Best Attempt Counts',
    gpaDecimalPlaces: '2',
    cgpaDecimalPlaces: '2',
    resultApprovalWorkflow: 'HOD -&gt; Registrar',
  });

  const [gradingRules, setGradingRules] = useState<any[]>([]);
  const [degreeClassification, setDegreeClassification] = useState<any[]>([]);
  const [academicStanding, setAcademicStanding] = useState<any[]>([]);
  const [transcriptSettings, setTranscriptSettings] = useState({
    registrarName: '',
    registrarSignature: '',
    customNotes: ''
  });

  const [activeTab, setActiveTab] = useState('grading');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/academic-settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      
      setSettings({
        caMax: data.caMax || '30',
        examMax: data.examMax || '70',
        repeatCoursePolicy: data.repeatCoursePolicy || 'Best Attempt Counts',
        gpaDecimalPlaces: data.gpaDecimalPlaces || '2',
        cgpaDecimalPlaces: data.cgpaDecimalPlaces || '2',
        resultApprovalWorkflow: data.resultApprovalWorkflow || 'HOD -&gt; Registrar'
      });
      setGradingRules(data.gradingRules || []);
      setDegreeClassification(data.degreeClassification || []);
      setAcademicStanding(data.academicStanding || []);
      if (data.transcriptSettings) {
        setTranscriptSettings(data.transcriptSettings);
      }
    } catch (e) {
      console.error(e);
      notify({ title: "Error", message: "Failed to load academic settings", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/academic-settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...settings,
          gradingRules,
          degreeClassification,
          academicStanding,
          transcriptSettings
        })
      });

      if (!res.ok) throw new Error("Failed to save settings");
      notify({ title: "Success", message: "Academic settings saved successfully", type: "success" });
    } catch (e) {
      console.error(e);
      notify({ title: "Error", message: "Failed to save academic settings", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Grading Rule helpers
  const addGradingRule = () => setGradingRules([...gradingRules, { minScore: 0, maxScore: 0, grade: '', gradePoint: 0, description: '', isPass: true }]);
  const removeGradingRule = (index: number) => setGradingRules(gradingRules.filter((_, i) => i !== index));
  const updateGradingRule = (index: number, field: string, value: any) => {
    const updated = [...gradingRules];
    updated[index][field] = value;
    setGradingRules(updated);
  };

  // Degree Classification helpers
  const addClassRule = () => setDegreeClassification([...degreeClassification, { minCgpa: 0, maxCgpa: 5, classification: '' }]);
  const removeClassRule = (index: number) => setDegreeClassification(degreeClassification.filter((_, i) => i !== index));
  const updateClassRule = (index: number, field: string, value: any) => {
    const updated = [...degreeClassification];
    updated[index][field] = value;
    setDegreeClassification(updated);
  };

  // Academic Standing helpers
  const addStandingRule = () => setAcademicStanding([...academicStanding, { minCgpa: 0, status: '' }]);
  const removeStandingRule = (index: number) => setAcademicStanding(academicStanding.filter((_, i) => i !== index));
  const updateStandingRule = (index: number, field: string, value: any) => {
    const updated = [...academicStanding];
    updated[index][field] = value;
    setAcademicStanding(updated);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading academic settings...</div>;
  }

  const tabs = [
    { id: 'grading', label: 'Grading System', icon: Percent },
    { id: 'assessment', label: 'Assessment Rules', icon: BookOpen },
    { id: 'classification', label: 'Degree Classification', icon: GraduationCap },
    { id: 'transcript', label: 'Transcripts & Workflow', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Settings</h1>
          <p className="text-slate-500">Configure global academic policies and rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        
        {activeTab === 'grading' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Grading System (Grade Points)</h2>
              <button onClick={addGradingRule} className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Rule
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Min Score</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Max Score</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Grade Point</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Pass/Fail</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gradingRules.map((rule, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2"><input type="number" value={rule.minScore} onChange={e => updateGradingRule(idx, 'minScore', e.target.value)} className="w-20 px-2 py-1.5 border rounded-lg" /></td>
                      <td className="px-4 py-2"><input type="number" value={rule.maxScore} onChange={e => updateGradingRule(idx, 'maxScore', e.target.value)} className="w-20 px-2 py-1.5 border rounded-lg" /></td>
                      <td className="px-4 py-2"><input type="text" value={rule.grade} onChange={e => updateGradingRule(idx, 'grade', e.target.value)} className="w-16 px-2 py-1.5 border rounded-lg font-bold uppercase" /></td>
                      <td className="px-4 py-2"><input type="number" step="0.1" value={rule.gradePoint} onChange={e => updateGradingRule(idx, 'gradePoint', e.target.value)} className="w-20 px-2 py-1.5 border rounded-lg font-mono" /></td>
                      <td className="px-4 py-2"><input type="text" value={rule.description} onChange={e => updateGradingRule(idx, 'description', e.target.value)} className="w-32 px-2 py-1.5 border rounded-lg" /></td>
                      <td className="px-4 py-2">
                        <select value={rule.isPass ? 'true' : 'false'} onChange={e => updateGradingRule(idx, 'isPass', e.target.value === 'true')} className="px-2 py-1.5 border rounded-lg">
                          <option value="true">Pass</option>
                          <option value="false">Fail</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removeGradingRule(idx)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pt-8 mt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">Academic Standing Rules</h2>
                <button onClick={addStandingRule} className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Standing Rule
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {academicStanding.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Min CGPA</label>
                        <input type="number" step="0.01" value={rule.minCgpa} onChange={e => updateStandingRule(idx, 'minCgpa', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Status Name</label>
                        <input type="text" value={rule.status} onChange={e => updateStandingRule(idx, 'status', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Good Standing" />
                      </div>
                    </div>
                    <button onClick={() => removeStandingRule(idx)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-8 max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Continuous Assessment (CA) Maximum</label>
                <input 
                  type="number" 
                  value={settings.caMax} 
                  onChange={e => setSettings({...settings, caMax: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Examination Maximum</label>
                <input 
                  type="number" 
                  value={settings.examMax} 
                  onChange={e => setSettings({...settings, examMax: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Total Score:</strong> The CA Maximum and Examination Maximum should typically sum up to 100. Current Sum: <strong>{Number(settings.caMax) + Number(settings.examMax)}</strong>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2">Repeat Course Policy</label>
              <select 
                value={settings.repeatCoursePolicy}
                onChange={e => setSettings({...settings, repeatCoursePolicy: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
              >
                <option value="Best Attempt Counts">Best Attempt Counts towards CGPA</option>
                <option value="Latest Attempt Counts">Latest Attempt Counts towards CGPA</option>
                <option value="All Attempts Cumulative">All Attempts are Cumulative</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">Determines how multiple grades for the exact same course are calculated in the student's cumulative GPA.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">GPA Decimal Places</label>
                <input 
                  type="number" 
                  min="1" max="4"
                  value={settings.gpaDecimalPlaces} 
                  onChange={e => setSettings({...settings, gpaDecimalPlaces: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">CGPA Decimal Places</label>
                <input 
                  type="number" 
                  min="1" max="4"
                  value={settings.cgpaDecimalPlaces} 
                  onChange={e => setSettings({...settings, cgpaDecimalPlaces: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classification' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Degree Classification Rules</h2>
                <p className="text-sm text-slate-500">Define the graduation honors based on final CGPA.</p>
              </div>
              <button onClick={addClassRule} className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Classification
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {degreeClassification.map((rule, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Classification Name</label>
                    <input type="text" value={rule.classification} onChange={e => updateClassRule(idx, 'classification', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm font-bold" placeholder="e.g. First Class Honours" />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Min CGPA</label>
                    <input type="number" step="0.01" value={rule.minCgpa} onChange={e => updateClassRule(idx, 'minCgpa', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Max CGPA</label>
                    <input type="number" step="0.01" value={rule.maxCgpa} onChange={e => updateClassRule(idx, 'maxCgpa', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <button onClick={() => removeClassRule(idx)} className="mt-5 text-slate-400 hover:text-red-600 p-2 bg-white rounded-lg border border-slate-200 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              
              {degreeClassification.length === 0 && (
                <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  No degree classifications defined.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="space-y-8 max-w-2xl">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Result Approval Workflow</label>
              <select 
                value={settings.resultApprovalWorkflow}
                onChange={e => setSettings({...settings, resultApprovalWorkflow: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
              >
                <option value="HOD -&gt; Registrar">Lecturer -&gt; HOD -&gt; Registrar</option>
                <option value="Direct to Registrar">Lecturer -&gt; Registrar</option>
                <option value="HOD -&gt; Senate -&gt; Registrar">Lecturer -&gt; HOD -&gt; Senate -&gt; Registrar</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">Defines the required hierarchy for publishing a student result.</p>
            </div>
            
            <div className="pt-6 border-t border-slate-100 space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Transcript Configuration</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Registrar Name (Printed on Transcript)</label>
                <input 
                  type="text" 
                  value={transcriptSettings.registrarName} 
                  onChange={e => setTranscriptSettings({...transcriptSettings, registrarName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                  placeholder="e.g. Dr. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Registrar Signature URL (Optional)</label>
                <input 
                  type="text" 
                  value={transcriptSettings.registrarSignature} 
                  onChange={e => setTranscriptSettings({...transcriptSettings, registrarSignature: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Custom Transcript Footer Notes</label>
                <textarea 
                  rows={4}
                  value={transcriptSettings.customNotes} 
                  onChange={e => setTranscriptSettings({...transcriptSettings, customNotes: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none resize-none"
                  placeholder="e.g. Any alteration or erasure renders this transcript invalid..."
                ></textarea>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
