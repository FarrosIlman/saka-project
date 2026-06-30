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
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center justify-between px-4 py-3 mb-1.5 rounded-2xl text-sm font-bold transition-all duration-300 group ${
      isActive
        ? "bg-sky-50 text-sky-600 shadow-sm"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    }`;

  const iconClass = ({ isActive }) =>
    `transition-colors duration-300 ${isActive ? "text-sky-500" : "text-slate-400 group-hover:text-slate-500"}`;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[280px] bg-white border-r border-slate-100 flex flex-col p-6 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">SAKA</h2>
            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Admin Panel</span>
          </div>
          
          {isOpen && (
            <button
              onClick={closeSidebar}
              className="ml-auto p-2 text-slate-400 hover:bg-slate-100 rounded-xl md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto pr-2 -mr-2">
          <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Overview</span>
          
          <NavLink to="/admin/dashboard" className={navLinkClass} onClick={handleLinkClick}>
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={20} className={iconClass({ isActive })} />
                  <span>Dashboard</span>
                </div>
                <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? "opacity-100 translate-x-1 text-sky-400" : "opacity-0 -translate-x-2"}`} />
              </>
            )}
          </NavLink>

          <NavLink to="/admin/users" className={navLinkClass} onClick={handleLinkClick}>
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Users size={20} className={iconClass({ isActive })} />
                  <span>Users</span>
                </div>
                <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? "opacity-100 translate-x-1 text-sky-400" : "opacity-0 -translate-x-2"}`} />
              </>
            )}
          </NavLink>

          <NavLink to="/admin/content/levels" className={navLinkClass} onClick={handleLinkClick}>
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className={iconClass({ isActive })} />
                  <span>Content Levels</span>
                </div>
                <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? "opacity-100 translate-x-1 text-sky-400" : "opacity-0 -translate-x-2"}`} />
              </>
            )}
          </NavLink>

          <div className="mt-8 mb-3">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Interface</span>
          </div>

          <NavLink to="/admin/view-student" className={navLinkClass} onClick={handleLinkClick}>
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <GraduationCap size={20} className={iconClass({ isActive })} />
                  <span>Student View</span>
                </div>
                <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? "opacity-100 translate-x-1 text-sky-400" : "opacity-0 -translate-x-2"}`} />
              </>
            )}
          </NavLink>
        </nav>

        {/* Footer / Logout */}
        <div className="pt-6 mt-4 border-t border-slate-100">
          <button 
            onClick={handleAdminLogout} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 hover:shadow-sm transition-all"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Logout Account
          </button>
        </div>

        <ConfirmationModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={confirmLogout}
          title="Keluar dari Panel Admin?"
          message="Sesi manajemen sistem Anda akan diakhiri. Yakin ingin melanjutkan?"
          confirmText="Ya, Logout"
          cancelText="Batal"
          type="warning"
        />
      </motion.aside>
    </>
  );
}