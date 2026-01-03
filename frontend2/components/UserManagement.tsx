
import React, { useState } from 'react';
import { User, UserRole, AppTheme } from '../types';
import { ICONS } from '../constants';

interface Props {
  users: User[];
  onAddUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  // Added theme prop to fix TypeScript error
  theme: AppTheme;
}

const UserManagement: React.FC<Props> = ({ users, onAddUser, onDeleteUser, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.VIEWER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    onAddUser({
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername,
      role: newRole,
      createdAt: new Date().toISOString()
    });
    setNewUsername('');
    setShowModal(false);
  };

  const btnColor = theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                   theme === 'royal' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                   theme === 'gold' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';

  const ringColor = theme === 'emerald' ? 'focus:ring-emerald-500' :
                    theme === 'royal' ? 'focus:ring-blue-500' :
                    theme === 'gold' ? 'focus:ring-amber-500' : 'focus:ring-rose-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Staff & Access</h2>
          <p className="text-slate-500">Manage user permissions and platform access.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className={`${btnColor} text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95`}
        >
          <ICONS.Add />
          Create Account
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase">{u.username[0]}</div>
                    <span className="font-semibold text-slate-800">{u.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onDeleteUser(u.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <ICONS.Delete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">New Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input required type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className={`w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ${ringColor} outline-none`} placeholder="j.doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role & Permissions</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className={`w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 ${ringColor} outline-none`}>
                  <option value={UserRole.VIEWER}>Viewer (Read Only)</option>
                  <option value={UserRole.ADMIN}>Administrator (Full Access)</option>
                </select>
                <p className="mt-2 text-[10px] text-slate-400 leading-tight">Note: Default password is 'password123'. Users can change it after login.</p>
              </div>
              <button type="submit" className={`w-full ${btnColor} text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 mt-4`}>
                Grant Access
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
