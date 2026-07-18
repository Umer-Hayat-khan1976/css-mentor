/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { authService, isFirebaseAvailable } from './lib/firebase';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import SettingsPage from './components/SettingsPage';
import { Compass, BookOpen, User, Settings as SettingsIcon, LogOut, ShieldAlert } from 'lucide-react';

type ViewState = 'landing' | 'auth' | 'dashboard' | 'chat' | 'settings';

interface UserSession {
  uid: string;
  email: string;
}

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<UserSession | null>(null);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | undefined>(undefined);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email });
        setView('dashboard');
      } else {
        setUser(null);
        setView('landing');
      }
      setAuthLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (uid: string, email: string) => {
    setUser({ uid, email });
    setView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setView('landing');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleNavigateToChat = (prompt?: string) => {
    if (prompt) {
      setInitialChatPrompt(prompt);
    }
    setView('chat');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4D7C7A] flex items-center justify-center text-[#FEF9E7] text-2xl mx-auto shadow-sm animate-pulse">
            <Compass className="w-6 h-6 animate-spin text-[#FEF9E7]" />
          </div>
          <p className="text-sm text-stone-500 font-serif">Opening your CSS Mentor cabinet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col">
      {/* ═══════════════════════════════
          TOP NAVIGATION (AUTHENTICATED ONLY)
          ═══════════════════════════════ */}
      {user && view !== 'landing' && view !== 'auth' && (
        <header className="bg-white border-b border-[#E9E5DB] h-[70px] shrink-0 sticky top-0 z-50">
          <div className="max-w-7xl w-full mx-auto h-full px-6 flex items-center justify-between">
            {/* Logo */}
            <div 
              onClick={() => setView('dashboard')} 
              className="flex items-center space-x-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#4D7C7A] flex items-center justify-center text-[#FEF9E7] shadow-xs">
                <Compass className="w-5 h-5 text-[#FEF9E7]" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-[#2D4F4D]">CSS Mentor</h1>
                <p className="text-[9px] font-mono tracking-widest text-[#8C8A82] uppercase leading-none">Aspirant Companion</p>
              </div>
            </div>

            {/* Links */}
            <nav className="flex items-center space-x-1.5 md:space-x-3 text-xs">
              <button
                onClick={() => setView('dashboard')}
                className={`px-3 py-2 rounded-xl font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                  view === 'dashboard'
                    ? 'bg-[#E8F1F0] text-[#2D4F4D]'
                    : 'text-[#5C5A55] hover:bg-stone-50 hover:text-[#2D4F4D]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Study Desk</span>
              </button>

              <button
                onClick={() => handleNavigateToChat()}
                className={`px-3 py-2 rounded-xl font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                  view === 'chat'
                    ? 'bg-[#E8F1F0] text-[#2D4F4D]'
                    : 'text-[#5C5A55] hover:bg-stone-50 hover:text-[#2D4F4D]'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Study Chat</span>
              </button>

              <button
                onClick={() => setView('settings')}
                className={`px-3 py-2 rounded-xl font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                  view === 'settings'
                    ? 'bg-[#E8F1F0] text-[#2D4F4D]'
                    : 'text-[#5C5A55] hover:bg-stone-50 hover:text-[#2D4F4D]'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </nav>

            {/* Session Info / Quick Profile */}
            <div className="hidden md:flex items-center space-x-3.5 pl-4 border-l border-stone-200">
              <div className="text-right">
                <span className="text-[10px] text-[#8C8A82] block leading-none">Authenticated Aspirant</span>
                <span className="text-xs font-semibold text-[#2D4F4D] truncate max-w-[120px] inline-block">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-700 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ═══════════════════════════════
          ACTIVE VIEW CONTROLLER
          ═══════════════════════════════ */}
      <div className="flex-grow flex flex-col">
        {view === 'landing' && (
          <LandingPage onStart={() => setView('auth')} />
        )}

        {view === 'auth' && (
          <AuthPage 
            onSuccess={handleAuthSuccess}
            onBack={() => setView('landing')}
          />
        )}

        {view === 'dashboard' && user && (
          <div className="flex-grow flex flex-col justify-between">
            <Dashboard 
              uid={user.uid}
              onNavigateToChat={handleNavigateToChat}
              onNavigateToSettings={() => setView('settings')}
            />
            {/* Storage Info Bar */}
            <div className="max-w-6xl w-full mx-auto px-6 pb-6 pt-2 text-[10px] text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseAvailable ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                {isFirebaseAvailable 
                  ? "Connected to Cloud Firestore" 
                  : "Using Secure Local Storage Fallback (Offline-First Dev Mode)"}
              </span>
              <span>Logged in session: {user.email}</span>
            </div>
          </div>
        )}

        {view === 'chat' && user && (
          <ChatInterface 
            uid={user.uid}
            initialPrompt={initialChatPrompt}
            onClearInitialPrompt={() => setInitialChatPrompt(undefined)}
            onNavigateToDashboard={() => setView('dashboard')}
          />
        )}

        {view === 'settings' && user && (
          <SettingsPage 
            uid={user.uid}
            onLogout={handleLogout}
            onSaveCompleted={() => setView('dashboard')}
          />
        )}
      </div>
    </div>
  );
}
