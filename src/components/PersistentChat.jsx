import React, { useState, useRef, useEffect } from 'react';
import { useAuthCheck } from '@/context';
import { useChatContext } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import geminiService from '../services/geminiService';
import sparkleIcon from '../assets/sparkle-icon.svg';
import sendIcon from '../assets/send-icon.svg';
import { RotateCcw } from 'lucide-react';

const PersistentChat = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { isAuthenticated, loading } = useAuthCheck();
  const { 
    messages, 
    chatHistory, 
    showSuggestions, 
    addMessage, 
    addChatHistory, 
    resetChat, 
    hideSuggestions 
  } = useChatContext();

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
    hideSuggestions();

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await geminiService.generateResponse(messageText, chatHistory);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };

      addMessage(aiMessage);
      
      // Update chat history for context
      addChatHistory({ role: 'user', parts: [{ text: messageText }] });
      addChatHistory({ role: 'model', parts: [{ text: response }] });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error while processing your message. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      addMessage(errorMessage);
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
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Reset chat function - now uses context
  const handleResetChat = () => {
    resetChat();
    setInputMessage('');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to use the AI assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #FF86E1 0%, #89BCFF 50%, #FFFFFF 100%)'
    }}>
      {/* Background gradient overlay for depth */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center bottom, rgba(255, 134, 225, 0.4) 0%, rgba(137, 188, 255, 0.3) 30%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 255, 255, 0.9) 100%)'
      }}></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with reset button */}
        <div className="p-4 border-b border-white/20">
          <h2 className="text-lg font-semibold text-[#160211] mb-3">AI Assistant</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetChat}
            className="bg-white/80 hover:bg-black/10 border-white/30"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Chat
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showSuggestions && messages.length === 0 ? (
            // Welcome screen with suggestions
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
              {/* Sparkle icon */}
              <div className="mb-8">
                <img src={sparkleIcon} alt="AI Sparkle" className="w-9 h-9" />
              </div>
              
              {/* Main heading */}
              <h1 className="text-2xl font-bold text-[#160211] text-center mb-8">
                Your humble assistant
              </h1>
              
              {/* Suggestion buttons */}
              <div className="space-y-3 w-full max-w-md">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full p-4 text-left bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/90 hover:shadow-md transition-all duration-200 text-[#160211] text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages area
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-[#160211] text-white'
                          : message.isError
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-white/90 backdrop-blur-sm text-[#160211] border border-white/30'
                      }`}
                    >
                      {message.sender === 'ai' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/90 backdrop-blur-sm text-[#160211] border border-white/30 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input area - always visible */}
        <div className="p-4 border-t border-white/20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <Textarea
                    value={inputMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your CS career..."
                    className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-[#160211] placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-[#c28abd] hover:bg-[#ffffff] text-[#a165a1] rounded-xl px-3 py-2 h-11 flex-shrink-0"
                >
                  <img src={sendIcon} alt="Send" className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistentChat;
