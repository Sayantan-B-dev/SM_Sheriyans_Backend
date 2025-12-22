import React, { createContext, useContext, useState, useCallback } from "react";
import { chatAPI } from "../services/api";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createChat = useCallback(async (title) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await chatAPI.createChat(title);
      setChats((prev) => [data.chat, ...prev]);
      setActiveChat(data.chat);
      setMessages([]);
      return data.chat;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const selectChat = useCallback((chat) => {
    setActiveChat(chat);
    setMessages([]);
  }, []);

  const value = {
    chats,
    setChats,
    activeChat,
    setActiveChat,
    messages,
    setMessages,
    loading,
    error,
    createChat,
    addMessage,
    selectChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
