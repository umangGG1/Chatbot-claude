import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Trash2, Clock, X, Menu } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(Date.now());
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatSessions');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Auto-save current chat whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const chatSession = {
        id: currentChatId,
        timestamp: new Date().toISOString(),
        messages: messages,
        title: messages[0].text.slice(0, 30) + '...'
      };

      const updatedHistory = [
        chatSession,
        ...chatHistory.filter(chat => chat.id !== currentChatId)
      ].slice(0, 10); // Keep last 10 chats

      setChatHistory(updatedHistory);
      localStorage.setItem('chatSessions', JSON.stringify(updatedHistory));
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle body scroll lock
  useEffect(() => {
    if (showHistory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showHistory]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages(prev => [...prev, { text: input, sender: 'user' }]);
      
      setTimeout(() => {
        const botResponse = `This is a simulated response to: "${input}"`;
        setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      }, 1000);
      
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setShowHistory(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(Date.now());
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative flex h-screen bg-[#1a1a1a] overflow-hidden">
      {/* History Panel Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          showHistory ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowHistory(false)}
      />
      
      {/* History Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-[#1f1f1f] z-50 transform transition-transform duration-300 ease-in-out ${
          showHistory ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="text-gray-400" size={20} />
              <h2 className="font-semibold text-gray-200">Chat History</h2>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-gray-200 p-1"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => loadChat(chat)}
                className="w-full p-4 text-left hover:bg-[#2a2a2a] border-b border-[#2a2a2a] transition-colors"
              >
                <div className="text-sm font-medium text-gray-300 mb-1">
                  {formatDate(chat.timestamp)}
                </div>
                <div className="text-xs text-gray-400 line-clamp-2">
                  {chat.title}
                </div>
              </button>
            ))}
            {chatHistory.length === 0 && (
              <div className="p-4 text-gray-400 text-sm">
                No chat history yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-[#1f1f1f] border-b border-[#2a2a2a] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHistory(true)}
              className="text-gray-400 hover:text-gray-200"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <MessageCircle className="text-gray-400" size={24} />
              <h1 className="text-lg font-semibold text-gray-200">AI Chat Assistant</h1>
            </div>
          </div>
          <button
            onClick={startNewChat}
            className="p-2 text-gray-400 hover:text-gray-200 rounded-lg transition-colors"
            title="New chat"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#2a2a2a] text-gray-200'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#1f1f1f] border-t border-[#2a2a2a] p-4">
          <div className="flex space-x-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-[#2a2a2a] text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-500 transition-colors flex items-center justify-center"
            >
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;