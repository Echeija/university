import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, X, Upload, CheckCircle2 } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { useNotification } from '../../contexts/NotificationContext';

interface WysiwygEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{url: string, name: string}[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{file: File, url: string} | null>(null);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const { notify } = useNotification();

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectionRange(selection.getRangeAt(0));
    }
  };

  const restoreSelection = () => {
    if (selectionRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRange);
      }
    }
  };

  const execCmd = (cmd: string, val: string | null = null) => {
    document.execCommand(cmd, false, val || undefined);
    handleInput();
  };

  const loadMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch('/api/cms/media', {
        headers: { 'Authorization': `Bearer \${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data);
      }
    } catch (e) {
      console.error('Failed to load media', e);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const openImageModal = () => {
    saveSelection();
    setShowImageModal(true);
    loadMedia();
  };

  const insertImage = (url: string) => {
    setShowImageModal(false);
    
    // Slight delay to allow modal to close and focus to return to editor
    setTimeout(() => {
      editorRef.current?.focus();
      restoreSelection();
      execCmd('insertImage', url);
    }, 50);
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage({ file, url: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (file: File) => {
    setPreviewImage(null);
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await cmsService.uploadImage(file);
      notify({ title: 'Success', message: 'Image uploaded', type: 'success' });
      await loadMedia(); // Refresh list
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to upload image', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 relative">
      <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onMouseDown={(e) => { 
           e.preventDefault(); 
           const url = prompt('Enter link URL:'); 
           if (url) execCmd('createLink', url); 
         }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); openImageModal(); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Insert Image">
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={(e) => { handleInput(); saveSelection(); }}
        className="p-3 min-h-[150px] outline-none text-sm text-slate-900 dark:text-white prose prose-sm dark:prose-invert max-w-none"
      />

      {/* Image Manager Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" /> Image Manager
              </h2>
              <button 
                type="button" 
                onClick={() => setShowImageModal(false)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              <div 
                className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {previewImage ? (
                    <div className="flex flex-col items-center">
                      <img src={previewImage.url} alt="Preview" className="max-h-48 rounded-lg mb-4 shadow-md object-contain" />
                      <div className="flex gap-3">
                        <button 
                          type="button" 
                          onClick={() => setPreviewImage(null)} 
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg text-sm font-medium transition-colors"
                          disabled={isUploading}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleFileUpload(previewImage.file)} 
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                          disabled={isUploading}
                        >
                          {isUploading ? 'Uploading...' : 'Confirm Upload'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">Drag and drop an image here</p>
                      <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                            // Reset the input value so the same file can be selected again if canceled
                            e.target.value = '';
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isUploading ? 'Uploading...' : 'Select File'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Media Library</h3>
                
                {isLoadingMedia ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                  </div>
                ) : mediaFiles.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p>No images found. Upload one to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {mediaFiles.map((file, i) => (
                      <div 
                        key={i}
                        onClick={() => insertImage(file.url)}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-indigo-500 cursor-pointer transition-all"
                      >
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md scale-50 group-hover:scale-100 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
