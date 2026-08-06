import React, { useState } from 'react';
import CMSBlockEditor from '../components/cms/CMSBlockEditor';

import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { coursesList } from '../lib/courses';

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseOfStudy: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          courseOfStudy: '',
          message: ''
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 5000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to submit inquiry');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          ADMISSION OPEN
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Admissions</h1>
        <p className="text-lg text-slate-600">Join the next generation of tech innovators and problem solvers in West Africa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Application Portal Card */}
        <CMSBlockEditor
          section="Admissions"
          title="Ready to Apply"
          defaultContent="All admission applications are handled securely through our new student applicant portal. Create an account to begin your journey with Smart Global College of Technology."
          renderContent={(displayTitle, displayContent) => (
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 text-center flex flex-col justify-center h-full">
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{displayTitle || "Ready to Apply?"}</h2>
              <div className="text-slate-600 mb-8 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: displayContent }} />
              
              <a href="/register-applicant" className="inline-flex w-full justify-center mt-auto py-4 bg-gradient-to-r from-emerald-600 to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 uppercase tracking-wider text-sm hover:opacity-90 transition-opacity">
                Create Applicant Account
              </a>
              <div className="mt-6 text-sm font-medium text-slate-600">
                Already have an account? <a href="/login" className="text-emerald-600 hover:underline">Log in here</a>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-500">
                <p>Demo Note: Use <strong className="text-slate-700">applicant@smartglobal.edu.ng</strong> (Password: password123) to access the application dashboard.</p>
              </div>
            </div>
          )}
        />

        {/* Inquiry Form */}
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Have Questions?</h2>
          <p className="text-slate-500 mb-8 text-sm">Send us an inquiry and our admissions team will get back to you shortly.</p>
          
          {status === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Inquiry Sent!</h3>
              <p className="text-emerald-600 text-sm">Thank you for reaching out. We will review your message and reply via email soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-bold text-slate-700">Full Name *</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-sm font-bold text-slate-700">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-sm"
                    placeholder="+234..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="courseOfStudy" className="text-sm font-bold text-slate-700">Courses</label>
                  <select 
                    id="courseOfStudy"
                    name="courseOfStudy"
                    value={formData.courseOfStudy}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-sm"
                  >
                    <option value="">Select a Course</option>
                    {coursesList.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-bold text-slate-700">Your Message *</label>
                <textarea 
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-sm resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {status === 'submitting' ? (
                  <>Processing...</>
                ) : (
                  <>
                    Send Inquiry <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
