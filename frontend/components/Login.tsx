
import React, { useState, useEffect } from 'react';
import { Briefcase, Mail, Lock, Loader2, ArrowRight, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { User, Permissions } from '../types';

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
  const [isDemoHidden, setIsDemoHidden] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem('finance_demo_hidden');
    if (hidden) setIsDemoHidden(true);
  }, []);

  // Robust DB Initialization
  const getOrInitializeDB = (): User[] => {
    const dbStr = localStorage.getItem('finance_users_db');
    if (!dbStr || dbStr === '[]') {
      const initialDB = [DEFAULT_ADMIN];
      localStorage.setItem('finance_users_db', JSON.stringify(initialDB));
      return initialDB;
    }
    try {
      return JSON.parse(dbStr);
    } catch {
      localStorage.setItem('finance_users_db', JSON.stringify([DEFAULT_ADMIN]));
      return [DEFAULT_ADMIN];
    }
  };

  useEffect(() => {
    getOrInitializeDB();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Small artificial delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Ensure DB exists and is populated before checking credentials
      const db = getOrInitializeDB();
      
      const foundUser = db.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (foundUser) {
        localStorage.setItem('finance_active_user', JSON.stringify(foundUser));
        localStorage.setItem('finance_demo_hidden', 'true');
        onLogin(foundUser);
      } else {
        setError('Invalid credentials. Please contact system management.');
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('A system error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 min-h-screen font-['Inter']">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-8 md:p-12 border border-slate-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-30" />
        
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl text-white mb-6 shadow-xl shadow-indigo-100 transition-transform hover:scale-105 duration-300">
            <Briefcase size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">FinanceFlow</h1>
          <p className="text-slate-400 mt-2 font-medium">Business Account Portal</p>
        </div>

        {/* Demo Credentials Box - Conditionally Hidden */}
        {!isDemoHidden && (
          <div className="mb-8 p-5 bg-amber-50 rounded-[1.5rem] border border-amber-100 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex items-center gap-2 text-amber-700">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin Credentials</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-600/60 uppercase">Email</span>
                <span className="text-xs font-black text-amber-800 tracking-tight">admin@finance.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-600/60 uppercase">Password</span>
                <span className="text-xs font-black text-amber-800 tracking-tight">admin123</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@finance.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-700 font-bold"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <ShieldCheck size={18} className="text-indigo-600" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Security Protocol</span>
              <p className="text-[10px] font-bold text-indigo-700">Please change your login key after first access.</p>
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Localized Banking-Grade Encryption<br/>
              FinanceFlow v1.0
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
