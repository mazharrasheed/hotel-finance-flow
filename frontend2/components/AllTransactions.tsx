
import React, { useState } from 'react';
import { Transaction, HotelProject, UserRole, TransactionType, AppTheme } from '../types';
import { ICONS } from '../constants';

interface Props {
  projects: HotelProject[];
  transactions: Transaction[];
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  userRole?: UserRole;
  onBackup: () => void;
  // Added theme prop to fix TypeScript error
  theme: AppTheme;
}

const formatCurrency = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

const AllTransactions: React.FC<Props> = ({ projects, transactions, onUpdateTransaction, onDeleteTransaction, userRole, onBackup, theme }) => {
  const [filter, setFilter] = useState('');
  const isAdmin = userRole === UserRole.ADMIN;

  const enrichedTransactions = transactions.map(t => ({
    ...t,
    projectName: projects.find(p => p.id === t.projectId)?.name || 'Unknown'
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = enrichedTransactions.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase()) ||
    t.projectName.toLowerCase().includes(filter.toLowerCase()) ||
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const btnColor = theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                   theme === 'royal' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                   theme === 'gold' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';

  const ringColor = theme === 'emerald' ? 'focus:ring-emerald-500' :
                    theme === 'royal' ? 'focus:ring-blue-500' :
                    theme === 'gold' ? 'focus:ring-amber-500' : 'focus:ring-rose-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Global Transaction History</h2>
          <p className="text-slate-500">A consolidated ledger of all financial movements across Pakistani assets.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl text-slate-700 border border-slate-200 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ICONS.Print />
            Print Report
          </button>
          <button 
            onClick={onBackup}
            className={`flex items-center gap-2 ${btnColor} px-5 py-2.5 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95`}
          >
            <ICONS.Download />
            Download Backup
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 print:hidden">
           <div className="relative max-w-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <input 
               type="text"
               placeholder="Search by hotel, category, or note..."
               className={`w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 ${ringColor} outline-none transition-all`}
               value={filter}
               onChange={e => setFilter(e.target.value)}
             />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Hotel Project</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{t.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-bold">{t.projectName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      t.type === TransactionType.INCOME ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{t.description}</td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No transactions found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center border-t border-slate-100 print:hidden">
          Showing {filtered.length} of {transactions.length} entries
        </div>
      </div>
    </div>
  );
};

export default AllTransactions;
