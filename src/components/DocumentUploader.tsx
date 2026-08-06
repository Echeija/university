import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, Download, Trash2, Loader2, File } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface DocumentUploaderProps {
  path: string;
  title: string;
  description?: string;
  readOnly?: boolean;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  timeCreated: string;
  fullPath: string;
}

export default function DocumentUploader({ path, title, description, readOnly = false }: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, [path]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const folderRef = ref(storage, path);
      const res = await listAll(folderRef);
      const filePromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        return {
          name: itemRef.name,
          url,
          size: metadata.size,
          timeCreated: metadata.timeCreated,
          fullPath: itemRef.fullPath
        };
      });
      const fileData = await Promise.all(filePromises);
      setFiles(fileData.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()));
    } catch (error: any) {
      // console.error("Error fetching files:", error.message);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      notify({ title: 'Error', message: 'Only PDF, DOCX, JPG, and PNG files are allowed', type: 'error' });
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      notify({ title: 'Error', message: 'File must be less than 50MB', type: 'error' });
      return;
    }

    uploadFile(selectedFile);
  };

  const uploadFile = (file: globalThis.File) => {
    if (!user) return;
    setIsUploading(true);
    setUploadProgress(0);

    const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        notify({ title: 'Upload Failed', message: error.message, type: 'error' });
      },
      async () => {
        setIsUploading(false);
        notify({ title: 'Success', message: 'File uploaded successfully', type: 'success' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchFiles();
      }
    );
  };

  const handleDelete = async (fullPath: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const fileRef = ref(storage, fullPath);
      await deleteObject(fileRef);
      notify({ title: 'Success', message: 'File deleted', type: 'success' });
      fetchFiles();
    } catch (error: any) {
      notify({ title: 'Error', message: 'Failed to delete file: ' + error.message, type: 'error' });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {title}
          </h3>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
      </div>

      {!readOnly && (
        <div className="mb-6">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Uploading...</p>
                <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Click or drag to upload</h4>
                <p className="text-xs text-slate-500 mt-1">PDF, DOCX, Images up to 50MB</p>
              </>
            )}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
          Shared Files
        </h4>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <File className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No files uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {file.name.replace(/^\d+_/, '')}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>{new Date(file.timeCreated).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {!readOnly && (
                    <button 
                      onClick={() => handleDelete(file.fullPath)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
