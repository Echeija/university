import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Search, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface UserData {
  id: number;
  name: string;
  role: string;
  profilePicture: string | null;
}

interface Message {
  message: {
    id: number;
    senderId: number;
    receiverId: number;
    subject: string;
    content: string;
    isRead: string;
    createdAt: string;
  };
  sender: UserData;
  receiver: UserData;
}

export default function MessagesPortal() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [directory, setDirectory] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchDirectory();

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('Real-time message update:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.reverse()); // Reverse to chronological order
      }
    } catch (e) {
      if (e.message !== "Failed to fetch") console.error('Failed to fetch messages', e);
    }
  };

  const fetchDirectory = async () => {
    try {
      const res = await fetch('/api/users/directory', {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDirectory(data);
      }
    } catch (e) {
      if (e.message !== "Failed to fetch") console.error('Failed to fetch directory', e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverId: selectedUserId,
          subject: 'Direct Message',
          content: newMessage
        })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(); // Optimistic update could be added here
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  // Group messages by user
  const groupedUsers = new Map<number, { user: UserData, latestMessage: Message }>();
  
  messages.forEach(m => {
    const otherUser = m.message.senderId === user?.id ? m.receiver : m.sender;
    if (!otherUser) return;
    
    // Since messages are chronological, the latest will overwrite earlier ones
    groupedUsers.set(otherUser.id, { user: otherUser, latestMessage: m });
  });

  const conversationUsers = Array.from(groupedUsers.values()).sort((a, b) => 
    new Date(b.latestMessage.message.createdAt).getTime() - new Date(a.latestMessage.message.createdAt).getTime()
  );

  const currentConversation = messages.filter(
    m => (m.message.senderId === user?.id && m.message.receiverId === selectedUserId) || 
         (m.message.receiverId === user?.id && m.message.senderId === selectedUserId)
  );

  const filteredDirectory = directory.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = directory.find(u => u.id === selectedUserId);

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-600" />
          Direct Messages
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Secure real-time messaging with lecturers and peers.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row h-full">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-700 flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search directory..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {searchTerm ? (
              <div className="p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Directory Results</div>
                {filteredDirectory.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { setSelectedUserId(u.id); setSearchTerm(''); }}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${selectedUserId === u.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      {u.profilePicture ? (
                        <img src={u.profilePicture} alt={u.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{u.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Conversations</div>
                {conversationUsers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No recent conversations. Search the directory to start a chat.</div>
                ) : (
                  conversationUsers.map(({ user: u, latestMessage }) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${selectedUserId === u.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt={u.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 dark:text-white text-sm truncate pr-2">{u.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(latestMessage.message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {latestMessage.message.senderId === user?.id ? 'You: ' : ''}{latestMessage.message.content}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedUserId ? (
          <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                {selectedUser?.profilePicture ? (
                  <img src={selectedUser.profilePicture} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedUser?.name || 'Loading...'}</div>
                <div className="text-xs text-slate-500">{selectedUser?.role}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-400" />
                  </div>
                  <p>Send a message to start the conversation.</p>
                </div>
              ) : (
                currentConversation.map(m => {
                  const isMe = m.message.senderId === user?.id;
                  return (
                    <div key={m.message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-none shadow-sm'}`}>
                        <div className="whitespace-pre-wrap text-sm">{m.message.content}</div>
                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(m.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <p>Select a conversation or search the directory to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
