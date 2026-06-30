import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, BarChart2, UserRound } from 'lucide-react'; 

export default function UsersTable({ users, onDelete }) {
  const navigate = useNavigate();

  return (
    <table className="w-full text-left whitespace-nowrap border-collapse">
      <thead>
        <tr className="bg-slate-50/80 border-b border-slate-200">
          <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">User Details</th>
          <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
          <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Joined Date</th>
          <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {users.map((user) => (
          <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sky-600 bg-sky-100 shrink-0 shadow-sm">
                  <UserRound size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{user.username}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">ID: {user._id.slice(-6).toUpperCase()}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${
                user.role === 'admin' 
                  ? 'bg-sky-100 text-sky-700 border border-sky-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {user.role}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm font-semibold text-slate-600">
                {new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {user.role === 'student' && (
                  <button 
                    onClick={() => navigate(`/admin/users/${user._id}/scores`)}
                    className="p-2 bg-slate-50 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors border border-slate-200 hover:border-sky-200"
                    title="View Progress"
                  >
                    <BarChart2 size={18} />
                  </button>
                )}
                <button 
                  onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                  className="p-2 bg-slate-50 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors border border-slate-200 hover:border-sky-200"
                  title="Edit User"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => onDelete(user)}
                  className="p-2 bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-200"
                  title="Delete User"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}