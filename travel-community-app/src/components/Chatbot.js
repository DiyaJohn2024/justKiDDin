import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

function Chatbot({ userProfile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${userProfile.name}! 👋 I'm your AI travel buddy. Ask me anything about travel planning, destination recommendations, or tips!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call Flask chatbot endpoint
      const response = await axios.post('http://localhost:5000/chat', {
        message: input,
        user_profile: {
          interests: userProfile.interests,
          travel_style: userProfile.travelStyle,
          name: userProfile.name
        },
        conversation_history: messages.slice(-5)  // Send last 5 messages for context
      });

      if (response.data.success) {
        const botMessage = {
          role: 'assistant',
          content: response.data.response
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I had trouble connecting. Please try again!'
      }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h5>💬 Chat with AI Travel Buddy</h5>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <span className="typing-indicator">●●●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="form-control chat-input"
          placeholder="Ask me anything about travel..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="2"
          disabled={loading}
        />
        <button 
          className="btn btn-primary send-button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
