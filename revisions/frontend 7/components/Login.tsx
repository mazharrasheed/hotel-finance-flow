
import React, { useState, useEffect } from 'react';
import { Hotel, Mail, Lock, Loader2, ArrowRight, ShieldCheck, AlertCircle, Info, ConciergeBell, Bed, Utensils, Key } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  email: 'admin@hotel.com',
  password: 'admin123',
  name: 'Project Manager',
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

  // Initialize DB and Check Demo Status
  useEffect(() => {
    const hidden = localStorage.getItem('finance_demo_hidden');
    // Only hide if explicitly set to true by a successful previous login
    setIsDemoHidden(hidden === 'true');
    
    // Ensure admin is in DB
    getOrInitializeDB();
  }, []);

  const getOrInitializeDB = (): User[] => {
    const dbStr = localStorage.getItem('finance_users_db');
    let db: User[] = [];
    
    try {
      if (!dbStr || dbStr === '[]' || dbStr === '{}') {
        db = [DEFAULT_ADMIN];
        localStorage.setItem('finance_users_db', JSON.stringify(db));
      } else {
        db = JSON.parse(dbStr);
        // If for some reason admin is missing, add it back
        if (!db.find(u => u.email === DEFAULT_ADMIN.email)) {
          db.push(DEFAULT_ADMIN);
          localStorage.setItem('finance_users_db', JSON.stringify(db));
        }
      }
    } catch (e) {
      console.error("DB Initialization error, resetting...");
      db = [DEFAULT_ADMIN];
      localStorage.setItem('finance_users_db', JSON.stringify(db));
    }
    return db;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Small delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      const db = getOrInitializeDB();
      
      const foundUser = db.find(u => 
        u.email.toLowerCase().trim() === email.toLowerCase().trim() && 
        u.password === password
      );
      
      if (foundUser) {
        localStorage.setItem('finance_active_user', JSON.stringify(foundUser));
        localStorage.setItem('finance_demo_hidden', 'true');
        onLogin(foundUser);
      } else {
        setError('Invalid credentials. Please use the manager keys provided below.');
      }
    } catch (err) {
      setError('System sync failure. Please refresh the browser.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 min-h-screen relative overflow-hidden">
      {/* Background Floating Icons */}
      <div className="absolute top-10 left-10 text-indigo-100 -rotate-12 animate-pulse print:hidden"><ConciergeBell size={80} /></div>
      <div className="absolute bottom-20 right-10 text-indigo-100 rotate-12 animate-bounce duration-1000 print:hidden"><Key size={60} /></div>
      <div className="absolute top-1/2 right-20 text-indigo-100/50 -translate-y-1/2 print:hidden"><Bed size={120} /></div>
      <div className="absolute bottom-10 left-1/4 text-indigo-100/50 print:hidden"><Utensils size={40} /></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200 p-8 md:p-12 border border-slate-100 relative z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-700 rounded-2xl text-white mb-6 shadow-xl shadow-indigo-100 transition-transform hover:scale-105 duration-300">
            <Hotel size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">FinanceFlow</h1>
          <p className="text-slate-400 mt-2 font-medium italic uppercase tracking-widest text-[10px]">Project Management Portal</p>
        </div>

        {!isDemoHidden && (
          <div className="mb-8 p-5 bg-indigo-50 rounded-[1.5rem] border border-indigo-100 flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 text-indigo-700">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Initial Admin Access</span>
            </div>
            <div className="space-y-1 bg-white/50 p-3 rounded-xl border border-indigo-50">
              <div className="flex justify-between items-center text-xs font-bold text-indigo-800">
                <span className="opacity-60">Email:</span>
                <span className="select-all">admin@hotel.com</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-indigo-800 mt-1">
                <span className="opacity-60">Pass:</span>
                <span className="select-all">admin123</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manager Email</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Mail size={18} />
              </span>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@hotel.com" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-700 font-bold" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-700 font-bold" 
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-start gap-3 animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            disabled={isLoading} 
            type="submit" 
            className="w-full py-5 bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                Enter Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
