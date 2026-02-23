import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Home, Menu, X, Smile, Clock, Sparkles } from 'lucide-react';
import { Character, Message, ChatSession } from '../types';
import { sendMessageToBackend } from '../services/chatService';

// ✅ NEW IMPORTS
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

      <div className="flex-1 flex flex-col h-full w-full relative">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth z-0">
            
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                
                <div 
                  className={`
                    px-6 py-4 text-base shadow-sm relative
                    ${msg.sender === 'user' 
                    ? `${theme.bubbleUser} text-white rounded-t-[2rem] rounded-bl-[2rem] rounded-br-none` 
                    : 'bg-white text-gray-800 rounded-t-[2rem] rounded-br-[2rem] rounded-bl-none border-2 border-gray-100'}
                    ${msg.isError ? 'bg-red-100 border-red-300 text-red-600' : ''}
                  `}
                >

                  {/* ✅ MARKDOWN RENDERING FIX */}
                  {msg.sender === "bot" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-5 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-5 space-y-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}

                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 z-20">
          <div className="max-w-4xl mx-auto relative flex items-center gap-3 bg-white p-3 rounded-[3rem] shadow border-4 border-white ring-4 ring-gray-100">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Type here to talk to ${character.name}...`}
              className="w-full bg-transparent text-gray-700 placeholder-gray-400 px-6 py-2 text-lg font-medium focus:outline-none"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`p-5 rounded-full text-white ${!inputValue.trim() ? 'bg-gray-200' : theme.primary}`}
            >
              <Send size={24} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
