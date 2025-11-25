import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Home, Menu, X, Smile, Clock, Sparkles } from 'lucide-react';
import { Character, Message, ChatSession } from '../types';
import { sendMessageToBackend } from '../services/chatService';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

interface ChatInterfaceProps {
  character: Character;
  onBack: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  initialMessages: Message[];
  onUpdateSession: (sessionId: string, messages: Message[]) => void;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  character, 
  onBack, 
  sessions,
  currentSessionId,
  initialMessages,
  onUpdateSession,
  onNewSession,
  onSelectSession
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTom = character.id === 'tom';
  
  // Theme Configuration
  const theme = {
    primary: isTom ? 'bg-blue-500' : 'bg-orange-500',
    primaryHover: isTom ? 'hover:bg-blue-600' : 'hover:bg-orange-600',
    light: isTom ? 'bg-blue-100' : 'bg-orange-100',
    lighter: isTom ? 'bg-blue-50' : 'bg-orange-50',
    border: isTom ? 'border-blue-200' : 'border-orange-200',
    text: isTom ? 'text-blue-600' : 'text-orange-600',
    pattern: isTom ? 'bg-pattern-grid' : 'bg-pattern-polka',
    bubbleUser: isTom ? 'bg-blue-500' : 'bg-orange-500',
    bubbleBot: 'bg-white',
    shadow: isTom ? 'shadow-blue-200' : 'shadow-orange-200',
  };

  useEffect(() => {
    setMessages(initialMessages);
    setIsSidebarOpen(false); 
  }, [currentSessionId, initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: generateId(),
      text: inputValue,
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    onUpdateSession(currentSessionId, updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToBackend(character.apiEndpoint, userMsg.text);
      
      const botMsg: Message = {
        id: generateId(),
        text: responseText,
        sender: 'bot',
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      onUpdateSession(currentSessionId, finalMessages);

    } catch (error) {
      const errorMsg: Message = {
        id: generateId(),
        text: "Oops! I couldn't reach my brain. Can you check if I'm awake? (Server Error)",
        sender: 'bot',
        timestamp: Date.now(),
        isError: true,
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      onUpdateSession(currentSessionId, finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans relative ${theme.pattern}`}>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Fun Sidebar */}
      <div 
        className={`
          fixed md:relative inset-y-0 left-0 z-40 w-80 bg-white/90 backdrop-blur border-r-4 ${theme.border}
          transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col shadow-2xl md:shadow-none
        `}
      >
        <div className={`p-6 ${theme.primary} text-white flex justify-between items-center shadow-lg`}>
            <span className="font-bold text-3xl flex items-center gap-2 drop-shadow-md transform -rotate-2">
                <Smile size={32} className="animate-spin-slow" />
                Stories
            </span>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden hover:bg-white/20 p-2 rounded-full">
                <X size={24} />
            </button>
        </div>
        
        {/* Wavy decoration for sidebar header */}
        <div className={`${theme.primary} h-4 w-full relative`}>
             <svg className="absolute top-0 w-full h-4 text-white fill-current" preserveAspectRatio="none" viewBox="0 0 1440 320"><path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
        </div>

        <div className="p-4 mt-2">
          <button 
            onClick={onNewSession}
            className={`
              w-full flex items-center justify-center gap-3 py-4 px-6 rounded-3xl 
              text-white font-bold text-xl shadow-[0_6px_0_0_rgba(0,0,0,0.1)] transition-all 
              hover:-translate-y-1 hover:shadow-[0_8px_0_0_rgba(0,0,0,0.1)]
              active:translate-y-1 active:shadow-none
              ${theme.primary}
            `}
          >
            <Plus size={28} strokeWidth={3} />
            <span>Start New!</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {sessions.map((session) => (
                <div 
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`
                        cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200
                        hover:scale-[1.02] relative group
                        ${session.id === currentSessionId 
                            ? `bg-white ${theme.border} shadow-[0_4px_0_0_rgba(0,0,0,0.05)]` 
                            : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'}
                    `}
                >
                    <h4 className="font-bold text-gray-700 mb-1 flex items-center gap-2 group-hover:text-gray-900">
                        {session.messages.length > 0 ? "Adventure #" + session.id.substring(0,4) : "New Story"}
                        {session.id === currentSessionId && <Sparkles size={16} className={`animate-pulse ${theme.text}`} />}
                    </h4>
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                        <Clock size={12} /> {new Date(session.lastUpdated).toLocaleDateString()}
                    </span>
                </div>
            ))}
        </div>
        
        <div className="p-4 border-t-2 border-dashed border-gray-200">
             <button onClick={onBack} className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 font-bold w-full p-3 rounded-2xl hover:bg-gray-100 transition-colors">
                <Home size={24} />
                <span>Back to Clouds</span>
            </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        
        {/* Playful Header */}
        <div className="relative z-20">
            <div className={`px-6 py-3 bg-white shadow-sm flex justify-between items-center relative z-10`}>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)} 
                        className="md:hidden text-gray-600 p-2 rounded-xl hover:bg-gray-100"
                    >
                        <Menu size={28} />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className={`absolute inset-0 rounded-full ${theme.primary} blur-md opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                            <img 
                            src={character.imageUrl} 
                            alt={character.name} 
                            className="relative w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200 transform group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-4 border-white rounded-full animate-bounce"></div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{character.name}</h2>
                            <p className={`text-sm font-bold ${theme.text} uppercase tracking-wider`}>Your Buddy</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Wavy Separator */}
            <div className="absolute top-full left-0 w-full overflow-hidden leading-none z-0 transform rotate-180">
                <svg className="relative block w-[calc(100%+1.3px)] h-[30px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
                </svg>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth z-0">
            {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-pop-in">
                <div className={`w-40 h-40 rounded-full ${theme.lighter} border-4 ${theme.border} border-dashed flex items-center justify-center mb-6 animate-wobble-slow`}>
                    <Smile className={`w-20 h-20 ${theme.text}`} />
                </div>
                <p className="text-2xl font-bold text-gray-400 text-center px-4 max-w-md leading-relaxed">
                  Start an adventure! Say "Hello" to wake up {character.name}!
                </p>
            </div>
            )}
            
            {messages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`}
            >
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                     <div 
                        className={`
                            px-6 py-4 text-xl font-medium shadow-sm relative
                            ${msg.sender === 'user' 
                            ? `${theme.bubbleUser} text-white rounded-t-[2rem] rounded-bl-[2rem] rounded-br-none` 
                            : 'bg-white text-gray-800 rounded-t-[2rem] rounded-br-[2rem] rounded-bl-none border-2 border-gray-100'}
                            ${msg.isError ? 'bg-red-100 border-red-300 text-red-600' : ''}
                        `}
                    >
                        {msg.text}
                        
                        {/* Speech Bubble Tail */}
                         {msg.sender === 'user' ? (
                            <div className={`absolute -bottom-0 -right-2 w-6 h-6 ${theme.bubbleUser} [clip-path:polygon(0_0,100%_0,0_100%)]`}></div>
                        ) : (
                            <div className="absolute -bottom-0 -left-2 w-6 h-6 bg-white border-b-2 border-l-2 border-gray-100 [clip-path:polygon(100%_0,0_0,100%_100%)]"></div>
                        )}
                    </div>
                </div>
            </div>
            ))}
            
            {isLoading && (
            <div className="flex justify-start w-full animate-pop-in">
                <div className="bg-white border-2 border-gray-100 p-6 rounded-[2rem] rounded-bl-none shadow-sm flex items-center space-x-2">
                <div className={`w-4 h-4 ${theme.primary} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                <div className={`w-4 h-4 ${theme.primary} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                <div className={`w-4 h-4 ${theme.primary} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 z-20">
            <div className="max-w-4xl mx-auto relative flex items-center gap-3 bg-white p-3 rounded-[3rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-4 border-white ring-4 ring-gray-100">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Type here to talk to ${character.name}...`}
                className="w-full bg-transparent text-gray-700 placeholder-gray-400 px-6 py-2 text-xl font-bold focus:outline-none"
                disabled={isLoading}
            />
            <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={`
                p-5 rounded-full text-white transition-all transform hover:scale-110 active:scale-95 shadow-md
                ${!inputValue.trim() ? 'bg-gray-200' : theme.primary}
                `}
            >
                <Send size={28} strokeWidth={3} className={inputValue.trim() ? "animate-wiggle" : ""} />
            </button>
            </div>
        </div>

      </div>
    </div>
  );
};