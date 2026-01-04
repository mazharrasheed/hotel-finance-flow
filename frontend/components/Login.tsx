
import React, { useState } from 'react';
import { Mail, Lock, Loader2, LayoutDashboard, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  email: 'admin@finance.com',
  password: 'admin123',
  name: 'System Admin',
  role: 'admin',
  permissions: {
    canViewDashboard: true,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canAddTransaction: true,
    canEditTransaction: true,
    canDeleteTransaction: true,
    canViewReports: true,
    canTakeBackup: true
  }
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (email.toLowerCase() === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        localStorage.setItem('finance_active_user', JSON.stringify(DEFAULT_ADMIN));
        onLogin(DEFAULT_ADMIN);
      } else {
        setError('Invalid credentials. Check admin email and password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl text-white mb-4">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FinanceFlow</h1>
          <p className="text-slate-400 text-sm mt-1">Project Management Portal</p>
        </div>

        <div className="mb-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Demo Access</p>
          <div className="text-xs space-y-1 font-medium text-slate-600">
            <p>Email: <span className="font-bold">admin@finance.com</span></p>
            <p>Password: <span className="font-bold">admin123</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 transition-all font-medium"
                placeholder="admin@finance.com"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            disabled={isLoading} type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
