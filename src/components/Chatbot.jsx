import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Trash2, Clock, X, Menu, Loader2 } from 'lucide-react';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-400">Loading your conversations...</p>
    </div>
  </div>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        const botResponse = `This is a simulated response to: "${input}"`;
        setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      } finally {
        setIsLoading(false);
      }
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
  };

  const startNewChat = () => {
    // Save current chat if it has messages beyond welcome message
    if (messages.length > 1) {
      const chatSession = {
        id: currentChatId,
        timestamp: new Date().toISOString(),
        messages: messages,
        title: messages[0].text.slice(0, 30) + '...'
      };

      const updatedHistory = [
        chatSession,
        ...chatHistory.filter(chat => chat.id !== currentChatId)
      ].slice(0, 10);

      setChatHistory(updatedHistory);
      localStorage.setItem('chatSessions', JSON.stringify(updatedHistory));
    }

    // Start new chat
    setMessages([{
      text: "👋 Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot'
    }]);
    setCurrentChatId(Date.now());
  };

  const clearChat = () => {
    if (messages.length <= 1) return; // Don't clear if only welcome message
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setMessages([{
      text: "👋 Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot'
    }]);
    setShowDeleteModal(false);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: "👋 Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot'
      }]);
    }
    // Simulate initial loading
    setTimeout(() => setIsInitialLoading(false), 1500);
  }, []);

  // Rest of the useEffect hooks remain the same...

  return (
    <>
      {isInitialLoading && <LoadingScreen />}
      <div className="fixed inset-0 bg-[#0a0a0a] text-gray-100 overflow-hidden flex">
        {/* Fixed Sidebar */}
        <div className="w-80 bg-[#141414] border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex flex-col gap-4 bg-[#1a1a1a]">
            <div className="flex items-center space-x-2">
              <Clock className="text-gray-400" size={20} />
              <h2 className="font-semibold text-gray-200">Chat History</h2>
            </div>
            <button
              onClick={startNewChat}
              className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle size={18} />
              <span>New Chat</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => loadChat(chat)}
                className="w-full p-4 text-left hover:bg-[#1a1a1a] border-b border-gray-800 transition-colors group"
              >
                <div className="text-sm font-medium text-gray-300 mb-1 group-hover:text-white">
                  {formatDate(chat.timestamp)}
                </div>
                <div className="text-xs text-gray-400 line-clamp-2 group-hover:text-gray-300">
                  {chat.title}
                </div>
              </button>
            ))}
            {chatHistory.length === 0 && (
              <div className="p-6 text-gray-400 text-sm text-center">
                No chat history yet
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-[#141414] border-b border-gray-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="text-blue-500" size={24} />
              <h1 className="text-lg font-semibold text-gray-100">AI Chat Assistant</h1>
            </div>
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
              title="Clear current chat"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-lg px-4 py-2.5 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1a1a1a] text-gray-100 border border-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-lg px-4 py-2.5 bg-[#1a1a1a] text-gray-100 border border-gray-800">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-[#141414] border-t border-gray-800 p-4">
            <div className="max-w-4xl mx-auto relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] text-gray-100 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800 placeholder-gray-500 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:hover:text-gray-400"
                title="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1a1a1a] rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-gray-100 mb-2">Clear Chat</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to clear the current chat? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Chatbot;