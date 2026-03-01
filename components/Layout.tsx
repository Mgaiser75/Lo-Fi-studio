
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music, 
  Layers, 
  Settings, 
  Disc,
  User,
  Zap,
  Menu
} from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; isMobile?: boolean }> = ({ to, icon, label, isMobile }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      isMobile 
        ? `flex flex-col items-center justify-center flex-1 py-2 transition-all ${
            isActive ? 'text-amber-500' : 'text-slate-500'
          }`
        : `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`
    }
  >
    {icon}
    <span className={isMobile ? "text-[10px] mt-1 font-medium" : "font-medium"}>{label}</span>
  </NavLink>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 flex-col fixed h-full z-30">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="p-2 bg-amber-500 rounded-lg shadow-lg shadow-amber-500/20">
            <Disc className="w-6 h-6 text-slate-950 animate-spin-slow" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">LoFi Studio</h1>
        </div>

        <nav className="space-y-2 flex-grow">
          <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          <NavItem to="/tracks" icon={<Music className="w-5 h-5" />} label="Tracks" />
          <NavItem to="/mixes" icon={<Layers className="w-5 h-5" />} label="Mixes" />
          <NavItem to="/cloner" icon={<Zap className="w-5 h-5" />} label="Channel Spawner" />
        </nav>

        <div className="mt-auto space-y-2 border-t border-slate-800 pt-6">
          <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
          <div className="flex items-center space-x-3 px-4 py-3 text-slate-400">
            <User className="w-5 h-5" />
            <span className="text-sm truncate">creator@lofi.studio</span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 z-30">
        <div className="flex items-center space-x-3">
          <Disc className="w-6 h-6 text-amber-500 animate-spin-slow" />
          <h1 className="text-lg font-bold text-white">LoFi Studio</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-400" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 z-30">
        <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Home" isMobile />
        <NavItem to="/tracks" icon={<Music className="w-5 h-5" />} label="Tracks" isMobile />
        <NavItem to="/mixes" icon={<Layers className="w-5 h-5" />} label="Mixes" isMobile />
        <NavItem to="/cloner" icon={<Zap className="w-5 h-5" />} label="Cloner" isMobile />
      </nav>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
