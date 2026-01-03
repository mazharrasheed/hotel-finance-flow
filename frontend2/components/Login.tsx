
import React, { useState } from 'react';
import { User, AppTheme } from '../types';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
  theme: AppTheme;
}

const Login: React.FC<Props> = ({ onLogin, users, theme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const themeColors = {
    emerald: 'bg-emerald-600 shadow-emerald-100',
    royal: 'bg-blue-600 shadow-blue-100',
    gold: 'bg-amber-600 shadow-amber-100',
    midnight: 'bg-rose-600 shadow-rose-100',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const match = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (match && (match.password === password || (!match.password && password === 'password123'))) {
        onLogin({ ...match, token: 'mock_jwt_token_' + Math.random().toString(36).substr(7) });
      } else {
        setError('Unauthorized access. Please verify credentials.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden px-4">
      {/* Background Decor */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${theme === 'emerald' ? 'bg-emerald-200' : theme === 'royal' ? 'bg-blue-200' : theme === 'gold' ? 'bg-amber-200' : 'bg-rose-200'} rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 opacity-20`}></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 opacity-20"></div>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-white relative z-10">
        <div className="text-center mb-10">
          <div className={`inline-block ${themeColors[theme]} p-5 rounded-[2rem] mb-4 shadow-xl`}>
            <span className="text-4xl">🏨</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">HotelFlow</h2>
          <p className="text-slate-500 font-bold text-sm tracking-wide">Enterprise Portfolio Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Username</label>
            <input required type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Access Password</label>
            <input required type="password" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          
          {error && <p className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-bounce">{error}</p>}

          <button type="submit" disabled={loading} className={`w-full ${theme === 'emerald' ? 'bg-slate-900 hover:bg-black' : theme === 'royal' ? 'bg-blue-700 hover:bg-blue-800' : theme === 'gold' ? 'bg-amber-700 hover:bg-amber-800' : 'bg-rose-700 hover:bg-rose-800'} text-white font-black py-5 rounded-[2rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Validating...</span>
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 p-5 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Default Credentials</p>
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span>User: <span className="text-slate-900">admin</span></span>
            <span>Pass: <span className="text-slate-900">password123</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
