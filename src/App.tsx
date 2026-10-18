/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Printer, 
  ClipboardList, 
  Wrench, 
  Search,
  User,
  FlaskConical,
  LogOut,
  X,
  Settings,
  Bell
} from 'lucide-react';
import { cn } from './utils';
import Dashboard from './pages/Dashboard';
import LabelEngine from './pages/LabelEngine';
import DailyLogs from './pages/DailyLogs';
import Maintenance from './pages/Maintenance';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion } from 'motion/react';

function AppContent() {
  const { user, loading, login, logout } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'standard'>(
    (localStorage.getItem('aura-theme') as 'dark' | 'standard') || 'dark'
  );

  useEffect(() => {
    if (theme === 'standard') {
      document.body.classList.add('standard-theme');
    } else {
      document.body.classList.remove('standard-theme');
    }
    localStorage.setItem('aura-theme', theme);
  }, [theme]);

  if (loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans tracking-widest text-sm uppercase text-white/50 font-medium">Loading Aura Labs...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-6 relative overflow-hidden">
        {/* Lavish glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37] opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900 opacity-[0.04] rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel p-10 md:p-14 rounded-3xl max-w-md w-full relative z-10 flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-[#D4AF37]/30 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-[0_0_30px_rgba(212,175,55,0.15)]"
          >
            <FlaskConical size={32} strokeWidth={1.2} className="text-[#D4AF37]" />
          </motion.div>
          <div className="text-center w-full">
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl font-serif tracking-wider lux-gradient-text mb-4">Aura Labs</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-white/50 mb-14 font-mono uppercase tracking-[0.3em]">Elite Management Protocol</motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              onClick={login}
              className="w-full bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black rounded-full py-4 font-medium text-sm transition-all duration-500 ease-out tracking-widest uppercase hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            >
              Sign in with Google
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] flex font-sans text-white/90 selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] relative overflow-hidden">
        {/* Global ambient background glows */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37] opacity-[0.02] rounded-full blur-[150px] pointer-events-none"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900 opacity-[0.03] rounded-full blur-[150px] pointer-events-none"></div>
        
        <Sidebar onLogout={logout} theme={theme} onThemeChange={setTheme} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          <TopBar userEmail={user.email} />
          <nav aria-label="Mobile modules" className="md:hidden flex flex-wrap gap-2 p-3 border-b border-white/10">
            {[['Analytics Hub','/'],['Label Engine','/labels'],['Daily Logs','/daily-logs'],['Maintenance','/maintenance']].map(([label,path])=><Link key={path} to={path} className="px-3 py-2 rounded-lg border border-white/15 text-xs">{label}</Link>)}
          </nav>
          <main className="flex-1 overflow-auto p-6 md:p-10 scrollbar-hide">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/labels" element={<LabelEngine />} />
                <Route path="/daily-logs" element={<DailyLogs />} />
                <Route path="/maintenance" element={<Maintenance />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function Sidebar({ onLogout, theme, onThemeChange }: { onLogout: () => void, theme: 'dark' | 'standard', onThemeChange: (t: 'dark' | 'standard') => void }) {
  const location = useLocation();
  const [showPreferences, setShowPreferences] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('aura-notifications') !== 'false'
  );

  useEffect(() => {
    localStorage.setItem('aura-notifications', notificationsEnabled.toString());
  }, [notificationsEnabled]);
  
  const navigation = [
    { name: 'Analytics Hub', href: '/', icon: BarChart3 },
    { name: 'Label Engine', href: '/labels', icon: Printer },
    { name: 'Daily Logs', href: '/daily-logs', icon: ClipboardList },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  ];

  return (
    <>
      <div className="w-72 bg-[#0A0A0A]/80 backdrop-blur-3xl border-r border-white/5 flex-shrink-0 hidden md:flex flex-col z-20">
        <div className="h-28 flex items-center px-10 space-x-5">
          <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 bg-gradient-to-br from-[#1a1a1a] to-[#050505] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.05)]">
            <FlaskConical size={22} strokeWidth={1.5} className="text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif tracking-wider lux-gradient-text">Aura</h1>
            <span className="text-[10px] font-mono text-[#D4AF37]/70 font-light uppercase tracking-[0.2em] mt-1 block">Labs Premium</span>
          </div>
        </div>
        <nav className="flex-1 py-8 px-6 space-y-2">
          <div className="mb-6 px-4 text-[10px] font-light uppercase text-white/40 tracking-[0.2em]">Modules</div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-light tracking-wide transition-all duration-300",
                  isActive 
                    ? "bg-white/5 text-white border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                    : "bg-transparent text-white/50 hover:bg-white/[0.02] hover:text-white/80 border border-transparent"
                )}
              >
                <item.icon size={18} className={cn("transition-colors duration-300", isActive ? "text-[#D4AF37]" : "text-white/40")} strokeWidth={isActive ? 1.5 : 1.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-white/5">
          <div className="px-4 flex items-center justify-between text-[10px] font-light uppercase tracking-[0.2em] text-white/40 mb-6">
            <span>Status</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span> Demo session</span>
          </div>
          <button 
            onClick={() => setShowPreferences(true)}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-sm font-light hover:bg-white/[0.02] text-white/50 hover:text-white/90 transition-all duration-300"
          >
            <Settings size={18} strokeWidth={1.5} className="text-white/40" />
            Preferences
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-sm font-light hover:bg-red-900/10 text-white/50 hover:text-red-400/80 transition-all duration-300 mt-2"
          >
            <LogOut size={18} strokeWidth={1.5} className="text-white/40" />
            End Session
          </button>
        </div>
      </div>

      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative">
            <button 
              onClick={() => setShowPreferences(false)}
              className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            <h2 className="text-2xl font-serif text-white tracking-wide mb-6">System Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-3">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onThemeChange('dark')}
                    className={cn(
                      "py-2.5 px-4 rounded-xl text-sm font-light tracking-wide transition-all",
                      theme === 'dark' ? "border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]" : "border border-white/10 bg-white/5 text-white/50 hover:text-white/90"
                    )}
                  >
                    Dark Elegance
                  </button>
                  <button 
                    onClick={() => onThemeChange('standard')}
                    className={cn(
                      "py-2.5 px-4 rounded-xl text-sm font-light tracking-wide transition-all",
                      theme === 'standard' ? "border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]" : "border border-white/10 bg-white/5 text-white/50 hover:text-white/90"
                    )}
                  >
                    Standard Night
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-3">Notifications</label>
                <div 
                  className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  <span className="text-sm font-light text-white/80 tracking-wide">Emergency Alerts</span>
                  <div className={cn(
                    "w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-300 border",
                    notificationsEnabled ? "bg-[#D4AF37]/20 border-[#D4AF37]/30" : "bg-white/10 border-white/20"
                  )}>
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300",
                      notificationsEnabled ? "bg-[#D4AF37] translate-x-4" : "bg-white/50 translate-x-0 !shadow-none"
                    )}></div>
                  </div>
                </div>
              </div>

               <div className="pt-4 border-t border-white/10">
                 <button 
                   onClick={() => setShowPreferences(false)}
                   className="w-full py-3.5 bg-transparent border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-sm font-light tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                 >
                   Save Changes
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TopBar({ userEmail }: { userEmail?: string | null }) {
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const titleMap: Record<string, string> = {
    '/': 'Analytics Hub',
    '/labels': 'Label Engine',
    '/daily-logs': 'Daily Logs',
    '/maintenance': 'Equipment Maintenance'
  };

  const title = titleMap[location.pathname] || 'Dashboard';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <header className="h-28 flex items-center justify-between px-8 md:px-12 shrink-0 z-10 border-b border-white/5 bg-[#050505]/50 backdrop-blur-md relative">
      {toastMessage && (
        <div className="absolute top-full mt-2 right-12 z-50 bg-black/80 border border-white/10 text-white/80 px-4 py-2 rounded-xl text-sm font-light backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
      <div className="flex items-center gap-6 min-w-0">
        <h2 className="text-2xl md:text-3xl font-serif tracking-wide text-white/90 font-light truncate">{title}</h2>
        <div className="hidden md:flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-1.5 backdrop-blur-sm whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></div>
          <span className="text-[10px] font-light text-[#D4AF37] uppercase tracking-[0.2em] pt-px">
            Portfolio Demo
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6 md:gap-8 shrink-0">
        <button onClick={() => showToast("Search is currently disabled at this level.")} className="hidden md:flex relative group cursor-pointer text-left">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-[#D4AF37] transition-colors duration-500" size={16} strokeWidth={1.5} />
          <div className="pl-12 pr-4 py-3 bg-white/[0.02] border border-white/10 hover:border-white/30 rounded-full text-sm font-light text-white/30 tracking-wide w-48 transition-all duration-300">
            Query disabled...
          </div>
        </button>
        <button onClick={() => showToast("No new alerts.")} className="relative p-3 text-white/50 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-[#D4AF37]/10 flex items-center justify-center">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-2.5 right-2 w-2 h-2 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
        </button>
        <div className="w-px h-8 bg-white/10 hidden md:block"></div>
        <button onClick={() => showToast("Profile settings coming soon.")} className="flex items-center gap-4 hover:opacity-80 transition-opacity group text-left">
          <div className="text-right hidden md:block">
            <p className="text-sm font-light tracking-wide text-white/90 truncate max-w-[120px]">{userEmail || 'Director'}</p>
            <p className="text-[10px] font-light uppercase tracking-[0.2em] text-[#D4AF37]/70 mt-0.5">Demo Workspace</p>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:border-[#D4AF37]/50 transition-colors shrink-0">
            <User size={18} strokeWidth={1.5} />
          </div>
        </button>
      </div>
    </header>
  );
}
