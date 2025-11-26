import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getMessages, sendMessage } from '../../../api/messages';
import './styles.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const data = await getMessages({ limit: 100, offset: 0 });
      setMessages(data.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) {
      return;
    }

    setSending(true);
    try {
      const newMessage = await sendMessage({ text: messageText.trim() });
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="chat-loading" data-easytag="id1-react/src/components/Chat/ChatPage/index.jsx">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="chat-container" data-easytag="id2-react/src/components/Chat/ChatPage/index.jsx">
      <div className="chat-header">
        <div className="chat-header-title">
          <h1>Групповой чат</h1>
        </div>
        <div className="chat-header-actions">
          <span className="user-info">{user?.username}</span>
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">Нет сообщений. Начните общение!</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.username === user?.username ? 'message-own' : 'message-other'}`}
            >
              <div className="message-header">
                <span className="message-author">{message.username}</span>
                <span className="message-time">{formatTime(message.created_at)}</span>
              </div>
              <div className="message-text">{message.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Введите сообщение..."
          className="chat-input"
          maxLength={5000}
          disabled={sending}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!messageText.trim() || sending}
        >
          {sending ? '...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
