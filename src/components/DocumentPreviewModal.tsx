import React from 'react';
import { X } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  title: string;
}

export default function DocumentPreviewModal({ isOpen, onClose, documentUrl, title }: DocumentPreviewModalProps) {
  if (!isOpen) return null;

  const isPdf = documentUrl.startsWith('data:application/pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto min-h-[50vh] bg-slate-50 flex items-center justify-center">
          {documentUrl ? (
            isPdf ? (
              <iframe 
                src={documentUrl} 
                className="w-full h-[70vh] rounded-xl border border-slate-200 bg-white"
                title={title}
              />
            ) : (
              <img 
                src={documentUrl} 
                alt={title} 
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm"
              />
            )
          ) : (
            <p className="text-slate-500 font-medium">No document selected</p>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
