import { Helmet } from 'react-helmet-async';
import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Image as ImageIcon, Upload, Settings, AlertTriangle } from 'lucide-react';
import WysiwygEditor from './WysiwygEditor';

import { cmsService, ContentBlock } from '../../services/cmsService';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

interface CMSBlockEditorProps {
  section: string;
  title: string;
  defaultContent?: string;
  defaultImageUrl?: string;
  showImage?: boolean;
  className?: string;
  renderContent?: (title: string, content: string, imageUrl: string) => React.ReactNode;
}

export default function CMSBlockEditor({
  section,
  title,
  defaultContent = '',
  defaultImageUrl = '',
  showImage = false,
  className = '',
  renderContent
}: CMSBlockEditorProps) {
  const [block, setBlock] = useState<ContentBlock | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [ogImage, setOgImage] = useState('');


  const { notify } = useNotification();
  const { user } = useAuth();
  
  const isContentManager = user?.role === 'Content Manager';
  const isSuperAdmin = user?.role === 'Admin' || user?.role === 'Administrator' || user?.role === 'ICT Admin' || user?.role === 'Portal';
  const isAdmin = isContentManager || isSuperAdmin;
  const hasDraft = block?.status === 'Draft' && block?.metadata?.draft;

  useEffect(() => {
    fetchBlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, title]);

  const fetchBlock = async () => {
    setIsLoading(true);
    try {
      const blocks = await cmsService.getContentBlocksBySection(section);
      const foundBlock = blocks.find(b => b.title === title);
      
      if (foundBlock) {
        setBlock(foundBlock);
        const draft = foundBlock.status === 'Draft' && foundBlock.metadata?.draft;
        const source = draft ? draft : foundBlock;
        setEditTitle(source.title || '');
        setEditContent(source.content || defaultContent);
        setEditImageUrl(source.image_url || source.imageUrl || defaultImageUrl);
        setMetaTitle(source.meta_title || foundBlock.metadata?.meta_title || '');
        setMetaDesc(source.meta_desc || foundBlock.metadata?.meta_desc || '');
        setOgImage(source.og_image || foundBlock.metadata?.og_image || '');
      } else {
        // Fallback to defaults if not found
        setEditTitle(title);
        setEditContent(defaultContent);
        setEditImageUrl(defaultImageUrl);
      }
    } catch (error: any) {
      if (error.message !== 'Failed to fetch') {
        console.error('Failed to fetch block:', error);
      }
      // Fallback
      setEditTitle(title);
      setEditContent(defaultContent);
      setEditImageUrl(defaultImageUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectDraft = async () => {
    try {
      if (block?.id) {
        const newMetadata = { ...block.metadata };
        delete newMetadata.draft;
        const updated = await cmsService.updateContentBlock(block.id, {
          status: 'Published', // revert to published
          metadata: newMetadata
        });
        setBlock(updated);
        setIsEditing(false);
        notify({ title: 'Draft Rejected', message: 'The draft has been discarded.', type: 'info' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'Failed to reject draft.', type: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      if (block?.id) {
        if (isContentManager) {
          const draftData = {
            title: editTitle,
            content: editContent,
            image_url: editImageUrl,
            meta_title: metaTitle,
            meta_desc: metaDesc,
            og_image: ogImage,
          };
          const updated = await cmsService.updateContentBlock(block.id, {
            status: 'Draft',
            metadata: {
              ...block.metadata,
              draft: draftData
            }
          });
          setBlock(updated);
          notify({ title: 'Draft Saved', message: 'Changes submitted for admin approval.', type: 'success' });
        } else {
          const newMetadata = { ...block.metadata };
          delete newMetadata.draft;
          const updated = await cmsService.updateContentBlock(block.id, {
            title: editTitle,
            content: editContent,
            image_url: editImageUrl,
            status: 'Published',
            metadata: {
              ...newMetadata,
              meta_title: metaTitle,
              meta_desc: metaDesc,
              og_image: ogImage,
            }
          });
          setBlock(updated);
          notify({ title: 'Published', message: 'Changes are now live.', type: 'success' });
        }
      } else {
        const created = await cmsService.createContentBlock({
          section,
          title: editTitle,
          content: editContent,
          image_url: editImageUrl,
          status: isContentManager ? 'Draft' : 'Published',
          metadata: isContentManager ? {
            draft: {
              title: editTitle,
              content: editContent,
              image_url: editImageUrl,
              meta_title: metaTitle,
              meta_desc: metaDesc,
              og_image: ogImage,
            }
          } : {
            meta_title: metaTitle,
            meta_desc: metaDesc,
            og_image: ogImage,
          }
        });
        if (isContentManager && created) {
           created.title = '';
           created.content = '';
        }
        setBlock(created);
        notify({ title: isContentManager ? 'Draft Created' : 'Published', message: isContentManager ? 'Submitted for approval.' : 'Content is live.', type: 'success' });
      }
      setIsEditing(false);
      notify({
        title: 'Content Saved',
        message: 'The content block has been updated successfully.',
        type: 'success'
      });
    } catch (error) {
      notify({
        title: 'Save Failed',
        message: 'Could not save the content block.',
        type: 'error'
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await cmsService.uploadImage(file);
      setEditImageUrl(url);
      notify({
        title: 'Image Uploaded',
        message: 'The image has been uploaded successfully. Click Save to apply.',
        type: 'success'
      });
    } catch (error) {
      notify({ title: 'Upload Failed', message: 'Could not upload the image.', type: 'error' });
    } finally {
      setIsUploadingImage(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const displayTitle = block?.title || editTitle || title;
  const displayContent = block?.content || editContent || defaultContent;
  const displayImageUrl = block?.image_url || editImageUrl || defaultImageUrl;


  const renderSeoTags = () => {
    if (!block?.metadata) return null;
    const { meta_title, meta_desc, og_image } = block.metadata;
    if (!meta_title && !meta_desc && !og_image) return null;
    
    return (
      <Helmet>
        {meta_title && <title>{meta_title}</title>}
        {meta_desc && <meta name="description" content={meta_desc} />}
        {meta_title && <meta property="og:title" content={meta_title} />}
        {meta_desc && <meta property="og:description" content={meta_desc} />}
        {og_image && <meta property="og:image" content={og_image} />}
      </Helmet>
    );
  };

  if (isLoading) {
    return <div className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg h-32 w-full"></div>;
  }

  if (isEditing) {
    return (
      <div className={`border-2 border-indigo-500 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-lg ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Editing: {section} / {title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {isContentManager ? 'Submit for Approval' : 'Publish'}
            </button>
            {hasDraft && isSuperAdmin && (
              <button
                onClick={handleRejectDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
            <button
              type="button"
              onClick={() => setShowSeoPanel(!showSeoPanel)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
              SEO Settings {showSeoPanel ? '(Hide)' : '(Show)'}
            </button>
          </div>
          
          {showSeoPanel && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  placeholder="e.g. Home | SGCT"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  placeholder="Brief description of the page for search engines..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Open Graph Image URL</label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Heading</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Body Text</label>
            <WysiwygEditor value={editContent} onChange={setEditContent} />
          </div>

          {showImage && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Image (Optional)
              </label>
              <input
                type="text"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white mb-2"
                placeholder="https://example.com/image.jpg or upload below"
              />
              <label className={`flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors justify-center font-medium text-xs border border-slate-200 dark:border-slate-700 ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-3.5 h-3.5" />
                {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  disabled={isUploadingImage}
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Custom render prop if provided
  if (renderContent && !isEditing) {
    return (
      <>
      {renderSeoTags()}
      <div className={`relative group ${className}`}>
        {hasDraft && isSuperAdmin && (
          <div className="absolute top-4 left-4 p-2 bg-amber-500 text-white rounded-lg shadow-lg z-50 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pending Draft
          </div>
        )}
        {isAdmin && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 p-3 bg-indigo-600 text-white rounded-xl shadow-xl z-50 opacity-100 hover:bg-indigo-700 transition-colors flex items-center justify-center cursor-pointer"
            title="Edit Content"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {renderContent(displayTitle, displayContent, displayImageUrl)}
      </div>
      </>
    );
  }

  return (
    <>
    {renderSeoTags()}
    <div className={`relative group ${className}`}>
      {hasDraft && isSuperAdmin && (
        <div className="absolute top-4 left-4 p-2 bg-amber-500 text-white rounded-lg shadow-lg z-50 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Pending Draft
        </div>
      )}
      {isAdmin && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-3 bg-indigo-600 text-white rounded-xl shadow-xl z-50 opacity-100 hover:bg-indigo-700 transition-colors flex items-center justify-center cursor-pointer"
          title="Edit Content"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      {showImage && displayImageUrl && (
        <img
          src={displayImageUrl}
          alt={displayTitle}
          className="w-full h-auto object-cover rounded-lg mb-4"
        />
      )}
      
      {displayTitle && <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{displayTitle}</h3>}
      {displayContent && (
        <div 
          className="text-slate-600 dark:text-slate-400 prose prose-sm dark:prose-invert max-w-none" 
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      )}
    </div>
    </>
  );
}
