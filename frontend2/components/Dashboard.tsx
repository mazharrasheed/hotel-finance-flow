
import React from 'react';
import { HotelProject, Transaction, TransactionType, AppTheme } from '../types';
import { ICONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface Props {
  projects: HotelProject[];
  transactions: Transaction[];
  onBackup: () => void;
  theme: AppTheme;
}

const formatCurrency = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

const Dashboard: React.FC<Props> = ({ projects, transactions, onBackup, theme }) => {
  const summary = transactions.reduce((acc, t) => {
    if (t.type === TransactionType.INCOME) acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const projectStats = projects.map(p => {
    const pTrans = transactions.filter(t => t.projectId === p.id);
    const pSummary = pTrans.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
    return {
      name: p.name,
      balance: pSummary.income - pSummary.expense,
      income: pSummary.income,
      expense: pSummary.expense
    };
  });

  const categoryStats = transactions.reduce((acc: any, t) => {
    const existing = acc.find((item: any) => item.name === t.category);
    if (existing) existing.value += t.amount;
    else acc.push({ name: t.category, value: t.amount });
    return acc;
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case 'royal': return ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
      case 'gold': return ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'];
      case 'midnight': return ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fff1f2'];
      default: return ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
    }
  };

  const chartColors = getThemeColors();
  const themePrimaryColor = chartColors[0];
  const themeSecondaryColor = chartColors[1];
  
  // Professional colorful palette for Pie Chart
  const piePalette = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  const themePrimaryTextClass = theme === 'royal' ? 'text-blue-600' :
                       theme === 'gold' ? 'text-amber-600' :
                       theme === 'midnight' ? 'text-rose-600' : 'text-emerald-600';

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative min-h-screen pb-20 px-2 overflow-x-hidden">
      <div className="relative z-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Executive Summary</h2>
            <p className="text-slate-500 font-medium">Consolidated financial overview of your hospitality assets.</p>
          </div>
          <button 
            onClick={onBackup}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-white transition-all shadow-sm active:scale-95"
          >
            <ICONS.Download />
            Export Portfolio
          </button>
        </header>

        {/* Semi-transparent Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white/60 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
            <div className="bg-emerald-100/40 p-5 rounded-[2rem] group-hover:scale-110 transition-transform"><ICONS.Income /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Yield</p>
              <p className="text-3xl font-black text-slate-900">{formatCurrency(summary.income)}</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white/60 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
            <div className="bg-rose-100/40 p-5 rounded-[2rem] group-hover:scale-110 transition-transform"><ICONS.Expense /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Cost</p>
              <p className="text-3xl font-black text-slate-900">{formatCurrency(summary.expense)}</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white/60 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
            <div className={`bg-slate-100/40 p-5 rounded-[2rem] group-hover:scale-110 transition-transform ${themePrimaryTextClass}`}>
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Position</p>
              <p className={`text-3xl font-black ${summary.income - summary.expense >= 0 ? themePrimaryTextClass : 'text-rose-600'}`}>
                {formatCurrency(summary.income - summary.expense)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-md p-10 rounded-[3.5rem] shadow-sm border border-white/60">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <span className={`w-1.5 h-8 rounded-full ${themePrimaryColor.replace('#', 'bg-[#') + ']'}`}></span>
              Performance Analytics
            </h3>
            <div className="h-[22rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectStats} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                  />
                  <Bar dataKey="income" fill={themePrimaryColor} radius={[6, 6, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill={theme === 'emerald' ? '#f43f5e' : themeSecondaryColor} radius={[6, 6, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-10 rounded-[3.5rem] shadow-sm border border-white/60">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <span className={`w-1.5 h-8 rounded-full ${themePrimaryColor.replace('#', 'bg-[#') + ']'}`}></span>
              Resource Allocation
            </h3>
            <div className="h-[22rem]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={piePalette[index % piePalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
               {categoryStats.map((item: any, index: number) => (
                 <div key={item.name} className="flex items-center gap-2.5 text-[10px] font-black uppercase text-slate-500 truncate">
                   <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: piePalette[index % piePalette.length] }}></div>
                   <span className="truncate">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
