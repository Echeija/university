import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Layout, Globe, Search, Plus, Edit, Trash2, Save, X, Eye, FileText, Image as ImageIcon, Calendar, Newspaper, ArrowRight, Upload, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { cmsService, ContentBlock, NewsEvent } from '../../services/cmsService';
import AdminActivityLog from './AdminActivityLog';
import WysiwygEditor from './WysiwygEditor';
import CMSBlockEditor from './CMSBlockEditor';
import EmergencyBroadcastForm from './EmergencyBroadcastForm';
import Markdown from 'react-markdown';

const CONTENT_SECTIONS = [
  'Home', 'About', 'Admissions', 'Departments', 'Gallery', 'Slides', 'Footer', 'Contact', 'Mission', 'Vision', 'SEO'
];

export default function AdminCMSPanel() {
  const [activeTab, setActiveTab] = useState('Overview');
  const { notify } = useNotification();
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Administrator' || user?.role === 'Content Manager';
  
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [contentMode, setContentMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (activeTab !== 'Overview' && activeTab !== 'Emergency') {
      fetchData();
      setIsEditing(false);
      setCurrentItem(null);
      setContentMode('edit');
    }
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'News' || activeTab === 'Events') {
        const data = await cmsService.getNewsEventsByType(activeTab === 'News' ? 'news' : 'event', true);
        setItems(data);
      } else if (CONTENT_SECTIONS.includes(activeTab)) {
        const data = await cmsService.getContentBlocksBySection(activeTab);
        setItems(data);
      }
    } catch (error) {
      notify({ title: 'Error', message: 'Failed to fetch content.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setIsEditing(true);
    setContentMode('edit');
  };

  const handleToggleStatus = async (item: any) => {
    try {
      const newStatus = item.status === 'Published' ? 'Draft' : 'Published';
      const isNewsEvent = activeTab === 'News' || activeTab === 'Events';
      let updatedItem;
      if (isNewsEvent) {
        updatedItem = await cmsService.updateNewsEvent(item.id, { status: newStatus });
      } else {
        updatedItem = await cmsService.updateContentBlock(item.id, { status: newStatus });
      }
      setItems(items.map(i => i.id === item.id ? updatedItem : i));
      notify({
        title: 'Status Updated',
        message: `Content is now ${newStatus}.`,
        type: 'success'
      });
    } catch (error) {
      notify({ title: 'Error', message: 'Failed to update status.', type: 'error' });
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (activeTab === 'News' || activeTab === 'Events') {
        await cmsService.deleteNewsEvent(id);
      } else {
        await cmsService.deleteContentBlock(id);
      }
      setItems(items.filter(i => i.id !== id));
      notify({
        title: 'Item Deleted',
        message: 'The content item has been removed successfully.',
        type: 'success'
      });
    } catch (error) {
      notify({ title: 'Error', message: 'Failed to delete content.', type: 'error' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let savedItem;
      const isNewsEvent = activeTab === 'News' || activeTab === 'Events';

      if (currentItem.id) {
        if (isNewsEvent) {
          savedItem = await cmsService.updateNewsEvent(currentItem.id, currentItem);
        } else {
          savedItem = await cmsService.updateContentBlock(currentItem.id, currentItem);
        }
        setItems(items.map(i => i.id === savedItem.id ? savedItem : i));
      } else {
        if (isNewsEvent) {
          const newItem = { ...currentItem, type: activeTab === 'News' ? 'news' : 'event' };
          savedItem = await cmsService.createNewsEvent(newItem);
        } else {
          const newItem = { ...currentItem, section: activeTab };
          savedItem = await cmsService.createContentBlock(newItem);
        }
        setItems([savedItem, ...items]);
      }
      
      setIsEditing(false);
      setCurrentItem(null);
      setContentMode('edit');
      notify({
        title: 'Changes Saved',
        message: 'The content has been updated successfully.',
        type: 'success'
      });
    } catch (error) {
      notify({ title: 'Error', message: 'Failed to save content.', type: 'error' });
    }
  };

  const handleRevert = async () => {
    if (!currentItem || !currentItem.id) return;
    if (!window.confirm('Are you sure you want to revert to the previous version? Unsaved changes will be lost.')) return;
    
    try {
      let revertedItem;
      const isNewsEvent = activeTab === 'News' || activeTab === 'Events';
      if (isNewsEvent) {
        revertedItem = await cmsService.revertNewsEvent(currentItem.id);
      } else {
        revertedItem = await cmsService.revertContentBlock(currentItem.id);
      }
      
      setItems(items.map(i => i.id === revertedItem.id ? revertedItem : i));
      setCurrentItem(revertedItem);
      notify({
        title: 'Content Reverted',
        message: 'Successfully reverted to the previous version.',
        type: 'success'
      });
    } catch (error: any) {
      notify({ 
        title: 'Revert Failed', 
        message: error.message || 'Could not revert content. No previous version might be available.', 
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
      setCurrentItem({ ...currentItem, image_url: url });
      notify({
        title: 'Image Uploaded',
        message: 'The image has been uploaded successfully.',
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

  const handleAddNew = () => {
    const isNewsEvent = activeTab === 'News' || activeTab === 'Events';
    setCurrentItem({ 
      title: '', 
      status: 'Draft', 
      content: '', 
      image_url: '',
      ...(isNewsEvent && { date: new Date().toISOString().split('T')[0] })
    });
    setIsEditing(true);
    setContentMode('edit');
  };

  const renderOverviewGrid = () => {
    const modules = [
      { id: 'Emergency', icon: AlertTriangle, color: 'red', title: 'Emergency Broadcast', desc: 'Send real-time alerts and push notifications to all users.' },
      { id: 'News', icon: Newspaper, color: 'blue', title: 'News Updates', desc: 'Manage university news articles and announcements.' },
      { id: 'Events', icon: Calendar, color: 'emerald', title: 'Events Calendar', desc: 'Manage upcoming events, seminars, and deadlines.' },
      { id: 'Home', icon: Layout, color: 'indigo', title: 'Home Page', desc: 'Edit the landing page hero, features, and layout blocks.' },
      { id: 'About', icon: FileText, color: 'purple', title: 'About Us', desc: 'Manage institution history, vision, and mission content.' },
      { id: 'Admissions', icon: FileText, color: 'rose', title: 'Admissions Info', desc: 'Update admission requirements, fees, and guidelines.' },
      { id: 'Gallery', icon: ImageIcon, color: 'amber', title: 'Media Gallery', desc: 'Manage campus photos and general media assets.' },
      { id: 'SEO', icon: Search, color: 'teal', title: 'SEO Manager', desc: 'Edit meta titles, descriptions, and keywords for pages.' },
    ];

    return (
      <div className="p-6 flex flex-col xl:flex-row gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">CMS Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  
                  onClick={() => setActiveTab(mod.id)}
                  className="flex flex-col text-left p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${mod.color}-50 dark:bg-${mod.color}-900/30 text-${mod.color}-600 dark:text-${mod.color}-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">{mod.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">{mod.desc}</p>
                  <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Manage Content <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="w-full xl:w-80 shrink-0">
          <AdminActivityLog />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 h-fit">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Website CMS
          </h2>
        </div>
        <div className="p-2 space-y-1">
          <button
            onClick={() => setActiveTab('Overview')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'Overview'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Overview
          </button>
          
          <div className="pt-2 pb-1 px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Critical Updates
          </div>
          <button
            onClick={() => setActiveTab('Emergency')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'Emergency'
                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Emergency Broadcast
          </button>
          
          <div className="pt-2 pb-1 px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            News & Events
          </div>
          {['News', 'Events'].map((tab) => (
            <button
              
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}

          <div className="pt-2 pb-1 px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Content Blocks
          </div>
          {CONTENT_SECTIONS.map((tab) => (
            <button
              
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {activeTab === 'Overview' ? (
          renderOverviewGrid()
        ) : activeTab === 'Emergency' ? (
          <EmergencyBroadcastForm />
        ) : !isEditing ? (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                Manage: {activeTab}
                {['Home', 'About', 'Admissions'].includes(activeTab) && (
                  <Link 
                    to={activeTab === 'Home' ? '/' : `/${activeTab.toLowerCase()}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Live Page Editor
                  </Link>
                )}
              </h2>
              {canEdit && <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Item
              </button>}
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div  className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg w-full"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => {
                    const isContentBlock = CONTENT_SECTIONS.includes(activeTab) && activeTab !== 'SEO';
                    
                    const renderCardContent = (title: string, content: string, imageUrl: string) => (
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 h-full flex flex-col group relative">
                        {(!isContentBlock && canEdit) && (
                          <button 
                            onClick={() => handleEdit(item)}
                            className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            title="Edit Content"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {imageUrl ? (
                          <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
                        ) : (
                          <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                        <div className="p-4 flex flex-col flex-1">
                          {item.status === 'Draft' && item.metadata?.draft && (
                            <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold w-fit">
                              <AlertTriangle className="w-3.5 h-3.5" /> Pending Approval
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{title}</h3>
                            {item.type && (
                              <span className="shrink-0 px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded">
                                {item.type}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                            {content || 'No content provided.'}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                                {new Date(item.created_at || item.date || Date.now()).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }}
                                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 ${
                                    item.status === 'Published' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                                  }`}
                                  title={`Click to change status to ${item.status === 'Published' ? 'Draft' : 'Published'}`}
                                >
                                  <span
                                    className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                                      item.status === 'Published' ? 'translate-x-3.5' : 'translate-x-1'
                                    }`}
                                    style={{ transform: item.status === 'Published' ? 'translateX(14px)' : 'translateX(4px)' }}
                                  />
                                </button>
                                <span className={`text-[10px] font-medium uppercase tracking-wider ${
                                  item.status === 'Published' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                            {canEdit && <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>}
                          </div>
                        </div>
                      </div>
                    );

                    if (isContentBlock) {
                      return (
                        <CMSBlockEditor
                          
                          section={activeTab}
                          title={item.title}
                          defaultContent={item.content}
                          defaultImageUrl={item.image_url}
                          showImage={true}
                          className="h-full"
                          renderContent={renderCardContent}
                        />
                      );
                    }

                    return (
                      <div  className="h-full">
                        {renderCardContent(item.title, item.content, item.image_url)}
                      </div>
                    );
                  })}
                  
                  {items.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Layout className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                      <p>No content found for {activeTab}.</p>
                      {canEdit && <button 
                        onClick={handleAddNew}
                        className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Create your first item
                      </button>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {currentItem?.id ? 'Edit' : 'Add New'} {activeTab} Item
              </h2>
              <div className="flex gap-2">
                {currentItem?.metadata?.versions?.length > 0 && (
                  <button 
                    type="button"
                    onClick={handleRevert}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Revert
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Content
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {activeTab === 'SEO' ? 'Page Name (e.g. Home, About)' : 'Title / Heading'}
                    </label>
                    <input 
                      type="text" 
                      required
                      value={currentItem?.title || ''}
                      onChange={e => setCurrentItem({...currentItem, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      placeholder={activeTab === 'SEO' ? 'e.g., Home' : 'Enter a descriptive title'}
                    />
                  </div>
                  
                  {activeTab === 'SEO' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Meta Title
                      </label>
                      <input 
                        type="text" 
                        value={currentItem?.metadata?.meta_title || ''}
                        onChange={e => setCurrentItem({...currentItem, metadata: { ...currentItem.metadata, meta_title: e.target.value }})}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        placeholder="e.g., Home | University Name"
                      />
                    </div>
                  )}
                  
                  {(activeTab === 'News' || activeTab === 'Events') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Date
                        </label>
                        <input 
                          type="date"
                          value={currentItem?.date || ''}
                          onChange={e => setCurrentItem({...currentItem, date: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      {activeTab === 'Events' && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Location
                          </label>
                          <input 
                            type="text"
                            value={currentItem?.location || ''}
                            onChange={e => setCurrentItem({...currentItem, location: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            placeholder="Event location"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {activeTab === 'SEO' ? 'Meta Description' : 'Content Body'}
                      </label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setContentMode('edit')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${contentMode === 'edit' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentMode('preview')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${contentMode === 'preview' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                    {contentMode === 'edit' ? (
                      <WysiwygEditor value={currentItem?.content || ''} onChange={(val) => setCurrentItem({...currentItem, content: val})} />
                    ) : (
                      <div className="w-full px-4 py-4 h-[300px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-y-auto prose prose-sm prose-slate dark:prose-invert max-w-none">
                        {currentItem?.content ? (
                          <div dangerouslySetInnerHTML={{ __html: currentItem.content }} />
                        ) : (
                          <span className="text-slate-500 italic">No content provided yet.</span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">Supports markdown or plain text formatting for displays on the website.</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select 
                      value={currentItem?.status || 'Draft'}
                      onChange={e => setCurrentItem({...currentItem, status: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="Draft">Draft (Hidden)</option>
                      <option value="Published">Published (Live)</option>
                    </select>
                  </div>
                  
                  {activeTab === 'SEO' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Meta Keywords
                      </label>
                      <textarea 
                        rows={3}
                        value={currentItem?.metadata?.keywords || ''}
                        onChange={e => setCurrentItem({...currentItem, metadata: { ...currentItem.metadata, keywords: e.target.value }})}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        placeholder="education, university, learning..."
                      />
                    </div>
                  )}

                  {(activeTab === 'News' || activeTab === 'Events') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Schedule Publish Date
                      </label>
                      <input 
                        type="datetime-local"
                        value={currentItem?.publish_date ? new Date(currentItem.publish_date).toISOString().slice(0, 16) : ''}
                        onChange={e => setCurrentItem({...currentItem, publish_date: e.target.value ? new Date(e.target.value).toISOString() : null})}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <p className="text-xs text-slate-500 mt-1">Leave empty to publish immediately.</p>
                    </div>
                  )}
                  
                  {activeTab !== 'SEO' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Image (Optional)
                    </label>
                    <input 
                      type="text"
                      value={currentItem?.image_url || ''}
                      onChange={e => setCurrentItem({...currentItem, image_url: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-2"
                      placeholder="https://... or upload below"
                    />
                    
                    <div className="mb-4">
                      <label className={`flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors justify-center font-medium text-sm border border-slate-200 dark:border-slate-700 ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload className="w-4 h-4" />
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

                    {currentItem?.image_url ? (
                      <img src={currentItem.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg h-32 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50">
                        <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500">No image specified</p>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                Live Preview
              </h3>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex-1">
              <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                {currentItem?.image_url && (
                  <img src={currentItem.image_url} alt="Cover" className="w-full h-64 sm:h-80 object-cover rounded-xl mb-8" />
                )}
                
                {(activeTab === 'News' || activeTab === 'Events') && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {activeTab === 'News' ? 'News Article' : 'Event'}
                    </span>
                    {currentItem?.date && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4" /> 
                        {new Date(currentItem.date).toLocaleDateString(undefined, {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                )}
                
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  {currentItem?.title || 'Untitled Content'}
                </h1>
                
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                  {currentItem?.content ? (
                    <Markdown>{currentItem.content}</Markdown>
                  ) : (
                    'No content provided yet.'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

