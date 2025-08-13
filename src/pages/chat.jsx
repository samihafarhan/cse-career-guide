import React, { useState, useRef, useEffect } from 'react';
import { useAuthCheck } from '@/context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const { isAuthenticated, loading } = useAuthCheck();

  const suggestions = [
    "What can I ask you to do?",
    "What are the current trends for a career in CSE?",
    "What projects or papers should I be concerned about right now?"
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

  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  // Don't render if user is not authenticated or still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null
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
            <h1 className="text-4xl font-bold text-[#160211] text-center mb-12">
              Your humble assistant
            </h1>
            <h1 className="text-2xl font-bold text-[#160211] text-center mb-12">
              Powered by Gemini
            </h1>
            
            {/* Suggestions section */}
            <div className="w-full max-w-4xl mb-16">
              <p className="text-lg font-semibold text-[#56637e] mb-6 text-center">
                Ask Away
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-white/70 backdrop-blur-sm border border-white/80 text-[#160211] hover:bg-white/90 hover:shadow-lg transition-all max-w-[300px] h-auto py-3 px-6 text-left whitespace-normal"
                  >
                    {suggestion}
                  </Button>
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
                <h2 className="text-2xl font-semibold text-[#160211]">
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
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
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
                      <span className="text-xs text-[#56637e]">AI is thinking...</span>
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
            <div className="bg-white/90 backdrop-blur-sm border border-[rgba(22,2,17,0.2)] rounded-lg p-4 flex items-end gap-3 shadow-lg">
              <Textarea
                value={inputMessage}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-[#160211] placeholder-[#56637e] resize-none min-h-[60px] max-h-[150px] border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
                rows={1}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                variant="ghost"
                size="icon"
                className="flex-shrink-0 hover:bg-gray-100/50 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                aria-label="Send message"
              >
                <img src={sendIcon} alt="Send" className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
