import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Sparkles } from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const styles = `
    .admin-container { 
      display: flex; 
      min-height: 100vh; 
      background: #f8fafc; 
    }
    
    .main-content { 
      flex: 1; 
      width: 100%; 
      position: relative; 
      overflow-x: hidden; 
    }
    
    .mobile-header {
      display: none; /* Default hidden untuk desktop */
      width: 100%;
      height: 64px;
      padding: 0 16px; 
      background: #ffffff;
      box-sizing: border-box;
      display: none; /* Akan diubah di media query */
      justify-content: space-between; 
      align-items: center;
      position: sticky; 
      top: 0; 
      z-index: 50; 
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .mobile-menu-btn {
      background: transparent !important;
      border: none !important;
      color: #0f172a !important;
      padding: 8px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      flex-shrink: 0;
      margin-right: -4px; /* Tarik sedikit ke kanan agar pas di margin */
    }

    .sidebar-overlay {
      position: fixed; 
      inset: 0; 
      background: rgba(15, 23, 42, 0.4); 
      backdrop-filter: blur(4px); 
      z-index: 90; 
      opacity: 0; 
      pointer-events: none; 
      transition: 0.3s ease;
    }

    .sidebar-overlay.visible { 
      opacity: 1; 
      pointer-events: auto; 
    }

    @media (max-width: 768px) {
      .admin-container { flex-direction: column; }
      .mobile-header { display: flex; } /* Tampilkan di mobile */
      .main-content { padding: 16px; }
    }
  `;

  return (
    <div className="admin-container">
      <style>{styles}</style>
      
      {/* HEADER MOBILE */}
      <header className="mobile-header">
        <div className="logo-section">
          <Sparkles size={20} className="text-sky-500" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '800', fontSize: '12px', lineHeight: '1', color: '#0f172a' }}>SAKA</span>
            <span style={{ fontWeight: '600', fontSize: '10px', color: '#64748b' }}>ADMIN</span>
          </div>
        </div>
        
        <button 
          className="mobile-menu-btn" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* OVERLAY */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* SIDEBAR */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setSidebarOpen(false)} 
      />
      
      {/* CONTENT */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}