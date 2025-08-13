import React, { useState, useRef, useEffect } from 'react';
import { UrlState } from '@/context';
import geminiService from '../services/geminiService';
import sparkleIcon from '../assets/sparkle-icon.svg';
import sendIcon from '../assets/send-icon.svg';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const { isAuthenticated } = UrlState();

  const suggestions = [
    "What can I ask you to do?",
    "Which one of my projects is performing the best?",
    "What projects should I be concerned about right now?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    // Hide suggestions after first message
    setShowSuggestions(false);

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Update chat history for context
      const newHistory = [
        ...chatHistory,
        {
          role: "user",
          parts: [{ text: messageText }]
        }
      ];

      const response = await geminiService.generateResponse(messageText, newHistory);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update chat history with AI response
      setChatHistory([
        ...newHistory,
        {
          role: "model",
          parts: [{ text: response }]
        }
      ]);

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the AI chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #FF86E1 0%, #89BCFF 50%, #FFFFFF 100%)'
    }}>
      {/* Background gradient overlay for depth */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center bottom, rgba(255, 134, 225, 0.4) 0%, rgba(137, 188, 255, 0.3) 30%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 255, 255, 0.9) 100%)'
      }}></div>
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header section */}
        {showSuggestions && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            {/* Sparkle icon */}
            <div className="mb-12">
              <img src={sparkleIcon} alt="AI Sparkle" className="w-9 h-9" />
            </div>
            
            {/* Main heading */}
            <h1 className="text-2xl font-normal text-[#160211] text-center mb-12 font-['Manrope']">
              Ask our AI anything
            </h1>
            
            {/* Suggestions section */}
            <div className="w-full max-w-4xl mb-16">
              <p className="text-sm font-bold text-[#56637e] mb-4 font-['Manrope'] ml-2">
                Suggestions on what to ask Our AI
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-white/50 backdrop-blur-sm border border-white text-[#160211] px-4 py-3 rounded-lg text-sm font-normal transition-all hover:bg-white/70 hover:shadow-md font-['DM_Sans'] max-w-[274px] text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages area - only show when there are messages */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Chat header when in conversation */}
              <div className="text-center mb-8">
                <img src={sparkleIcon} alt="AI Sparkle" className="w-6 h-6 mx-auto mb-4" />
                <h2 className="text-xl font-normal text-[#160211] font-['Manrope']">
                  AI Assistant
                </h2>
              </div>

              {/* Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : message.isError
                        ? 'bg-red-100 text-red-800 rounded-bl-md'
                        : 'bg-white/80 backdrop-blur-sm text-[#160211] border border-white/50 rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-['Manrope'] text-sm leading-relaxed">
                      {message.text}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-[#56637e]'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/80 backdrop-blur-sm text-[#160211] px-4 py-3 rounded-2xl border border-white/50 rounded-bl-md">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#56637e] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#56637e] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#56637e] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-[#56637e] font-['Manrope']">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input area - always at bottom */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-[rgba(22,2,17,0.3)] rounded-lg p-3 flex items-center justify-between">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your projects"
                className="flex-1 bg-transparent text-[#56637e] placeholder-[#56637e] text-sm font-['Manrope'] focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="ml-3 p-2 rounded-lg transition-all hover:bg-gray-100/50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <img src={sendIcon} alt="Send" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
