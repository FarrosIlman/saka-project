import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SakaLogo from "../../assets/images/saka.png";
import Swal from "sweetalert2"; // Import SweetAlert2 untuk dialog konfirmasi
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

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) closeSidebar();
  };

  // --- FUNGSI KONFIRMASI LOGOUT ADMIN ---
  const handleAdminLogout = () => {
    Swal.fire({
      title: "Keluar dari Panel Admin?",
      text: "Sesi manajemen sistem Anda akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a", // Warna Slate-900 menyesuaikan tema admin
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      reverseButtons: true,
      borderRadius: "24px",
      customClass: {
        popup: "swal-rounded",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          title: "Logged Out",
          text: "Sesi admin berhasil diakhiri.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
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
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

    /* Indikator vertikal kecil untuk menu aktif */
    .nav-item.active::before {
      content: "";
      position: absolute;
      left: -20px;
      top: 20%;
      height: 60%;
      width: 4px;
      background: #0ea5e9;
      border-radius: 0 4px 4px 0;
    }

    .chevron {
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
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
      border: 1px solid rgba(225, 29, 72, 0.05);
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.2s;
      margin-top: auto;
    }

    .logout-btn:hover {
      background: #ffe4e6;
      transform: translateY(-1px);
    }

    /* Custom Style SweetAlert agar selaras dengan tema */
    .swal-rounded {
      border-radius: 24px !important;
      font-family: inherit !important;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed !important;
        left: -100vw;
        top: 0 !important;
        width: 280px;
        height: 100vh;
        z-index: 999;
        box-shadow: 2px 0 30px rgba(0,0,0,0.1);
        overflow-y: auto;
        transition: left 0.3s ease;
      }
      .sidebar.mobile-visible {
        left: 0 !important;
      }
      .sidebar { width: 100vw; }
    }

    @media (max-width: 480px) {
      .sidebar { width: calc(100vw - 60px); }
    }
  `;

  return (
    <aside className={`sidebar ${isOpen ? "mobile-visible" : ""}`}>
      <style>{styles}</style>

      {/* Brand Header - Large Logo & Natural Design */}
      <div
        style={{
          padding: "10px 10px 30px",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            position: "relative",
          }}
        >
          {/* Logo Tanpa Kotak & Lebih Besar */}
          <img
            src={SakaLogo}
            alt="SAKA"
            style={{
              width: "55px",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />

          <div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "900",
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              SAKA
            </h2>
            <span
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "4px",
                display: "block",
              }}
            >
              Admin Panel
            </span>
          </div>

          {/* Tombol Close Mobile */}
          {isOpen && window.innerWidth <= 768 && (
            <X
              size={24}
              onClick={closeSidebar}
              style={{
                marginLeft: "auto",
                color: "#64748b",
                cursor: "pointer",
              }}
            />
          )}
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        <span className="nav-label">Overview</span>
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={handleLinkClick}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <ChevronRight size={14} className="chevron" />
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={handleLinkClick}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Users size={18} /> Users
          </div>
          <ChevronRight size={14} className="chevron" />
        </NavLink>

        <NavLink
          to="/admin/content/levels"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={handleLinkClick}
        >
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

      {/* Footer / Logout Section */}
      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <button onClick={handleAdminLogout} className="logout-btn">
          <LogOut size={18} /> Logout Account
        </button>
      </div>
    </aside>
  );
}