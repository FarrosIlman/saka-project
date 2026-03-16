import React from 'react';
import { useNavigate } from 'react-router-dom';
// Ganti UserEdit menjadi UserRound, Pencil, atau Edit
import { Pencil, Trash2, BarChart2, UserRound } from 'lucide-react'; 

export default function UsersTable({ users, onDelete }) {
  const navigate = useNavigate();

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '24px', 
      border: '1px solid #e2e8f0', 
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>USERNAME</th>
            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>ROLE</th>
            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>JOINED</th>
            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '15px' }}>
          {users.map((user) => (
            <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
              <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserRound size={16} className="text-slate-400" />
                {user.username}
              </td>
              <td style={{ padding: '16px 24px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700',
                  background: user.role === 'admin' ? '#f0f9ff' : '#f1f5f9',
                  color: user.role === 'admin' ? '#0ea5e9' : '#475569',
                }}>
                  {user.role.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '16px 24px', color: '#64748b' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {user.role === 'student' && (
                    <button onClick={() => navigate(`/admin/users/${user._id}/scores`)}
                      title="View Scores"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                      <BarChart2 size={18} />
                    </button>
                  )}
                  <button onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                    title="Edit User"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#0ea5e9' }}>
                    {/* Gunakan Pencil di sini */}
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => onDelete(user)}
                    title="Delete User"
                    style={{ background: '#fff1f2', border: '1px solid #ffe4e6', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#e11d48' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}