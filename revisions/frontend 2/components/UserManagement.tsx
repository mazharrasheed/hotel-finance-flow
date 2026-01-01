
import React, { useState, useEffect } from 'react';
import { User, Permissions } from '../types';
import { UserPlus, Trash2, Shield, Mail, Key, UserCheck, X, Check, Loader2 } from 'lucide-react';

interface UserManagementProps {
  activeAdmin: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ activeAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');

  const loadUsers = () => {
    const db = JSON.parse(localStorage.getItem('finance_users_db') || '[]');
    setUsers(db);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const saveToDB = (updatedUsers: User[]) => {
    localStorage.setItem('finance_users_db', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    await new Promise(resolve => setTimeout(resolve, 600));

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: newEmail,
      name: newName,
      password: newPass,
      role: 'user',
      permissions: {
        canViewDashboard: true,
        canCreateProject: true,
        canEditProject: false,
        canDeleteProject: false,
        canAddTransaction: true,
        canEditTransaction: false,
        canDeleteTransaction: false,
        canViewReports: true,
        canTakeBackup: false
      }
    };

    const currentDB = JSON.parse(localStorage.getItem('finance_users_db') || '[]');
    const updatedDB = [...currentDB, newUser];
    saveToDB(updatedDB);
    
    setShowAddForm(false);
    setIsSaving(false);
    setNewEmail(''); setNewName(''); setNewPass('');
  };

  const togglePermission = (userId: string, permission: keyof Permissions) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, permissions: { ...u.permissions, [permission]: !u.permissions[permission] } };
      }
      return u;
    });
    saveToDB(updated);
  };

  const handleDelete = (userId: string) => {
    if (userId === activeAdmin.id) return alert("Security Breach Prevention: Cannot remove active session admin.");
    if (!confirm("Terminate access for this personnel? All active credentials will be revoked.")) return;
    saveToDB(users.filter(u => u.id !== userId));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Access Control</h2>
          <p className="text-slate-400 font-medium">Manage project personnel and security clearances.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <UserPlus size={18} />
          Register Personnel
        </button>
      </header>

      {users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <UserCheck size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">No registered users found in the database.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {users.map(u => (
            <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row lg:items-center gap-6 group hover:border-indigo-100 transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${u.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <UserCheck size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-800 truncate">{u.name}</h3>
                    {u.role === 'admin' && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-indigo-100">Super Admin</span>}
                  </div>
                  <p className="text-xs font-bold text-slate-400 tracking-tight">{u.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2 flex-[2]">
                {(Object.keys(u.permissions) as Array<keyof Permissions>).map(p => (
                  <button
                    key={p}
                    disabled={u.role === 'admin'}
                    onClick={() => togglePermission(u.id, p)}
                    className={`px-2 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-tighter border transition-all ${
                      u.permissions[p] 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    } ${u.role !== 'admin' ? 'hover:scale-105' : ''}`}
                    title={p.replace(/([A-Z])/g, ' $1').trim()}
                  >
                    {p.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
              </div>

              <div className="flex justify-end lg:block">
                <button 
                  onClick={() => handleDelete(u.id)}
                  disabled={u.id === activeAdmin.id}
                  className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Register User</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><UserCheck size={18} /></span>
                  <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold" placeholder="Full Name" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Mail size={18} /></span>
                  <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold" placeholder="email@finance.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Key size={18} /></span>
                  <input type="password" required value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold" placeholder="••••••••" />
                </div>
              </div>
              <button disabled={isSaving} type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : 'Authorize Person'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
