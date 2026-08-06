import React from 'react';
import { X, ChevronLeft, ChevronRight, Download, FileText, Video, PlayCircle } from 'lucide-react';

export default function LMSContentViewer({ item, onClose, onNext, onPrev }: { item: any, onClose: () => void, onNext?: () => void, onPrev?: () => void }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 shrink-0">
        <div className="flex items-center gap-4 text-white">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            {item.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          </div>
          <h2 className="font-bold text-lg">{item.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {(item.type === 'document' || item.docData) && (
            <a 
              href={item.docData?.fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Download
            </a>
          )}
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        {item.docData?.fileUrl ? (
          <div className="w-full h-full max-w-5xl mx-auto flex flex-col justify-center relative p-4">
            {item.docData.fileType?.startsWith('image/') ? (
              <img src={item.docData.fileUrl} alt={item.title} className="max-w-full max-h-full object-contain mx-auto" />
            ) : item.docData.fileType?.startsWith('video/') ? (
              <video src={item.docData.fileUrl} controls className="w-full h-full max-h-[80vh] rounded-xl bg-black" />
            ) : (
              <iframe src={item.docData.fileUrl} title={item.title} className="w-full h-full bg-white rounded-xl" />
            )}
          </div>
        ) : item.type === 'video' ? (
          <div className="w-full h-full max-w-5xl mx-auto flex flex-col justify-center relative group">
            <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative shadow-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105 shadow-xl">
                  <PlayCircle className="w-10 h-10 ml-1" />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center px-6 gap-4">
                <button className="text-white hover:text-emerald-400"><PlayCircle className="w-6 h-6" /></button>
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                  <div className="w-1/3 h-full bg-emerald-500 rounded-full"></div>
                </div>
                <div className="text-white text-xs font-medium font-mono">03:45 / {item.duration || '10:00'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full max-w-4xl mx-auto bg-white overflow-hidden flex flex-col rounded-t-xl mt-4 shadow-2xl">
            <div className="h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-center gap-4 text-slate-600">
              <button className="p-1 hover:bg-slate-200 rounded"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-medium">Preview Unavailable</span>
              <button className="p-1 hover:bg-slate-200 rounded"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 p-12 overflow-y-auto flex items-center justify-center">
              <p className="text-slate-500">This mock content cannot be previewed. Please upload a real file.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <button 
          onClick={onPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-0"
          disabled={!onPrev}
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
        </button>
        <button 
          onClick={onNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-0"
          disabled={!onNext}
        >
          <ChevronRight className="w-6 h-6 ml-1" />
        </button>
      </div>
    </div>
  );
}
