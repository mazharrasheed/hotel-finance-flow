
import React from 'react';
import { Transaction, Project } from '../types';
import { Printer, FileText, TrendingUp, TrendingDown, Hotel } from 'lucide-react';
import { format } from 'date-fns';

interface ReportsViewProps {
  transactions: Transaction[];
  projects: Project[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, projects }) => {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20 print:pb-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:mb-2 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Financial Audit Reports</h2>
          <p className="text-slate-400 font-medium">A complete ledger of all project transactions.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95 no-print"
        >
          <Printer size={18} />
          Print Ledger
        </button>
      </header>

      {/* Printable Summary Header (Optimized for space) */}
      <div className="hidden print:block mb-4 border-b-2 border-slate-800 pb-2">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-indigo-700 font-black text-xl">
             <Hotel size={22} />
             FinanceFlow Project Tracker
           </div>
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Financial Audit Record</p>
             <p className="text-[9px] text-slate-400 font-medium">Generated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
           </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
           <div>
             <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Gross Revenue</p>
             <p className="text-base font-black text-emerald-600">PKR {totalIncome.toLocaleString()}</p>
           </div>
           <div>
             <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Gross Expenses</p>
             <p className="text-base font-black text-rose-600">PKR {totalExpense.toLocaleString()}</p>
           </div>
           <div>
             <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Net Position</p>
             <p className={`text-base font-black ${totalIncome - totalExpense >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
               PKR {(totalIncome - totalExpense).toLocaleString()}
             </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-1 transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
          <p className="text-2xl font-black text-emerald-600">PKR {totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-1 transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingDown size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operating Costs</p>
          <p className="text-2xl font-black text-rose-600">PKR {totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-1 transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Balance</p>
          <p className={`text-2xl font-black ${totalIncome - totalExpense >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            PKR {(totalIncome - totalExpense).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden ring-1 ring-slate-200/50 print:ring-0 print:border-slate-800 print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-100 print:border-slate-800">
                <th className="px-6 py-4 print:px-2 print:py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Date</th>
                <th className="px-6 py-4 print:px-2 print:py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Project</th>
                <th className="px-6 py-4 print:px-2 print:py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Type</th>
                <th className="px-6 py-4 print:px-2 print:py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Reference / Note</th>
                <th className="px-6 py-4 print:px-2 print:py-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-800">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No transaction records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedTransactions.map(t => {
                  const project = projects.find(p => p.id === t.projectId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">
                        <span className="text-sm print:text-xs font-bold text-slate-700">{format(new Date(t.date), 'MMM dd, yyyy')}</span>
                      </td>
                      <td className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full print:hidden" style={{ backgroundColor: project?.color || '#cbd5e1' }} />
                          <span className="text-sm print:text-xs font-bold text-slate-700">{project?.name || 'Archived'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 print:px-2 print:py-2 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          t.type === 'income' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 print:text-emerald-700' 
                            : 'bg-rose-50 text-rose-600 border border-rose-100 print:text-rose-700'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 print:px-2 print:py-2">
                        <span className="text-sm print:text-xs font-medium text-slate-500 italic truncate max-w-xs block">
                          {t.note || 'No description'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 print:px-2 print:py-2 text-right whitespace-nowrap text-sm print:text-xs font-black ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {sortedTransactions.length > 0 && (
              <tfoot className="bg-slate-50/50 border-t-2 border-slate-100 print:bg-white print:border-slate-800">
                <tr>
                  <td colSpan={4} className="px-6 py-6 print:px-2 print:py-2 text-right">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Audit Balance Total:</span>
                  </td>
                  <td className={`px-6 py-6 print:px-2 print:py-2 text-right text-lg print:text-base font-black ${
                    totalIncome - totalExpense >= 0 ? 'text-indigo-600' : 'text-rose-600'
                  }`}>
                    PKR {(totalIncome - totalExpense).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block mt-10 text-center border-t border-slate-200 pt-4">
        <div className="flex justify-between items-end px-10">
          <div className="text-left">
            <div className="w-40 border-b border-slate-800 mb-2"></div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Audit Officer Signature</p>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-slate-800 mb-2"></div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Manager Verification</p>
          </div>
        </div>
        <p className="mt-6 text-[8px] text-slate-400 font-medium italic">Confidential Project Financial Record - FinanceFlow Systems</p>
      </div>
    </div>
  );
};

export default ReportsView;
