import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatbotPage.css';

function ChatbotPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm your Hostel Assistant AI. I can help you with questions about check-in, meals, attendance, and more. What can I help you with?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputValue,
          studentId: user?.studentId,
          conversationHistory: messages
        })
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: messages.length + 2,
          text: data.reply,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: messages.length + 2,
          text: "Sorry, I couldn't process that. Please try again.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: "Connection error. Please check your internet and try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "How do I check in?",
    "What are the meal times?",
    "How does geofencing work?",
    "Can I change my meal selection?",
    "What is my attendance status?"
  ];

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="chatbot-page">
      <nav className="navbar">
        <div className="nav-brand">🏫 Hostel Management</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="chatbot-container">
        <div className="chatbot-header">
          <h1>🤖 AI Hostel Assistant</h1>
          <p>Ask me anything about your hostel experience!</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <span className="message-icon">
                  {message.sender === 'bot' ? '🤖' : '👤'}
                </span>
                <div className="message-text">
                  {message.text}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="message-content">
                <span className="message-icon">🤖</span>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="suggested-questions">
            <p>Popular questions:</p>
            <div className="questions-grid">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  className="suggestion-btn"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            className="chat-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={loading || !inputValue.trim()}
          >
            {loading ? '⏳' : '📤'}
          </button>
        </form>

        <div className="chatbot-info">
          <p>💡 <strong>Tip:</strong> I can help with check-in, meals, attendance, hostel rules, and more!</p>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;