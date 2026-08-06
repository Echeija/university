import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Reply, User, Plus, ArrowLeft, Send, Loader2, Paperclip, FileText, Pin, BarChart2 } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function LMSDiscussions({ courseId }: { courseId: string | number }) {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewState, setViewState] = useState<'list' | 'create' | 'thread'>('list');
  const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [replies, setReplies] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [isUploadingReply, setIsUploadingReply] = useState(false);

const [mentionState, setMentionState] = useState<{ active: boolean; query: string; cursor: number; target: 'discussion' | 'reply' }>({ active: false, query: '', cursor: 0, target: 'discussion' });
  const [directoryUsers, setDirectoryUsers] = useState<any[]>([]);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const handleFileUpload = async (file: File) => {
    // Basic implementation since we can't reliably load firebase here easily
    // In reality this would upload to S3, Supabase, or Firebase
    return URL.createObjectURL(file);
  };




  useEffect(() => {
    if (viewState === 'thread' && selectedDiscussion) {
      const updated = discussions.find(d => d.id === selectedDiscussion.id);
      if (updated) {
        setSelectedDiscussion(updated);
      }
    }
  }, [discussions]);

  useEffect(() => {
    if (viewState === 'list') {
      fetchDiscussions();
    }
  }, [courseId, viewState, token]);

  const fetchDiscussions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data);
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to fetch discussions', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      let attachmentUrl = null;
      let attachmentName = null;
      
      if (attachment) {
        setIsUploading(true);
        attachmentUrl = await handleFileUpload(attachment);
        attachmentName = attachment.name;
        setIsUploading(false);
      }

      // Format poll options
      const formattedPollOptions = pollOptions.filter(o => o.trim() !== '');

      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title: newTitle, 
          content: newContent, 
          attachmentUrl, 
          attachmentName,
          pollOptions: formattedPollOptions.length >= 2 ? formattedPollOptions : []
        })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Discussion created', type: 'success' });
        setNewTitle('');
        setNewContent('');
        setAttachment(null);
        setPollOptions(['', '']);
        setViewState('list');
      } else {
        notify({ title: 'Error', message: 'Failed to create discussion', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleVote = async (discussionId: number, optionId: number) => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/poll/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ optionId })
      });
      if (res.ok) {
        fetchDiscussions();
      }
    } catch (e) {
      console.error('Failed to vote', e);
    }
  };

  const handleUnvote = async (discussionId: number) => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/poll/vote`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDiscussions();
      }
    } catch (e) {
      console.error('Failed to unvote', e);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedDiscussion) return;
    
    try {
      setIsSubmitting(true);
            let attachmentUrl = null;
      let attachmentName = null;
      
      if (replyAttachment) {
        setIsUploadingReply(true);
        attachmentUrl = await handleFileUpload(replyAttachment);
        attachmentName = replyAttachment.name;
        setIsUploadingReply(false);
      }

      const res = await fetch(`/api/discussions/${selectedDiscussion.id}/replies`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: replyContent, attachmentUrl, attachmentName })
      });
      
      if (res.ok) {
        setReplyContent('');
        setReplyAttachment(null);
        loadReplies(selectedDiscussion.id);
        
        // Optimistically update reply count in list if we go back
        setDiscussions(prev => prev.map(d => 
          d.id === selectedDiscussion.id ? { ...d, replyCount: (d.replyCount || 0) + 1 } : d
        ));
      } else {
        notify({ title: 'Error', message: 'Failed to post reply', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handlePinDiscussion = async (e: React.MouseEvent, discussionId: number, currentPinStatus: boolean) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/discussions/${discussionId}/pin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isPinned: !currentPinStatus })
      });
      if (res.ok) {
        notify({ title: 'Success', message: `Discussion ${!currentPinStatus ? 'pinned' : 'unpinned'}`, type: 'success' });
        fetchDiscussions();
        if (selectedDiscussion && selectedDiscussion.id === discussionId) {
          setSelectedDiscussion({ ...selectedDiscussion, isPinned: !currentPinStatus });
        }
      } else {
        notify({ title: 'Error', message: 'Failed to pin discussion', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    }
  };

  const canPin = user?.role === 'Administrator' || user?.role === 'Academic Officer' || user?.role === 'Lecturer';

  const handleLikeDiscussion = async (e: React.MouseEvent, discussionId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { liked } = await res.json();
        // Update local state
        setDiscussions(prev => prev.map(d => {
          if (d.id === discussionId) {
            return {
              ...d,
              likedByMe: liked,
              likeCount: liked ? (d.likeCount || 0) + 1 : Math.max(0, (d.likeCount || 0) - 1)
            };
          }
          return d;
        }));
        if (selectedDiscussion && selectedDiscussion.id === discussionId) {
          setSelectedDiscussion((prev: any) => ({
            ...prev,
            likedByMe: liked,
            likeCount: liked ? (prev.likeCount || 0) + 1 : Math.max(0, (prev.likeCount || 0) - 1)
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikeReply = async (e: React.MouseEvent, replyId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/discussions/replies/${replyId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { liked } = await res.json();
        // Update local state
        setReplies(prev => prev.map(r => {
          if (r.id === replyId) {
            return {
              ...r,
              likedByMe: liked,
              likeCount: liked ? (r.likeCount || 0) + 1 : Math.max(0, (r.likeCount || 0) - 1)
            };
          }
          return r;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  
  const loadReplies = async (discussionId: number) => {
    setIsLoadingReplies(true);
    try {
      const res = await fetch(`/api/academic/course/${courseId}/discussions/${discussionId}/replies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReplies(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  
  const filteredMentions = directoryUsers.filter(u => u.name.toLowerCase().includes(mentionState.query.toLowerCase()));

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>, target: 'discussion' | 'reply') => {
    const val = e.target.value;
    if (target === 'discussion') setNewContent(val);
    else setReplyContent(val);

    const cursor = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursor);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionState({ active: true, query: mentionMatch[1], cursor, target });
    } else {
      setMentionState({ active: false, query: '', cursor: 0, target: 'discussion' });
    }
  };

  const insertMention = (name: string) => {
    if (mentionState.target === 'discussion') {
      const textBefore = newContent.slice(0, mentionState.cursor).replace(/@\w*$/, `@${name} `);
      const textAfter = newContent.slice(mentionState.cursor);
      setNewContent(textBefore + textAfter);
    } else {
      const textBefore = replyContent.slice(0, mentionState.cursor).replace(/@\w*$/, `@${name} `);
      const textAfter = replyContent.slice(mentionState.cursor);
      setReplyContent(textBefore + textAfter);
    }
    setMentionState({ active: false, query: '', cursor: 0, target: 'discussion' });
  };

  const openThread = (disc: any) => {
    setSelectedDiscussion(disc);
    setViewState('thread');
    loadReplies(disc.id);
  };

  if (viewState === 'create') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setViewState('list')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">New Discussion</h3>
        </div>
        
        <form onSubmit={handleCreateDiscussion} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Topic Title</label>
            <input 
              type="text" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              placeholder="E.g., Question about Week 3 Assignment"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Content</label>
            <div className="relative w-full"><textarea 
              value={newContent}
              onChange={e => handleContentChange(e as any, 'discussion')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white min-h-[150px]"
              placeholder="What would you like to discuss?"
              required
            ></textarea>
            {mentionState.active && mentionState.target === 'discussion' && filteredMentions.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 p-2 border-b border-slate-100 dark:border-slate-700 uppercase">Tag User</div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredMentions.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => insertMention(u.name)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                    >
                      {u.profilePicture ? (
                        <img src={u.profilePicture} className="w-6 h-6 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</div>
                        <div className="text-xs text-slate-500 truncate">{u.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
</div>

          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Add Poll (Optional)</label>
            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={e => {
                      const newOptions = [...pollOptions];
                      newOptions[i] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions(pollOptions.filter((_, index) => index !== i))}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 5 && (
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ''])}
                className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                + Add Option
              </button>
            )}
          </div>
          
          <div className="flex justify-end pt-2">

            <button 
              type="submit" 
              disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post Discussion
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (viewState === 'thread' && selectedDiscussion) {
    return (
      <div className="space-y-4 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setViewState('list')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 line-clamp-1 flex items-center gap-2">
            {selectedDiscussion.isPinned && <Pin className="w-5 h-5 text-emerald-500 fill-emerald-500 shrink-0" />}
            {selectedDiscussion.title}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {selectedDiscussion.authorPicture ? (
              <img src={selectedDiscussion.authorPicture} alt={selectedDiscussion.authorName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                {selectedDiscussion.authorName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{selectedDiscussion.authorName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(selectedDiscussion.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">{selectedDiscussion.content}</p>
          
          {selectedDiscussion.poll && (
            <div className="my-6 bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Pin className="w-4 h-4 text-emerald-500" /> Poll
              </h4>
              <div className="space-y-3">
                {selectedDiscussion.poll.options.map((opt: any) => {
                  const percentage = selectedDiscussion.poll.totalVotes > 0 
                    ? Math.round((opt.voteCount / selectedDiscussion.poll.totalVotes) * 100) 
                    : 0;
                  const isMyVote = selectedDiscussion.poll.myVoteId === opt.id;
                  
                  return (
                    <div key={opt.id} className="relative">
                      <button
                        onClick={() => isMyVote ? handleUnvote(selectedDiscussion.id) : handleVote(selectedDiscussion.id, opt.id)}
                        className={`w-full text-left relative z-10 p-3 rounded-lg border transition-colors flex justify-between items-center ${isMyVote ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-800'}`}
                      >
                        <span className={`font-medium ${isMyVote ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {opt.text}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                          {percentage}% ({opt.voteCount})
                        </span>
                      </button>
                      <div 
                        className="absolute top-0 left-0 h-full bg-emerald-100 dark:bg-emerald-900/40 rounded-lg pointer-events-none transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="text-right text-xs text-slate-500 mt-3">
                Total votes: {selectedDiscussion.poll.totalVotes}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">

            <button 
              onClick={(e) => handleLikeDiscussion(e, selectedDiscussion.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDiscussion.likedByMe ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}
            >
              <ThumbsUp className={`w-4 h-4 ${selectedDiscussion.likedByMe ? 'fill-current' : ''}`} /> {selectedDiscussion.likeCount || 0} Helpful
            </button>
          </div>
        </div>

        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 px-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> {replies.length} Replies
        </h4>

        <div className="space-y-4 mb-6">
          {isLoadingReplies ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              No replies yet. Be the first to reply!
            </div>
          ) : (
            replies.map(reply => (
              <div key={reply.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 ml-4 md:ml-8">
                <div className="flex items-center gap-3 mb-3">
                  {reply.authorPicture ? (
                    <img src={reply.authorPicture} alt={reply.authorName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                      {reply.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{reply.authorName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(reply.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap mb-3">{reply.content}</p>
                {reply.attachmentUrl && (
                  <a href={reply.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                    {reply.attachmentName || 'View Attachment'}
                  </a>
                )}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <button 
                    onClick={(e) => handleLikeReply(e, reply.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${reply.likedByMe ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${reply.likedByMe ? 'fill-current' : ''}`} /> {reply.likeCount || 0} Helpful
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

                <form onSubmit={handleReply} className="mt-auto bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky bottom-4">
          <div className="flex gap-4">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="You" className="w-10 h-10 rounded-full object-cover hidden sm:block" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold hidden sm:flex shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 flex gap-2 items-center">
              <label className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Attach file">
                <Paperclip className="w-5 h-5" />
                <input type="file" className="hidden" onChange={e => setReplyAttachment(e.target.files?.[0] || null)} />
              </label>
              <div className="flex-1 flex flex-col gap-1">
                {replyAttachment && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {replyAttachment.name}
                  </div>
                )}
                <div className="relative flex-1 w-full flex">
                  <input 
                    type="text" 
                    value={replyContent}
                    onChange={e => handleContentChange(e as any, 'reply')}
                    placeholder="Write a reply..."
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                  {mentionState.active && mentionState.target === 'reply' && filteredMentions.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 p-2 border-b border-slate-100 dark:border-slate-700 uppercase">Tag User</div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredMentions.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => insertMention(u.name)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                          >
                            {u.profilePicture ? (
                              <img src={u.profilePicture} className="w-6 h-6 rounded-full object-cover" alt="" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                {u.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</div>
                              <div className="text-xs text-slate-500 truncate">{u.role}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || isUploadingReply || !replyContent.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                {(isSubmitting || isUploadingReply) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" /> Course Discussions
        </h3>
        <button 
          onClick={() => setViewState('create')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Thread
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No discussions yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Start a conversation with your class by creating the first thread.</p>
            <button 
              onClick={() => setViewState('create')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-colors shadow-sm"
            >
              Start Discussion
            </button>
          </div>
        ) : (
          discussions.map(disc => (
            <div 
              key={disc.id} 
              onClick={() => openThread(disc)}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer group flex gap-4"
            >
              {disc.authorPicture ? (
                <img src={disc.authorPicture} alt={disc.authorName} className="w-12 h-12 rounded-full object-cover hidden sm:block shadow-sm" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg hidden sm:flex shrink-0 shadow-sm border border-emerald-200 dark:border-emerald-800">
                  {disc.authorName.charAt(0)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {disc.isPinned && <Pin className="inline w-4 h-4 mr-2 text-emerald-500 fill-emerald-500" />}
                    {disc.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {canPin && (
                      <button 
                        onClick={(e) => handlePinDiscussion(e, disc.id, disc.isPinned)}
                        className={`p-1.5 rounded-lg transition-colors ${disc.isPinned ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title={disc.isPinned ? "Unpin discussion" : "Pin discussion"}
                      >
                        <Pin className={`w-4 h-4 ${disc.isPinned ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    {disc.poll && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md flex items-center gap-1">
                        <BarChart2 className="w-3 h-3" /> Poll
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md">{new Date(disc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">{disc.content}</p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{disc.authorName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleLikeDiscussion(e, disc.id)}
                      className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-full transition-colors ${disc.likedByMe ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${disc.likedByMe ? 'fill-current' : ''}`} /> {disc.likeCount || 0}
                    </button>
                    <span className="flex items-center gap-1.5 font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      <MessageSquare className="w-4 h-4" /> {disc.replyCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
