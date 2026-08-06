import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, FileText, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export default function ClinicAppointmentWidget() {
  const { notify } = useNotification();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    timeSlot: '',
    reason: ''
  });

  const doctors = [
    { id: 'doc-1', name: 'Dr. Gregory House', specialization: 'General Practice' },
    { id: 'doc-2', name: 'Dr. Sarah Jenkins', specialization: 'Internal Medicine' },
    { id: 'doc-3', name: 'Dr. Michael Chen', specialization: 'Sports Medicine' }
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
  ];

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
      notify({
        title: 'Appointment Confirmed',
        message: 'Your consultation has been securely scheduled.',
        type: 'success'
      });
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-rose-500" />
          Clinic Consultation
        </h3>
        {step < 3 && (
          <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
            Step {step} of 2
          </span>
        )}
      </div>

      {step === 1 && (
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Physician
            </label>
            <div className="grid gap-2">
              {doctors.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => setFormData({ ...formData, doctorId: doc.id })}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                    formData.doctorId === doc.id 
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-rose-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.doctorId === doc.id ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{doc.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{doc.specialization}</p>
                  </div>
                  {formData.doctorId === doc.id && (
                    <CheckCircle2 className="w-5 h-5 text-rose-500 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            disabled={!formData.doctorId}
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Continue to Schedule <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="date"
                required
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(time => (
                <div
                  key={time}
                  onClick={() => setFormData({ ...formData, timeSlot: time })}
                  className={`text-center py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${
                    formData.timeSlot === time
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300'
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Reason for Visit (Confidential)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <textarea
                required
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly describe your symptoms or reason for consultation..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium resize-none text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.date || !formData.timeSlot || !formData.reason}
              className="flex-[2] py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Confirmed</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your consultation with {doctors.find(d => d.id === formData.doctorId)?.name} is scheduled for {formData.date} at {formData.timeSlot}.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-left border border-slate-100 dark:border-slate-700 mb-6">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Secure Note</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic">"Please arrive 10 minutes early and bring your student ID card."</p>
          </div>
          <button
            onClick={() => {
              setStep(1);
              setFormData({ doctorId: '', date: '', timeSlot: '', reason: '' });
            }}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Book Another Consultation
          </button>
        </div>
      )}
    </div>
  );
}
