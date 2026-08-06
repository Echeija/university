import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Github, Linkedin, Globe, Briefcase, Layout, Award, User, ExternalLink, Mail } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

export default function PublicPortfolio() {
  const { username } = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, [username]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`/api/portfolio/public/${username}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        setError('Portfolio not found or private');
      }
    } catch (e) {
      setError('Failed to fetch portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 max-w-5xl mx-auto">
        <SkeletonLoader type="profile" className="mb-8" />
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }
  if (error || !data) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6"><Layout className="w-16 h-16 text-slate-300 mb-4" /><h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Portfolio Not Found</h1><p className="text-slate-500">{error}</p></div>;

  const { user, portfolio } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Header */}
      <div className="bg-emerald-800 text-white pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          <div className="w-32 h-32 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 border-4 border-emerald-800 overflow-hidden shadow-xl">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-emerald-800" />
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
            <p className="text-emerald-200 text-lg">{user.role}</p>
          </div>
          <div className="flex items-center gap-3 pb-2">
            {portfolio.githubUrl && (
              <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" className="p-3 bg-emerald-700/50 hover:bg-emerald-600 rounded-xl transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
            {portfolio.linkedinUrl && (
              <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" className="p-3 bg-emerald-700/50 hover:bg-emerald-600 rounded-xl transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {portfolio.websiteUrl && (
              <a href={portfolio.websiteUrl} target="_blank" rel="noreferrer" className="p-3 bg-emerald-700/50 hover:bg-emerald-600 rounded-xl transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            )}
            <a href={`mailto:${user.username}@university.edu`} className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold transition-colors shadow-lg">
              <Mail className="w-4 h-4" /> Contact
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About Me</h3>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap text-sm leading-relaxed">
              {portfolio.bio || "No bio provided yet."}
            </p>
          </div>

          {portfolio.skills && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.split(',').map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Projects */}
          {portfolio.projects?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Layout className="w-6 h-6 text-emerald-600" />
                Featured Projects
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {portfolio.projects.map((p: any) => (
                  <div key={p.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-40 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                      <Layout className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{p.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">{p.description}</p>
                      {p.linkUrl && (
                        <a href={p.linkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                          View Project <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {portfolio.experiences?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-emerald-600" />
                Experience
              </h2>
              <div className="space-y-4">
                {portfolio.experiences.map((e: any) => (
                  <div key={e.id} className="flex gap-5 bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{e.role}</h3>
                      <div className="text-slate-700 dark:text-slate-300 font-medium mb-1">{e.company}</div>
                      <div className="text-sm text-slate-500 mb-3">{e.startDate} - {e.endDate || 'Present'}</div>
                      {e.description && <p className="text-sm text-slate-600 dark:text-slate-400">{e.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certificates */}
          {portfolio.certificates?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-600" />
                Certifications
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {portfolio.certificates.map((c: any) => (
                  <div key={c.id} className="flex gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl items-center">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{c.name}</h3>
                      <div className="text-sm text-slate-600 dark:text-slate-300 truncate">{c.issuer}</div>
                      {c.dateIssued && <div className="text-xs text-slate-500 mt-1">Issued: {c.dateIssued}</div>}
                    </div>
                    {c.credentialUrl && (
                      <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg shrink-0">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
