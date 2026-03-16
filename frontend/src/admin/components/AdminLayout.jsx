import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, Sparkles } from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const styles = `
    .admin-container { display: flex; min-height: 100vh; background: #f8fafc; }
    .main-content { flex: 1; width: 100%; position: relative; overflow-x: hidden; }
    
    .mobile-header {
      display: none; 
      padding: 12px 20px; 
      background: #ffffff; /* Ganti dari #0f172a ke putih */
      color: #0f172a; /* Ganti teks jadi gelap */
      justify-content: space-between; 
      align-items: center;
      position: sticky; 
      top: 0; 
      z-index: 50; 
      border-bottom: 1px solid #f1f5f9; /* Tambah border bawah tipis */
      box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    }

    /* Pastikan tombol hamburger di mobile header juga berubah warnanya */
    .mobile-header button {
      color: #0f172a !important;
    }

    .sidebar-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px); z-index: 90; opacity: 0; pointer-events: none; transition: 0.3s;
    }

    @media (max-width: 768px) {
      .mobile-header { display: flex; }
      .sidebar-overlay.visible { opacity: 1; pointer-events: auto; }
      .admin-container { flex-direction: column; }
    }
  `;

  return (
    <div className="admin-container">
      <style>{styles}</style>
      
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} className="text-sky-400" />
          <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '0.05em' }}>SAKA ADMIN</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white' }}>
          <Menu size={24} />
        </button>
      </header>

      <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}