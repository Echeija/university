import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Search, MessageSquare, Clock, Paperclip, CheckCheck, 
  FileText, Sparkles, BookOpen, Circle, Filter, X, Download, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface ContactUser {
  id: number;
  name: string;
  role: string;
  department?: string;
  profilePicture: string | null;
  isDirectCourseContact?: boolean;
  courses?: { courseId: number; courseCode: string; courseTitle: string }[];
}

interface CourseOption {
  id: number;
  code: string;
  title: string;
}

interface Message {
  message: {
    id: number;
    senderId: number;
    receiverId: number;
    courseId?: number | null;
    subject: string;
    content: string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    isRead: string;
    createdAt: string;
  };
  course?: CourseOption | null;
  sender: ContactUser;
  receiver: ContactUser;
}

const INQUIRY_TEMPLATES = [
  { label: '📝 Assignment Query', subject: 'Assignment Clarification', text: 'Hello, I would like to ask a question regarding the current assignment instructions for ' },
  { label: '📚 Syllabus & Lecture Material', subject: 'Lecture Material Clarification', text: 'Dear Lecturer, could you please clarify a concept from the recent lecture slides on ' },
  { label: '🔬 Lab Session Query', subject: 'Lab Schedule & Requirements', text: 'Good day, regarding the upcoming laboratory practical session for ' },
  { label: '📊 Grade & CA Inquiry', subject: 'Continuous Assessment Query', text: 'Hello, I would like to inquire about my continuous assessment scores for ' },
  { label: '📅 Office Hours Request', subject: 'Office Hours Appointment', text: 'Dear Lecturer, I would like to request a short appointment during your office hours regarding ' }
];

export default function MessagesPortal() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [myCourses, setMyCourses] = useState<CourseOption[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'courses' | 'all'>('courses');
  
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSockets and initial state
  useEffect(() => {
    fetchMessages();
    fetchContactsAndCourses();

    if (user?.id) {
      connectWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId]);

  // Mark messages as read when selecting a user
  useEffect(() => {
    if (selectedUserId && user?.id) {
      markAsRead(selectedUserId);
    }
  }, [selectedUserId]);

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        ws.send(JSON.stringify({ type: 'auth', userId: user?.id }));
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'authenticated') {
            if (payload.onlineUserIds) {
              setOnlineUserIds(payload.onlineUserIds);
            }
          } else if (payload.type === 'presence') {
            const { userId: pUserId, online } = payload;
            setOnlineUserIds((prev) => 
              online ? Array.from(new Set([...prev, pUserId])) : prev.filter(id => id !== pUserId)
            );
          } else if (payload.type === 'new_message') {
            const newMsg: Message = payload.data;
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some(m => m.message.id === newMsg.message.id)) return prev;
              return [newMsg, ...prev];
            });

            // Mark read immediately if in current chat
            if (newMsg.message.senderId === selectedUserId) {
              markAsRead(newMsg.message.senderId);
            }
          } else if (payload.type === 'typing') {
            if (payload.senderId === selectedUserId) {
              setIsTyping(payload.isTyping);
            }
          } else if (payload.type === 'messages_read') {
            setMessages((prev) =>
              prev.map(m => (m.message.senderId === user?.id && m.message.receiverId === payload.byUserId)
                ? { ...m, message: { ...m.message, isRead: 'true' } }
                : m
              )
            );
          }
        } catch (err) {
          console.error('WebSocket message parsing error', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        // Retry connection after 3 seconds
        setTimeout(() => {
          if (user?.id) connectWebSocket();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    } catch (e) {
      console.error('Failed to initiate WebSocket connection', e);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  const fetchContactsAndCourses = async () => {
    try {
      const res = await fetch('/api/courses/my-contacts', {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setMyCourses(data.myCourses || []);
        if (data.onlineUserIds) {
          setOnlineUserIds(data.onlineUserIds);
        }
      }
    } catch (e) {
      console.error('Failed to fetch course contacts', e);
    }
  };

  const markAsRead = async (senderId: number) => {
    try {
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ senderId })
      });
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setAttachment({
          url: data.url,
          name: file.name
        });
      }
    } catch (e) {
      console.error('File upload failed', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setNewMessage(text);

    // Send typing notification over WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && selectedUserId) {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        receiverId: selectedUserId,
        courseId: selectedCourseId !== 'all' ? selectedCourseId : null,
        isTyping: text.length > 0
      }));

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'typing',
            receiverId: selectedUserId,
            isTyping: false
          }));
        }
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedUserId) return;

    const courseIdNum = selectedCourseId !== 'all' ? Number(selectedCourseId) : null;
    const finalSubject = subject.trim() || (courseIdNum ? `Course Inquiry (${myCourses.find(c => c.id === courseIdNum)?.code})` : 'Direct Message');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverId: selectedUserId,
          courseId: courseIdNum,
          subject: finalSubject,
          content: newMessage.trim(),
          attachmentUrl: attachment?.url,
          attachmentName: attachment?.name
        })
      });

      if (res.ok) {
        const fullMsg = await res.json();
        setMessages((prev) => [fullMsg, ...prev]);
        setNewMessage('');
        setAttachment(null);
        setSubject('');
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const applyTemplate = (template: typeof INQUIRY_TEMPLATES[0]) => {
    setSubject(template.subject);
    const selectedCourse = myCourses.find(c => c.id === Number(selectedCourseId));
    const courseText = selectedCourse ? `${selectedCourse.code}: ${selectedCourse.title}. ` : '';
    setNewMessage(`${template.text}${courseText}`);
  };

  // Group contacts / messages
  const directCourseContacts = contacts.filter(c => c.isDirectCourseContact);
  const generalContacts = contacts.filter(c => !c.isDirectCourseContact);

  const displayContactsList = activeTab === 'courses' ? (directCourseContacts.length > 0 ? directCourseContacts : contacts) : contacts;

  const filteredContacts = displayContactsList.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedUser = contacts.find(c => c.id === selectedUserId);

  // Filter messages for active conversation
  const activeConversationMessages = messages
    .filter(m => 
      (m.message.senderId === user?.id && m.message.receiverId === selectedUserId) || 
      (m.message.receiverId === user?.id && m.message.senderId === selectedUserId)
    )
    .filter(m => selectedCourseId === 'all' || m.message.courseId === Number(selectedCourseId))
    .sort((a, b) => new Date(a.message.createdAt).getTime() - new Date(b.message.createdAt).getTime());

  // Count unread per contact
  const getUnreadCount = (contactId: number) => {
    return messages.filter(m => m.message.senderId === contactId && m.message.receiverId === user?.id && m.message.isRead === 'false').length;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto h-[calc(100vh-90px)] flex flex-col">
      {/* Header Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            Course Inquiry & Real-Time Messaging
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Direct real-time communication between students and lecturers regarding course modules, assignments, and academic queries.
          </p>
        </div>

        {/* Real-time Connection Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            wsConnected 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {wsConnected ? 'Real-Time Server Active' : 'Connecting Real-Time...'}
          </div>
        </div>
      </div>

      {/* Main Grid Interface */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row h-full">
        
        {/* Left Sidebar - Contacts & Course Filters */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full bg-slate-50/50 dark:bg-slate-800/50">
          
          {/* Navigation Tabs */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex gap-2">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'courses'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Course Contacts
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              All Directory
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search lecturer, student or course..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Course Filter Dropdown */}
            {myCourses.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Course Inquiries</option>
                  {myCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No contacts found matching your search criteria.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedUserId === contact.id;
                const isOnline = onlineUserIds.includes(contact.id);
                const unreadCount = getUnreadCount(contact.id);

                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedUserId(contact.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-white dark:hover:bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    {/* User Avatar with Online Dot */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                        {contact.profilePicture ? (
                          <img src={contact.profilePicture} alt={contact.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`} />
                    </div>

                    {/* Contact Details */}
                    <div className="overflow-hidden flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {contact.name}
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          contact.role === 'Lecturer' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
                          contact.role === 'Student' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {contact.role}
                        </span>
                        {contact.courses && contact.courses.length > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate">
                            • {contact.courses[0].courseCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Panel */}
        {selectedUserId && selectedUser ? (
          <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/40">
            
            {/* Active Contact Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    {selectedUser.profilePicture ? (
                      <img src={selectedUser.profilePicture} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                    onlineUserIds.includes(selectedUser.id) ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`} />
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    {selectedUser.name}
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{selectedUser.department || 'Department Staff'}</span>
                    <span>•</span>
                    <span className={onlineUserIds.includes(selectedUser.id) ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                      {onlineUserIds.includes(selectedUser.id) ? 'Online Now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Context Header Tag */}
              {selectedCourseId !== 'all' && (
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  {myCourses.find(c => c.id === Number(selectedCourseId))?.code}
                </div>
              )}
            </div>

            {/* Quick Inquiry Templates Bar (for Students) */}
            {user?.role === 'Student' && (
              <div className="p-2.5 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
                <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Inquiries:
                </span>
                {INQUIRY_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyTemplate(tmpl)}
                    className="shrink-0 px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600 transition-all font-medium text-[11px]"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversationMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">No messages yet in this conversation.</p>
                  <p className="text-xs text-slate-500 max-w-sm text-center">
                    Type your inquiry or question below to start a real-time discussion with {selectedUser.name}.
                  </p>
                </div>
              ) : (
                activeConversationMessages.map((m) => {
                  const isMe = m.message.senderId === user?.id;

                  return (
                    <div key={m.message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm ${
                        isMe 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-none'
                      }`}>
                        
                        {/* Course & Subject Badge */}
                        {(m.course || m.message.subject) && (
                          <div className={`mb-1.5 pb-1.5 border-b text-xs flex items-center justify-between gap-2 ${
                            isMe ? 'border-emerald-500 text-emerald-100' : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            <span className="font-bold truncate">
                              {m.message.subject || 'Course Inquiry'}
                            </span>
                            {m.course && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                isMe ? 'bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              }`}>
                                {m.course.code}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {m.message.content}
                        </div>

                        {/* Attachment Link */}
                        {m.message.attachmentUrl && (
                          <div className={`mt-2.5 p-2 rounded-xl flex items-center justify-between gap-2 text-xs border ${
                            isMe ? 'bg-emerald-700/60 border-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}>
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="truncate font-medium">{m.message.attachmentName || 'Attachment'}</span>
                            </div>
                            <a
                              href={m.message.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-1 rounded hover:bg-black/10 transition-colors ${isMe ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        )}

                        {/* Timestamp & Read Receipt */}
                        <div className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${
                          isMe ? 'text-emerald-100' : 'text-slate-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {new Date(m.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          
                          {isMe && (
                            <CheckCheck className={`w-3.5 h-3.5 ml-1 ${
                              m.message.isRead === 'true' ? 'text-sky-300' : 'text-emerald-300'
                            }`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-emerald-600">{selectedUser.name}</span> is typing
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-2">
              
              {/* Optional Subject Header Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Subject / Topic (e.g. Assignment 2 Query)..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />

                {/* Course Selector for this message */}
                {myCourses.length > 0 && (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">Tag Course (Optional)</option>
                    {myCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.code}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Attachment Preview Chip */}
              {attachment && (
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="truncate font-medium flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    {attachment.name}
                  </span>
                  <button onClick={() => setAttachment(null)} className="hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Text Input & Buttons */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                  title="Attach file or document"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={`Write your inquiry for ${selectedUser.name}...`}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !attachment) || isUploading}
                  className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Empty Chat Placeholder */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Select a Lecturer or Student
            </h3>
            <p className="text-xs text-slate-500 text-center max-w-sm">
              Choose a contact from your course directory on the left to start a real-time conversation or submit a course inquiry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
