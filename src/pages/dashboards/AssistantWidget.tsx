import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function AssistantWidget() {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: `Hello ${user?.name || 'student'}! I'm your AI Student Assistant. How can I help you today with university policies, campus maps, or administrative procedures?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => { setIsOpen(true); setIsMinimized(false); };
    window.addEventListener('open-chatbot', handler);
    return () => window.removeEventListener('open-chatbot', handler);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Map existing messages to history format
      const history = messages.slice(1).map(msg => ({ role: msg.role, text: msg.text }));

      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage.text, history })
      });

      if (res.ok) {
        const data = await res.json();
        const modelMessage: Message = { id: Date.now().toString(), role: 'model', text: data.text };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        const modelMessage: Message = { id: Date.now().toString(), role: 'model', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (e) {
      console.error(e);
      const modelMessage: Message = { id: Date.now().toString(), role: 'model', text: "I'm sorry, an error occurred. Please try again." };
      setMessages(prev => [...prev, modelMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 print:hidden hover:bg-emerald-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 z-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        aria-label="Open AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed right-6 bottom-6 print:hidden flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden z-50 transition-all duration-300 ease-in-out ${isMinimized ? 'w-[calc(100vw-3rem)] sm:w-80 h-14' : 'w-[calc(100vw-3rem)] sm:w-80 md:w-96 h-[500px] max-h-[80vh]'}`}>
      {/* Header */}
      <div 
        className="bg-emerald-900 dark:bg-emerald-950 p-3 flex justify-between items-center cursor-pointer select-none border-b border-emerald-800"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">SGCT Assistant</h3>
            <p className="text-emerald-300 text-[10px]">AI-Powered Support</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-300">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1.5 hover:bg-emerald-800 rounded-md transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
            className="p-1.5 hover:bg-emerald-800 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-50 max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about policies, campus maps..."
                className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
