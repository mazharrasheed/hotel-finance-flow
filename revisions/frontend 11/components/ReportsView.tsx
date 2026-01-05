
import React, { useState, useMemo } from 'react';
import { Transaction, Project } from '../types';
import { Printer, FileText, TrendingUp, TrendingDown, Hotel, Search, Filter, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ReportsViewProps {
  transactions: Transaction[];
  projects: Project[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, projects }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (selectedProjectId !== 'all') {
      list = list.filter(t => t.project === selectedProjectId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.note.toLowerCase().includes(q) || 
        format(parseISO(t.date), 'MMM dd, yyyy').toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedProjectId, searchQuery]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20 print:pb-0 print:pt-0 print:m-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Financial Audit Reports</h2>
          <p className="text-slate-400 font-medium">A complete ledger of all project transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95 no-print"
          >
            <Printer size={18} />
            Print Ledger
          </button>
        </div>
      </header>

      {/* Audit Filters - Only visible on screen */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 print:hidden">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search notes or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all font-medium text-slate-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="md:w-64 relative group">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Summary Header (Compact for space) */}
      <div className="hidden print:block mb-2 border-b-2 border-slate-800 pb-1">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-indigo-700 font-black text-base">
             <Hotel size={18} />
             FinanceFlow Audit Record {selectedProjectId !== 'all' ? ` - ${projects.find(p => p.id === selectedProjectId)?.name}` : ''}
           </div>
           <div className="text-right">
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Financial Ledger</p>
             <p className="text-[7px] text-slate-400 font-medium leading-none">Date: {format(new Date(), 'MMM dd, yyyy')}</p>
           </div>
        </div>
        <div className="flex gap-6 mt-1">
           <div>
             <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest mr-2">Total In:</span>
             <span className="text-xs font-black text-emerald-600">PKR {stats.income.toLocaleString()}</span>
           </div>
           <div>
             <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest mr-2">Total Out:</span>
             <span className="text-xs font-black text-rose-600">PKR {stats.expense.toLocaleString()}</span>
           </div>
           <div>
             <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest mr-2">Net:</span>
             <span className={`text-xs font-black ${stats.net >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
               PKR {stats.net.toLocaleString()}
             </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-1">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
          <p className="text-2xl font-black text-emerald-600">PKR {stats.income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-1">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingDown size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operating Costs</p>
          <p className="text-2xl font-black text-rose-600">PKR {stats.expense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-1">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Balance</p>
          <p className={`text-2xl font-black ${stats.net >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            PKR {stats.net.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden print:border-slate-800 print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-100 print:border-slate-800">
                <th className="px-6 py-4 print:px-2 print:py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Date</th>
                <th className="px-6 py-4 print:px-2 print:py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Project</th>
                <th className="px-6 py-4 print:px-2 print:py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Type</th>
                <th className="px-6 py-4 print:px-2 print:py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Note</th>
                <th className="px-6 py-4 print:px-2 print:py-1 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching records</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => {
                  const project = projects.find(p => p.id === t.project);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 print:px-2 print:py-1 whitespace-nowrap">
                        <span className="text-sm print:text-[8px] font-bold text-slate-700">{format(parseISO(t.date), 'MMM dd, yyyy')}</span>
                      </td>
                      <td className="px-6 py-4 print:px-2 print:py-1 whitespace-nowrap">
                        <span className="text-sm print:text-[8px] font-bold text-slate-700">{project?.name || 'Archived'}</span>
                      </td>
                      <td className="px-6 py-4 print:px-2 print:py-1 whitespace-nowrap uppercase tracking-tighter">
                        <span className={`text-[10px] print:text-[7px] font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 print:px-2 print:py-1">
                        <span className="text-sm print:text-[8px] font-medium text-slate-500 italic block">
                          {t.note || '-'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 print:px-2 print:py-1 text-right whitespace-nowrap text-sm print:text-[8px] font-black ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                         {t.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredTransactions.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-100 print:bg-white print:border-slate-800">
                <tr>
                  <td colSpan={4} className="px-6 py-4 print:px-2 print:py-1 text-right">
                    <span className="text-xs print:text-[8px] font-black text-slate-400 uppercase tracking-widest">Filtered Position:</span>
                  </td>
                  <td className={`px-6 py-4 print:px-2 print:py-1 text-right text-lg print:text-sm font-black ${
                    stats.net >= 0 ? 'text-indigo-600' : 'text-rose-600'
                  }`}>
                    PKR {stats.net.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
