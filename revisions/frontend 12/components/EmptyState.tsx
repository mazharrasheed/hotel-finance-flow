
import React, { useMemo } from 'react';
import { Project, Transaction, AppTheme } from '../types';
import { 
  Globe, TrendingUp, Sparkles, FolderPlus, BarChart3, 
  ArrowUpRight, ArrowDownRight, Info, Hotel, Bed, Utensils, ConciergeBell,
  Building2, Key, Map as MapIcon, Coffee, Waves
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DynamicIcon } from '../App';

interface EmptyStateProps {
  onOpenSidebar: () => void;
  globalBalance: number;
  projectCount: number;
  projects: Project[];
  transactions: Transaction[];
  onSelectProject: (id: string) => void;
  theme?: AppTheme;
}

const formatCurrency = (val: number) => `Rs. ${val.toLocaleString()}`;

const EmptyState: React.FC<EmptyStateProps> = ({ 
  onOpenSidebar, 
  globalBalance, 
  projectCount, 
  projects, 
  transactions,
  onSelectProject,
  theme = 'indigo'
}) => {
  const projectStats = useMemo(() => {
    return projects.map(project => {
      const pTransactions = transactions.filter(t => t.project === project.id);
      const income = pTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = pTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        id: project.id,
        name: project.name,
        color: project.color,
        icon: project.icon,
        income,
        expense,
        net: income - expense
      };
    });
  }, [projects, transactions]);

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions]);

  // Distinct colors for graph to avoid confusion
  const colors = {
    income: '#10b981', // Emerald 500
    expense: '#f43f5e'  // Rose 500
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 relative">
      {/* Portfolio Hero - Portfolio Command Center */}
      <section className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
        {/* Thematic Watermarks for Hero */}
        <div className="absolute -top-20 -right-20 p-10 opacity-[0.07] group-hover:scale-110 transition-transform duration-1000 pointer-events-none text-white">
          <Hotel size={450} />
        </div>
        <div className="absolute -bottom-24 -left-20 p-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 pointer-events-none text-white">
          <Building2 size={350} />
        </div>
        <div className="absolute top-1/2 left-1/3 opacity-[0.03] pointer-events-none text-white">
          <Key size={200} className="rotate-45" />
        </div>
        <div className="absolute top-1/4 right-1/4 opacity-[0.02] pointer-events-none text-white">
          <MapIcon size={180} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">
              <Sparkles size={12} className="text-[var(--secondary)]" /> Executive Summary
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">
              Portfolio <br /><span className="text-[var(--secondary)]">Command Center</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-md leading-relaxed">
              Monitoring <span className="text-white font-bold">{projectCount} hospitality entities</span> with a real-time financial audit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Total Inflow</p>
                <p className="text-2xl font-black tracking-tighter">PKR {totals.income.toLocaleString()}</p>
                <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                  <ArrowUpRight size={12} /> Positive Growth
                </div>
             </div>
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Total Outflow</p>
                <p className="text-2xl font-black tracking-tighter">PKR {totals.expense.toLocaleString()}</p>
                <div className="mt-3 flex items-center gap-1.5 text-rose-400 text-[10px] font-bold">
                  <ArrowDownRight size={12} /> Operating Costs
                </div>
             </div>
             <div className="sm:col-span-2 bg-[var(--primary)] p-6 rounded-[2rem] shadow-xl shadow-indigo-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Net Portfolio Valuation</p>
                <p className="text-3xl font-black tracking-tighter">PKR {totals.net.toLocaleString()}</p>
                <p className="mt-2 text-[10px] font-bold text-white/50">Consolidated balance across all ledgers</p>
             </div>
          </div>
        </div>
      </section>

      {/* Unified Portfolio Performance Analytics (Recharts Implementation) */}
      {projectStats.length > 0 ? (
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative">
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[var(--primary-light)] text-[var(--primary)] rounded-[1.5rem] flex items-center justify-center">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Portfolio Performance</h2>
                  <p className="text-slate-400 text-sm font-medium">Comparative analysis of income and expenses per project.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expense</span>
                </div>
              </div>
            </div>

            {/* Recharts BarChart Container */}
            <div className="flex-1 min-h-[350px] relative">
              {/* Refined Small Overlaid Watermarks (Specifically over the graph) */}
              <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden">
                <div className="absolute top-[10%] left-[15%] opacity-[0.12] text-[var(--primary)] -rotate-12">
                  <Hotel size={40} />
                </div>
                <div className="absolute top-[35%] right-[20%] opacity-[0.12] text-rose-500 rotate-12">
                  <ConciergeBell size={32} />
                </div>
                <div className="absolute bottom-[25%] left-[30%] opacity-[0.12] text-emerald-500 -rotate-6">
                  <Utensils size={36} />
                </div>
                <div className="absolute top-[25%] right-[45%] opacity-[0.1] text-amber-500 rotate-45">
                  <Bed size={28} />
                </div>
                <div className="absolute bottom-[45%] right-[10%] opacity-[0.1] text-[var(--primary)]">
                  <Waves size={48} />
                </div>
                <div className="absolute bottom-[15%] right-[30%] opacity-[0.12] text-slate-400 -rotate-12">
                  <Coffee size={24} />
                </div>
                
                {/* Compact "AUDIT VERIFIED" Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[3rem] font-black text-slate-400/10 -rotate-12 uppercase tracking-[0.2em] border-2 border-slate-400/5 px-6 py-2 rounded-2xl">Audit</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400} className="relative z-10">
                <BarChart data={projectStats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ dy: 10 }} />
                  <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px', zIndex: 50 }}
                  />
                  <Bar dataKey="income" fill={colors.income} radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="expense" fill={colors.expense} radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between text-slate-400 gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Info size={14} /> Analytics Engine Active
              </div>
              <p className="text-[10px] font-bold italic">
                Performance metrics are live-synced with the Django database.
              </p>
            </div>
          </div>
        </section>
      ) : (
        /* Empty State Placeholder */
        <div className="bg-white/50 border-4 border-dashed border-slate-200 rounded-[3.5rem] p-24 text-center flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] flex items-center justify-center pointer-events-none text-slate-300">
             <Hotel size={300} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-[2.5rem] flex items-center justify-center mb-8">
              <Hotel size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">No Registered Properties</h3>
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed mb-8">
              Begin your management journey by registering your first hotel project in the sidebar menu.
            </p>
            <button 
              onClick={onOpenSidebar}
              className="px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Register First Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
