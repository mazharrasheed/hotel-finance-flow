
import React, { useMemo } from 'react';
import { Project, Transaction } from '../types';
import {
  Globe, TrendingUp, LayoutGrid, ChevronRight,
  Sparkles, FolderPlus, BarChart3, ArrowUpRight, ArrowDownRight,
  Target, Info, Hotel, Bed, Utensils, ConciergeBell
} from 'lucide-react';
import { DynamicIcon } from '../App';

interface EmptyStateProps {
  onOpenSidebar: () => void;
  globalBalance: number;
  projectCount: number;
  projects: Project[];
  transactions: Transaction[];
  onSelectProject: (id: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenSidebar,
  globalBalance,
  projectCount,
  projects,
  transactions,
  onSelectProject
}) => {
  // Aggregate data for the chart
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

  // Global aggregate stats
  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions]);

  // Scale for Column Chart
  const chartMax = useMemo(() => {
    const allVals = projectStats.flatMap(s => [s.income, s.expense]);
    const max = Math.max(...allVals, 1000);
    return Math.ceil(max / 1000) * 1000;
  }, [projectStats]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 relative">
      {/* Portfolio Hero */}
      <section className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
        {/* Hotel Watermark */}
        <div className="absolute -top-20 -right-20 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000 pointer-events-none text-white/20">
          <Hotel size={400} />
        </div>
        <div className="absolute -bottom-20 -left-20 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000 pointer-events-none text-white/20">
          <ConciergeBell size={300} />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">
              <Sparkles size={12} className="text-indigo-400" /> Executive Summary
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">
              Portfolio <br /><span className="text-indigo-400">Command Center</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-md leading-relaxed">
              Monitoring <span className="text-white font-bold">{projectCount} hospitality entities</span> with a real-time financial audit across all holdings.
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
            <div className="sm:col-span-2 bg-indigo-600 p-6 rounded-[2rem] shadow-xl shadow-indigo-500/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">Net Portfolio Valuation</p>
              <p className="text-3xl font-black tracking-tighter">PKR {totals.net.toLocaleString()}</p>
              <p className="mt-2 text-[10px] font-bold text-indigo-200">Consolidated balance across all ledgers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Portfolio Performance Analytics (Grid of Column Charts) */}
      {projectStats.length > 0 ? (
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative">
          {/* Subtle Background Watermarks - Increased visibility */}
          <div className="absolute top-1/2 left-1/4 opacity-10 pointer-events-none -translate-y-1/2 text-slate-100">
            <Bed size={350} />
          </div>
          <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none text-slate-100">
            <Utensils size={250} />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Portfolio Performance</h2>
                  <p className="text-slate-400 text-sm font-medium">Side-by-side comparative analysis of project liquidity.</p>
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

            {/* Unified Chart Grid - Minimum 4 columns on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {projectStats.map((stat) => (
                <div
                  key={stat.id}
                  className="group cursor-pointer flex flex-col"
                  onClick={() => onSelectProject(stat.id)}
                >
                  {/* Individual Chart Card */}
                  <div className="relative h-64 w-full bg-white/40 rounded-3xl border border-slate-100 p-6 flex flex-col group-hover:bg-white group-hover:shadow-lg group-hover:border-indigo-100 transition-all duration-300 backdrop-blur-sm">

                    {/* Values Overlay */}
                    <div className="absolute top-4 left-2 flex flex-col gap-0.5 z-10 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black text-emerald-600">IN: {stat.income.toLocaleString()}</span>
                      <span className="text-[9px] font-black text-rose-600">OUT: {stat.expense.toLocaleString()}</span>
                    </div>

                    {/* Vertical Column Area */}
                    <div className="flex-1 flex items-end justify-center gap-4 px-2">
                      {/* Income Column */}
                      <div className="flex-1 max-w-[32px] h-full flex items-end">
                        <div
                          className="relative w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-1000 ease-out shadow-[0_-4px_10px_rgba(16,185,129,0.15)] group-hover:shadow-[0_-6px_15px_rgba(16,185,129,0.3)]"
                          style={{ height: `${Math.max((stat.income / chartMax) * 100, 2)}%` }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {stat.income > 0 ? stat.income.toLocaleString() : ''}
                          </div>
                        </div>
                      </div>

                      {/* Expense Column */}
                      <div className="flex-1 max-w-[32px] h-full flex items-end">
                        <div
                          className="relative w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-lg transition-all duration-1000 ease-out shadow-[0_-4px_10px_rgba(244,63,94,0.15)] group-hover:shadow-[0_-6px_15px_rgba(244,63,94,0.3)]"
                          style={{ height: `${Math.max((stat.expense / chartMax) * 100, 2)}%` }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {stat.expense > 0 ? stat.expense.toLocaleString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Icon & Net Badge */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: stat.color }}
                      >
                        <DynamicIcon name={stat.icon || 'Briefcase'} size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Project Footer Details */}
                  <div className="mt-8 text-center px-2">
                    <h4 className="font-black text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                      {stat.name}
                    </h4>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${stat.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stat.net >= 0 ? '+' : ''}PKR {stat.net.toLocaleString()} Net
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scale Legend */}
            <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between text-slate-400 gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Info size={14} /> Global Scaling Unit: PKR {chartMax.toLocaleString()}
              </div>
              <p className="text-[10px] font-bold italic">
                Hotel portfolio metrics are relative to the highest transaction recorded.
              </p>
            </div>
          </div>
        </section>
      ) : (
        /* Empty State Placeholder when no projects exist */
        <div className="bg-white/50 border-4 border-dashed border-slate-200 rounded-[3.5rem] p-24 text-center flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none text-slate-300">
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
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
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
