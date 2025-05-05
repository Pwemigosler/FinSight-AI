
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import AccountSetup from './pages/AccountSetup';
import { AuthProvider } from './contexts/auth';
import { AvatarProvider } from './contexts/AvatarContext';
import { ThemeProvider } from './contexts/theme/ThemeContext';
import { NotificationPreferencesProvider } from './contexts/notifications/NotificationPreferencesContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AvatarProvider>
          <ThemeProvider>
            <NotificationPreferencesProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/setup" element={<AccountSetup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </NotificationPreferencesProvider>
          </ThemeProvider>
        </AvatarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
