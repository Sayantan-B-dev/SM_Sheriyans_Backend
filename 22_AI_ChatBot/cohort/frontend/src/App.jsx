import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [quotaError, setQuotaError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('ai-message-response', (data) => {
      console.log('Received ai-message-response:', data);
      
      setIsTyping(false);
      
      if (!data || !data.response) {
        console.warn('Received invalid data:', data);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: 'Received an invalid response from the server. Please try again.',
            sender: 'ai',
            timestamp: new Date(),
            isError: true,
          },
        ]);
        return;
      }
      
      const responseText = String(data.response);
      const isError = responseText.includes('⚠️') || responseText.includes('⏳');
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: responseText,
          sender: 'ai',
          timestamp: new Date(),
          isError: isError,
        },
      ]);
      
      // Check if it's a rate limit error and set quota error state
      if (responseText.includes('⏳')) {
        setQuotaError(true);
        setTimeout(() => {
          setQuotaError(false);
        }, 5000);
      } else {
        setQuotaError(false);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !isConnected || isTyping || quotaError) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    setIsTyping(true);

    // Send message to AI via socket
    console.log('Sending message to server:', { prompt: messageToSend });
    socket.emit('ai-message', { prompt: messageToSend });

    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="chat-widget">
      {!isOpen ? (
        <button 
          className="chat-toggle-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      ) : (
        <div className="chat-popup">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <h3>AI Chat</h3>
              <div className="header-right">
                <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                <button 
                  className="close-button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <p>Start a conversation</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'} ${message.isError ? 'error' : ''}`}
                  >
                    <div className="message-text">
                      {message.sender === 'ai' && !message.isError ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      ) : (
                        message.text
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message ai-message typing">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="input-container">
            <form onSubmit={handleSendMessage} className="input-form">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  quotaError
                    ? 'Please wait...'
                    : isConnected
                    ? 'Type your message...'
                    : 'Connecting...'
                }
                disabled={!isConnected || isTyping || quotaError}
                className="message-input"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !isConnected || isTyping || quotaError}
                className="send-button"
                aria-label="Send message"
              >
                →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
