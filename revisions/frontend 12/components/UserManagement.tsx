
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserPlus, Trash2, Shield, Mail, Key, UserCheck, X, Loader2, AlertCircle, UserCircle, CheckCircle2, Edit3 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_PERMISSIONS = [
  { id: 'add_transaction', label: 'Add Transactions', description: 'Create new income/expense entries' },
  { id: 'change_transaction', label: 'Edit Transactions', description: 'Modify existing financial records' },
  { id: 'delete_transaction', label: 'Delete Transactions', description: 'Remove records from the system' },
  { id: 'view_reports', label: 'View Reports', description: 'Access ledger and financial analysis' },
  { id: 'can_backup', label: 'Take Backups', description: 'Export data to CSV format' },
];

const UserManagement: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    permissions: [] as string[]
  });
  
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormData({ 
      username: '', 
      first_name: '', 
      last_name: '', 
      email: '', 
      password: '', 
      confirm_password: '',
      permissions: [] 
    });
    setEditingUser(null);
    setShowAddForm(false);
    setError(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    // Extract permissions that match our AVAILABLE_PERMISSIONS list
    const currentPerms = user.permissions 
      ? AVAILABLE_PERMISSIONS.filter(p => user.permissions[p.id]).map(p => p.id)
      : [];

    setFormData({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: '', // Keep empty for security
      confirm_password: '',
      permissions: currentPerms
    });
    setShowAddForm(true);
  };

  const togglePermission = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id]
    }));
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Password validation only if provided (mandatory for new users, optional for edits)
    if (!editingUser || formData.password) {
      if (formData.password !== formData.confirm_password) {
        setError("Passwords do not match.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        user_permissions: formData.permissions 
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await apiService.updateUser(editingUser.id, payload);
      } else {
        await apiService.createUser(payload);
      }

      await loadUsers();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save personnel record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string | number) => {
    if (userId === currentAdmin?.id) return alert("Cannot delete your own account.");
    if (!confirm("Terminate access for this personnel?")) return;
    try {
      const res = await fetch(`https://projectsfinanceflow.pythonanywhere.com/api/users/${userId}/`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Token ${localStorage.getItem('ff_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert("Delete failed. You may not have permission to delete users.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Access Control</h2>
          <p className="text-slate-400 font-medium">Manage project personnel and security clearances.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
        >
          <UserPlus size={18} /> Register Personnel
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <UserCheck size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">No registered users found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {users.map(u => (
            <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-6 group hover:border-indigo-100 transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${u.is_staff || u.is_superuser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {u.is_staff || u.is_superuser ? <Shield size={24} /> : <UserCircle size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-800">{u.first_name} {u.last_name || u.username}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Mail size={12} /> {u.email || 'No email'}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">@{u.username}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {u.is_superuser && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Root</span>}
                <button 
                  onClick={() => handleEdit(u)}
                  className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"
                  title="Edit details"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(u.id)} 
                  disabled={u.id === currentAdmin?.id} 
                  className="p-3 text-slate-300 hover:text-rose-600 disabled:opacity-0 transition-colors"
                  title="Remove access"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register/Edit Personnel Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingUser ? 'Edit Personnel' : 'Register Personnel'}
                </h3>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">
                  {editingUser ? `Updating access for @${editingUser.username}` : 'Create System Access'}
                </p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                  <input 
                    required 
                    value={formData.first_name} 
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-sm"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input 
                    value={formData.last_name} 
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      required 
                      value={formData.username} 
                      onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-sm"
                      placeholder="johndoe"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="email"
                      required 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {editingUser ? 'Change Password' : 'Access Password'}
                  </label>
                  <div className="relative">
                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="password"
                      required={!editingUser} 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-sm"
                      placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="password"
                      required={!!formData.password} 
                      value={formData.confirm_password} 
                      onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Logic Assignment */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Clearances</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <div 
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        formData.permissions.includes(perm.id) 
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                        : 'border-slate-50 bg-slate-50/30 grayscale hover:grayscale-0 hover:border-slate-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`text-xs font-black uppercase tracking-tight ${formData.permissions.includes(perm.id) ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {perm.label}
                        </p>
                        <p className="text-[9px] font-medium text-slate-400 truncate mt-0.5">{perm.description}</p>
                      </div>
                      {formData.permissions.includes(perm.id) && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : editingUser ? 'Update Personnel Record' : 'Create Personnel Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
