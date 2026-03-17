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
    
    /* HEADER MOBILE - RAPI & BERSIH */
    .mobile-header {
      display: none; /* Hidden di desktop */
      width: 100%;
      height: 70px; /* Sedikit lebih tinggi agar lega */
      padding: 0 20px; 
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-sizing: border-box;
      justify-content: space-between; 
      align-items: center;
      position: sticky; 
      top: 0; 
      z-index: 50; 
      border-bottom: 1px solid #f1f5f9;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      user-select: none;
    }

    .logo-text-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* TOMBOL HAMBURGER YANG LEBIH RAPI */
    .mobile-menu-btn {
      background: #f1f5f9 !important; /* Beri background tipis */
      border: none !important;
      color: #0f172a !important;
      width: 42px;
      height: 42px;
      border-radius: 12px; /* Rounded box agar modern */
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.2s ease;
      padding: 0 !important;
    }

    .mobile-menu-btn:active {
      transform: scale(0.9);
      background: #e2e8f0 !important;
    }

    .sidebar-overlay {
      position: fixed; 
      inset: 0; 
      background: rgba(15, 23, 42, 0.3); 
      backdrop-filter: blur(4px); 
      z-index: 90; 
      opacity: 0; 
      pointer-events: none; 
      transition: opacity 0.3s ease;
    }

    .sidebar-overlay.visible { 
      opacity: 1; 
      pointer-events: auto; 
    }

    @media (max-width: 768px) {
      .admin-container { flex-direction: column; }
      .mobile-header { display: flex; } /* Munculkan hanya di mobile */
      .main-content { 
        padding: 20px; 
        box-sizing: border-box;
      }
    }
  `;

  return (
    <div className="admin-container">
      <style>{styles}</style>
      
      {/* HEADER MOBILE */}
      <header className="mobile-header">
        <div className="logo-section">
          <div style={{ 
            background: '#0ea5e9', 
            padding: '8px', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white' 
          }}>
            <Sparkles size={20} />
          </div>
          <div className="logo-text-wrapper">
            <span style={{ fontWeight: '900', fontSize: '14px', letterSpacing: '0.5px', color: '#0f172a' }}>
              SAKA PLATFORM
            </span>
            <span style={{ fontWeight: '700', fontSize: '10px', color: '#64748b', letterSpacing: '1px' }}>
              ADMIN PANEL
            </span>
          </div>
        </div>
        
        <button 
          className="mobile-menu-btn" 
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Menu"
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