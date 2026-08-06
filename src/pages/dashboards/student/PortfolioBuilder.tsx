import React, { useState, useEffect } from 'react';
import { Briefcase, Layout, Plus, Trash2, Award, ExternalLink, Globe, Github, Linkedin, Camera } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';

export default function PortfolioBuilder() {
  const { user, token } = useAuth();
  const { notify } = useNotification();
  
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'general' | 'projects' | 'experience' | 'certificates'>('general');
  
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // Modals for adding items
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', linkUrl: '' });
  
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [newExperience, setNewExperience] = useState({ company: '', role: '', startDate: '', endDate: '', description: '' });
  
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [newCertificate, setNewCertificate] = useState({ name: '', issuer: '', dateIssued: '', credentialUrl: '' });

  useEffect(() => {
    fetchPortfolio();
  }, [token]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio', {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
        setBio(data.bio || '');
        setSkills(data.skills || '');
        setGithubUrl(data.githubUrl || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setWebsiteUrl(data.websiteUrl || '');
        setIsPublic(data.isPublic || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bio, skills, githubUrl, linkedinUrl, websiteUrl, isPublic })
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Portfolio updated successfully', type: 'success' });
        fetchPortfolio();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to update portfolio', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portfolio/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Project added', type: 'success' });
        setShowProjectModal(false);
        setNewProject({ title: '', description: '', linkUrl: '' });
        fetchPortfolio();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to add project', type: 'error' });
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      const res = await fetch(`/api/portfolio/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Project deleted', type: 'success' });
        fetchPortfolio();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete project', type: 'error' });
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portfolio/experiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify(newExperience)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Experience added', type: 'success' });
        setShowExperienceModal(false);
        setNewExperience({ company: '', role: '', startDate: '', endDate: '', description: '' });
        fetchPortfolio();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to add experience', type: 'error' });
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      const res = await fetch(`/api/portfolio/experiences/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Experience deleted', type: 'success' });
        fetchPortfolio();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete experience', type: 'error' });
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portfolio/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCertificate)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Certificate added', type: 'success' });
        setShowCertificateModal(false);
        setNewCertificate({ name: '', issuer: '', dateIssued: '', credentialUrl: '' });
        fetchPortfolio();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to add certificate', type: 'error' });
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    try {
      const res = await fetch(`/api/portfolio/certificates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Certificate deleted', type: 'success' });
        fetchPortfolio();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete certificate', type: 'error' });
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Loading portfolio data...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-emerald-600" />
            Portfolio Builder
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your public profile, projects, and experiences.</p>
        </div>
        
        {isPublic && user?.username && (
          <a 
            href={`/portfolio/${user.username}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Profile
          </a>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {['general', 'projects', 'experience', 'certificates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8">
        
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">General Information</h2>
                <p className="text-sm text-slate-500">This information will be displayed on your public profile.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Public Profile</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
                className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white resize-none"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Skills (comma separated)</label>
              <input 
                type="text" 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js, Python"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub URL</label>
                <input 
                  type="url" 
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn URL</label>
                <input 
                  type="url" 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Globe className="w-4 h-4" /> Personal Website</label>
                <input 
                  type="url" 
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic & Personal Projects</h2>
              <button 
                onClick={() => setShowProjectModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
            
            {portfolio?.projects?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <Layout className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No projects yet</h3>
                <p className="text-slate-500 mt-1">Add your best work to showcase your skills.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio?.projects?.map((p: any) => (
                  <div key={p.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden group">
                    <div className="h-32 bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                      <Layout className="w-8 h-8 text-slate-300" />
                      <button 
                        onClick={() => handleDeleteProject(p.id)}
                        className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{p.description}</p>
                      {p.linkUrl && (
                        <a href={p.linkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                          View Project <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Internships & Work Experience</h2>
              <button 
                onClick={() => setShowExperienceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
            
            {portfolio?.experiences?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No experience listed</h3>
                <p className="text-slate-500 mt-1">Add your internships or part-time roles.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolio?.experiences?.map((e: any) => (
                  <div key={e.id} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl relative group">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{e.role}</h3>
                      <div className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-1">{e.company}</div>
                      <div className="text-xs text-slate-500 mb-2">{e.startDate} - {e.endDate || 'Present'}</div>
                      {e.description && <p className="text-sm text-slate-600 dark:text-slate-400">{e.description}</p>}
                    </div>
                    <button 
                      onClick={() => handleDeleteExperience(e.id)}
                      className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Certificates & Awards</h2>
              <button 
                onClick={() => setShowCertificateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Add Certificate
              </button>
            </div>
            
            {portfolio?.certificates?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No certificates yet</h3>
                <p className="text-slate-500 mt-1">Showcase your certifications and achievements.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {portfolio?.certificates?.map((c: any) => (
                  <div key={c.id} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl relative group items-center">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{c.name}</h3>
                      <div className="text-sm text-slate-500 truncate">{c.issuer}</div>
                      {c.dateIssued && <div className="text-xs text-slate-400 mt-1">Issued: {c.dateIssued}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      {c.credentialUrl && (
                        <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => handleDeleteCertificate(c.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Project</h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title</label>
                <input required type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea required value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} rows={3} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white resize-none"></textarea>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Project URL (Optional)</label>
                <input type="url" value={newProject.linkUrl} onChange={e => setNewProject({...newProject, linkUrl: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Experience</h3>
            <form onSubmit={handleAddExperience} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company</label>
                <input required type="text" value={newExperience.company} onChange={e => setNewExperience({...newExperience, company: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Role</label>
                <input required type="text" value={newExperience.role} onChange={e => setNewExperience({...newExperience, role: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                  <input required type="month" value={newExperience.startDate} onChange={e => setNewExperience({...newExperience, startDate: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">End Date</label>
                  <input type="month" value={newExperience.endDate} onChange={e => setNewExperience({...newExperience, endDate: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description (Optional)</label>
                <textarea value={newExperience.description} onChange={e => setNewExperience({...newExperience, description: e.target.value})} rows={2} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowExperienceModal(false)} className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Add Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Certificate</h3>
            <form onSubmit={handleAddCertificate} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Certificate Name</label>
                <input required type="text" value={newCertificate.name} onChange={e => setNewCertificate({...newCertificate, name: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Issuer</label>
                <input required type="text" value={newCertificate.issuer} onChange={e => setNewCertificate({...newCertificate, issuer: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date Issued (Optional)</label>
                <input type="month" value={newCertificate.dateIssued} onChange={e => setNewCertificate({...newCertificate, dateIssued: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Credential URL (Optional)</label>
                <input type="url" value={newCertificate.credentialUrl} onChange={e => setNewCertificate({...newCertificate, credentialUrl: e.target.value})} className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCertificateModal(false)} className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Add Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
