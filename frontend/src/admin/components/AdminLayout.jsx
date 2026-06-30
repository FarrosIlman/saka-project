import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Sparkles } from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-mesh-pattern opacity-40 pointer-events-none z-0"></div>
      
      {/* HEADER MOBILE */}
      <header className="md:hidden sticky top-0 z-40 w-full h-16 px-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Sparkles size={18} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-black text-sm tracking-tight text-slate-900 leading-tight">SAKA PLATFORM</span>
            <span className="font-bold text-[10px] text-sky-500 tracking-widest">ADMIN PANEL</span>
          </div>
        </div>
        
        <button 
          className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-95"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
      </header>

      {/* SIDEBAR */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setSidebarOpen(false)} 
      />
      
      {/* CONTENT */}
      <main className="flex-1 w-full min-w-0 relative z-10 p-4 sm:p-6 md:p-8 lg:p-10 max-h-screen overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}