import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { NoteDetail } from './pages/NoteDetail';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AutoLogout() {
  const { user, logout } = useAuth();
  
  React.useEffect(() => {
    if (!user) return;
    
    let timeout;
    
    const resetTimeout = () => {
      if (timeout) clearTimeout(timeout);
      // 5 minutos de inactividad (300000 ms)
      timeout = setTimeout(() => {
        logout();
      }, 5 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => window.addEventListener(event, resetTimeout));
    resetTimeout();

    return () => {
      if (timeout) clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimeout));
    };
  }, [user, logout]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AutoLogout />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nota/:id" 
            element={
              <ProtectedRoute>
                <NoteDetail />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
