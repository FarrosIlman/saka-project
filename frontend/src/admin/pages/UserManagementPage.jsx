import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import UsersTable from '../components/UsersTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import { 
  UserPlus, Search, Download, Loader2, 
  Users as UsersIcon, Upload, XCircle, Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

export default function UserManagementPage() {
  const showToast = useToast() || { success: () => {}, error: () => {} };
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null, deleting: false });
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchUsers(); }, [search]);

  useEffect(() => {
    let filtered = users;
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    setFilteredUsers(filtered);
  }, [users, filterRole]);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ search });
      setUsers(response.data.users || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = (user) => {
    setDeleteModal({ isOpen: true, user: user, deleting: false });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, deleting: true }));
      await adminAPI.deleteUser(deleteModal.user._id);
      showToast.success(`User "${deleteModal.user.username}" berhasil dihapus`);
      setDeleteModal({ isOpen: false, user: null, deleting: false });
      await fetchUsers();
    } catch (err) {
      showToast.error(err.response?.status === 403 ? 'Admin tidak bisa dihapus' : 'Gagal menghapus user');
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ username: 'siswa1', password: '123', role: 'student' }]);
    const wb = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "Template_Siswa_SAKA.xlsx");
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = XLSX.utils.sheet_to_json(XLSX.read(evt.target.result, { type: 'binary' }).Sheets[XLSX.read(evt.target.result, { type: 'binary' }).SheetNames[0]]);
        let successCount = 0;
        for (const u of data) {
          try { await adminAPI.register(u); successCount++; } catch (userErr) { console.error(userErr); }
        }
        showToast.success(`Berhasil mengimpor ${successCount} user`);
        fetchUsers();
      } catch (err) { 
        showToast.error('Format file tidak valid'); 
      } finally { setImporting(false); }
    };
    reader.readAsBinaryString(file);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Loader2 className="animate-spin text-sky-500" size={48} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight mb-2">
            <UsersIcon className="text-sky-500" size={32} />
            User Management
          </h1>
          <p className="text-slate-500 font-medium">Kelola data siswa dan administrator platform SAKA.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={downloadTemplate} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Download Template Excel"
          >
            <Download size={18} /> Template
          </button>
          
          <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-50 text-sky-600 font-bold rounded-xl cursor-pointer hover:bg-sky-100 transition-colors border border-sky-100">
            {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {importing ? 'Importing...' : 'Import Excel'}
            <input type="file" className="hidden" onChange={handleImportExcel} accept=".xlsx" />
          </label>
          
          <button 
            onClick={() => navigate('/admin/users/new')}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <UserPlus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="glass-card bg-white/80 p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari username..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:border-sky-500 cursor-pointer transition-colors appearance-none"
            >
              <option value="all">Semua Role</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {(search || filterRole !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterRole('all'); }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-100 transition-colors shrink-0"
            >
              <XCircle size={18} /> Reset
            </button>
          )}
        </div>

        <div className="hidden lg:block ml-auto px-4 py-2 bg-sky-50 text-sky-600 font-black rounded-xl text-sm border border-sky-100 shrink-0">
          {filteredUsers.length} Users Total
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="glass-card bg-white/50 p-16 text-center border-dashed">
          <UsersIcon size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-700 mb-2">Tidak ada user ditemukan</h3>
          <p className="text-slate-500 font-medium">Coba sesuaikan kata kunci atau filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="glass-card bg-white overflow-hidden shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <UsersTable users={filteredUsers} onDelete={handleDelete} />
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => !deleteModal.deleting && setDeleteModal({ isOpen: false, user: null, deleting: false })} 
        onConfirm={confirmDelete} 
        title="Hapus User" 
        message={
          deleteModal.user?.role === 'admin'
            ? `Admin tidak dapat dihapus melalui panel ini.`
            : `Apakah Anda yakin ingin menghapus "${deleteModal.user?.username}"? Seluruh data progres siswa ini akan hilang permanen.`
        }
        confirmText={deleteModal.deleting ? "Menghapus..." : "Ya, Hapus Permanen"}
        type="danger"
        isDisabled={deleteModal.deleting}
      />
    </motion.div>
  );
}