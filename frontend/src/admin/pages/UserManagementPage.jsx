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

  const styles = `
    .page-container { padding: 40px; max-width: 1400px; margin: 0 auto; animation: fadeIn 0.5s; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 20px; }
    .action-group { display: flex; gap: 12px; }

    .control-panel { 
      background: white; padding: 20px; border-radius: 20px; 
      border: 1px solid #f1f5f9; display: flex; gap: 16px; 
      align-items: center; margin-bottom: 30px; flex-wrap: wrap;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }

    .search-wrapper { position: relative; flex: 1; min-width: 300px; }
    .search-input { 
      width: 100%; padding: 12px 15px 12px 45px; border: 1.5px solid #e2e8f0; 
      border-radius: 14px; font-size: 15px; transition: 0.2s;
    }
    .search-input:focus { outline: none; border-color: #0ea5e9; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
    
    .btn-secondary-saka {
      padding: 12px; border-radius: 14px; border: 1px solid #e2e8f0; 
      background: white; color: #64748b; cursor: pointer; transition: 0.2s;
      display: flex; align-items: center; gap: 8px; font-weight: 600;
    }
    .btn-secondary-saka:hover { border-color: #cbd5e1; background: #f8fafc; color: #0f172a; }

    .btn-primary-saka {
      padding: 12px 24px; border-radius: 14px; background: #0f172a; 
      color: white; border: none; font-weight: 700; cursor: pointer; 
      display: flex; align-items: center; gap: 10px; transition: 0.2s;
    }
    .btn-primary-saka:hover { background: #1e293b; transform: translateY(-2px); }

    .table-responsive-wrapper {
      width: 100%; overflow-x: auto; border-radius: 20px;
      border: 1px solid #f1f5f9; background: white;
    }

    .badge-count {
      padding: 6px 14px; background: #f0fdf4; border: 1px solid #dcfce7;
      color: #16a34a; border-radius: 100px; font-weight: 700; font-size: 13px;
    }

    @media (max-width: 768px) {
      .page-container { padding: 20px; }
      .header-section { flex-direction: column; align-items: stretch; text-align: center; }
      .action-group { flex-direction: column; }
      .control-panel { flex-direction: column; align-items: stretch; }
      .search-wrapper { min-width: 100%; }
    }
  `;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Loader2 className="animate-spin text-sky-500" size={40} />
    </div>
  );

  return (
    <div className="page-container">
      <style>{styles}</style>
      
      <div className="header-section">
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>
            User Management
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Kelola data siswa dan administrator SAKA</p>
        </div>
        
        <div className="action-group">
          <button className="btn-secondary-saka" onClick={downloadTemplate} title="Download Template Excel">
            <Download size={18} /> Template
          </button>
          <label className="btn-secondary-saka" style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0ea5e9' }}>
            <Upload size={18} /> {importing ? 'Importing...' : 'Import Excel'}
            <input type="file" style={{ display: 'none' }} onChange={handleImportExcel} accept=".xlsx" />
          </label>
          <button className="btn-primary-saka" onClick={() => navigate('/admin/users/new')}>
            <UserPlus size={20} /> Add User
          </button>
        </div>
      </div>

      <div className="control-panel">
        <div className="search-wrapper">
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Cari username..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Filter size={18} style={{ color: '#94a3b8' }} />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '12px 16px', border: '1.5px solid #e2e8f0',
              borderRadius: '14px', fontSize: '14px', fontWeight: '600',
              backgroundColor: 'white', color: '#475569', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="all">Semua Role</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {(search || filterRole !== 'all') && (
          <button
            onClick={() => { setSearch(''); setFilterRole('all'); }}
            style={{ 
              background: 'none', border: 'none', color: '#ef4444', 
              fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <XCircle size={16} /> Reset
          </button>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <span className="badge-count">
            {filteredUsers.length} Users Total
          </span>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', color: '#94a3b8',
          background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9'
        }}>
          <UsersIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <h3 style={{ color: '#0f172a', margin: 0 }}>Tidak ada user ditemukan</h3>
          <p style={{ marginTop: '8px' }}>Coba sesuaikan kata kunci atau filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <UsersTable users={filteredUsers} onDelete={handleDelete} />
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
    </div>
  );
}