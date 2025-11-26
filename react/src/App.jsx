import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Home } from './components/Home';
import RegisterPage from './components/Auth/RegisterPage';
import LoginPage from './components/Auth/LoginPage';
import ChatPage from './components/Chat/ChatPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, loading } = useAuth();

  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/', '/register', '/login', '/chat']);
    }
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/chat" replace /> : <RegisterPage />} 
        />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/chat" replace /> : <LoginPage />} 
        />
        <Route 
          path="/chat" 
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
