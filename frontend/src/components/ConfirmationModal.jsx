import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  GraduationCap,
  ChevronRight,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, closeSidebar }) {
  const { logout } = useAuth();
  const { success } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) closeSidebar();
  };

  const handleAdminLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    success('Berhasil keluar dari Panel Admin. Sampai jumpa!');
  };

  const styles = `
    .sidebar {
      width: 280px;
      background: #ffffff;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      border-right: 1px solid #f1f5f9;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
    }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      margin-bottom: 4px;
      border-radius: 12px;
      color: #64748b;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-item:hover {
      color: #0ea5e9;
      background: #f0f9ff;
    }

    .nav-item.active {
      color: #0ea5e9;
      background: #f0f9ff;
    }

    .nav-item.active::before {
      content: "";
      position: absolute;
      left: -12px;
      top: 25%;
      height: 50%;
      width: 4px;
      background: #0ea5e9;
      border-radius: 0 4px 4px 0;
    }

    .chevron {
      opacity: 0;
      transition: all 0.3s;
    }

    .nav-item.active .chevron {
      opacity: 1;
      transform: translateX(2px);
    }

    .nav-label {
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 24px 0 12px 12px;
      display: block;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 14px 16px;
      background: #fff1f2;
      color: #e11d48;
      border: 1px solid rgba(225, 29, 72, 0.1);
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #ffe4e6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.08);
    }

    /* Responsif Mobile */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        transform: translateX(-100%); /* Sembunyi ke kiri */
        width: 280px;
        box-shadow: 20px 0 50px rgba(0,0,0,0.1);
      }
      
      .sidebar.mobile-visible {
        transform: translateX(0); /* Muncul */
      }

      .nav-item.active::before { left: -8px; }
    }

    @media (max-width: 480px) {
      .sidebar { width: 85%; }
    }
  `;

  return (
    <aside className={`sidebar ${isOpen ? "mobile-visible" : ""}`}>
      <style>{styles}</style>

      {/* Header Branding */}
      <div style={{ 
        padding: "0 10px 24px", 
        borderBottom: "1px solid #f1f5f9", 
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img src="/saka.png" alt="SAKA" style={{ width: "50px", height: "auto" }} />
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              SAKA
            </h2>
            <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
              Admin Panel
            </span>
          </div>
        </div>
        
        {/* Tombol Close khusus Mobile */}
        {isOpen && (
          <button 
            onClick={closeSidebar} 
            style={{ 
              display: window.innerWidth <= 768 ? 'flex' : 'none',
              background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' 
            }}
          >
            <X size={20} color="#64748b" />
          </button>
        )}
      </div>

      {/* Navigasi Menu */}
      <nav style={{ flex: 1, overflowY: "auto" }}>
        <span className="nav-label">Overview</span>
        <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={handleLinkClick}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <ChevronRight size={14} className="chevron" />
        </NavLink>

        <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={handleLinkClick}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Users size={18} /> Users
          </div>
          <ChevronRight size={14} className="chevron" />
        </NavLink>

        <NavLink to="/admin/content/levels" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={handleLinkClick}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BookOpen size={18} /> Content
          </div>
          <ChevronRight size={14} className="chevron" />
        </NavLink>

        <span className="nav-label">Interface</span>
        <NavLink to="/levels" className="nav-item" onClick={handleLinkClick}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <GraduationCap size={18} /> Student View
          </div>
        </NavLink>
      </nav>

      {/* Logout Section */}
      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <button onClick={handleAdminLogout} className="logout-btn">
          <LogOut size={18} /> <span>Logout Account</span>
        </button>
      </div>

      {/* MODAL KONFIRMASI */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Keluar dari Panel Admin?"
        message="Sesi manajemen sistem Anda akan diakhiri. Yakin ingin melanjutkan?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        type="danger" 
      />
    </aside>
  );
}