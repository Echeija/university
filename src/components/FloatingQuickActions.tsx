import React, { useState, useEffect, useRef } from 'react';
import { Plus, UploadCloud, FileText, Bot, X, FileCheck, LifeBuoy } from 'lucide-react';
import SupportTicketModal from './SupportTicketModal';
import { Link, useNavigate } from 'react-router-dom';

export default function FloatingQuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAskChatbot = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  const handleSupport = () => {
    setIsOpen(false);
    setShowSupportModal(true);
  };

  const actions = [
    { name: 'Submit Assignment', icon: UploadCloud, path: '/dashboard/lms', color: 'bg-indigo-500' },
    { name: 'View Grades', icon: FileCheck, path: '/dashboard/results', color: 'bg-blue-500' },
    { name: 'Ask Chatbot', icon: Bot, onClick: handleAskChatbot, color: 'bg-emerald-500' },
    { name: 'Support Request', icon: LifeBuoy, onClick: handleSupport, color: 'bg-amber-500' }
  ];

  return (
    <>
    <div className="fixed bottom-6 right-24 z-40 print:hidden" ref={menuRef}>
      <div className={`absolute bottom-16 right-0 mb-2 flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap">
              {action.name}
            </span>
            {action.onClick ? (
              <button 
                onClick={action.onClick}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform ${action.color}`}
                aria-label={action.name}
              >
                <action.icon className="w-5 h-5" />
              </button>
            ) : (
              <Link 
                to={action.path}
                onClick={() => setIsOpen(false)}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform ${action.color}`}
                aria-label={action.name}
              >
                <action.icon className="w-5 h-5" />
              </Link>
            )}
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all ${isOpen ? 'rotate-45' : 'hover:scale-105'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        aria-label="Quick Actions"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
    {showSupportModal && <SupportTicketModal onClose={() => setShowSupportModal(false)} />}
    </>
  );
}
