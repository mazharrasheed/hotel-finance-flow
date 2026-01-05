
import React, { useState } from 'react';
import { User, Lock, Loader2, LayoutDashboard, AlertCircle, Hotel, Building2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login: authLogin } = useAuth();
  // Pre-filled with common dev credentials as requested: admin / admin
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const data = await authService.login(username, password);
      if (data && data.token) {
        await authLogin(data.token);
      } else {
        throw new Error('Authentication failed: No token received');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
      <div className="absolute -bottom-20 -left-20 opacity-[0.05] text-indigo-900 pointer-events-none -rotate-12">
        <Hotel size={500} strokeWidth={1} />
      </div>
      <div className="absolute -top-20 -right-20 opacity-[0.03] text-indigo-900 pointer-events-none rotate-12">
        <Building2 size={450} strokeWidth={1} />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl text-white mb-4">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FinanceFlow</h1>
          <p className="text-slate-400 text-sm mt-1">Project Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Username</label>
            <div className="relative mt-1">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 transition-all font-medium disabled:opacity-50"
                placeholder="Username"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 transition-all font-medium disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            disabled={isLoading} 
            type="submit"
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
