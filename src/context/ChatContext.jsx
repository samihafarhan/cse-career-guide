import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const addChatHistory = useCallback((historyItem) => {
    setChatHistory(prev => [...prev, historyItem]);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setChatHistory([]);
    setShowSuggestions(true);
  }, []);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  const value = {
    messages,
    chatHistory,
    showSuggestions,
    addMessage,
    addChatHistory,
    resetChat,
    hideSuggestions,
    setMessages,
    setChatHistory
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
