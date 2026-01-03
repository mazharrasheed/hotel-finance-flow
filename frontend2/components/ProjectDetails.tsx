
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HotelProject, Transaction, TransactionType, IncomeCategory, ExpenseCategory, UserRole, AppTheme } from '../types';
import { ICONS } from '../constants';

interface Props {
  projects: HotelProject[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  userRole?: UserRole;
  theme: AppTheme;
}

const formatCurrency = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

const ProjectDetails: React.FC<Props> = ({ projects, transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction, userRole, theme }) => {
  const { id } = useParams<{ id: string }>();
  const project = projects.find(p => p.id === id);
  const projectTransactions = transactions
    .filter(t => t.projectId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: TransactionType.INCOME,
    category: IncomeCategory.ROOM_REVENUE,
    amount: 0,
    description: ''
  });

  const summary = projectTransactions.reduce((acc, t) => {
    if (t.type === TransactionType.INCOME) acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  if (!project) return <div className="text-center py-20 text-slate-400">Project not found.</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      onUpdateTransaction(formData as Transaction);
    } else {
      onAddTransaction({ ...formData as Transaction, id: Math.random().toString(36).substr(2, 9), projectId: project.id });
    }
    closeModal();
  };

  const handleEdit = (t: Transaction) => {
    setFormData(t);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setFormData({ date: new Date().toISOString().split('T')[0], type: TransactionType.INCOME, category: IncomeCategory.ROOM_REVENUE, amount: 0, description: '' });
  };

  const isAdmin = userRole === UserRole.ADMIN;

  // Theme based color helpers
  const btnColor = theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                   theme === 'royal' ? 'bg-blue-600 hover:bg-blue-700' :
                   theme === 'gold' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700';
  
  const textTheme = theme === 'emerald' ? 'text-emerald-600' :
                    theme === 'royal' ? 'text-blue-600' :
                    theme === 'gold' ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-6">
        <Link to="/projects" className="bg-white p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{project.name}</h2>
          <p className="text-slate-500 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 font-medium">{project.location}</span>
            <span className="text-slate-300">|</span>
            <span className={`${textTheme} font-bold uppercase tracking-widest text-[10px] bg-slate-50 px-2 py-0.5 rounded-full`}>{project.status}</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden p-1">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Income</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.income)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Expense</p>
          <p className="text-2xl font-bold text-rose-600">{formatCurrency(summary.expense)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Net Cash Flow</p>
          <p className={`text-2xl font-bold ${summary.income - summary.expense >= 0 ? textTheme : 'text-rose-600'}`}>
            {formatCurrency(summary.income - summary.expense)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-lg font-bold text-slate-800">Operational Logs</h3>
          <button onClick={() => setIsModalOpen(true)} className={`${btnColor} text-white px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all active:scale-95`}>
            <ICONS.Add /> Log Movement
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
                {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectTransactions.length > 0 ? projectTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{t.description}</td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(t)} className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"><ICONS.Edit /></button>
                        <button onClick={() => onDeleteTransaction(t.id)} className="p-1.5 bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors"><ICONS.Delete /></button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No movement recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
            <div className={`p-8 ${btnColor} text-white`}>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">{editMode ? 'Edit Record' : 'Log Movement'}</h3>
                <button onClick={closeModal} className="bg-white/20 p-1.5 rounded-xl hover:bg-white/30">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Flow Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType, category: e.target.value === TransactionType.INCOME ? IncomeCategory.ROOM_REVENUE : ExpenseCategory.PAYROLL})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm bg-white">
                    <option value={TransactionType.INCOME}>Revenue (+)</option>
                    <option value={TransactionType.EXPENSE}>Expense (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Posting Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ledger Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm bg-white">
                  {formData.type === TransactionType.INCOME 
                    ? Object.values(IncomeCategory).map(c => <option key={c} value={c}>{c}</option>)
                    : Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Monetary Value (PKR)</label>
                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Internal Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm h-24" placeholder="Add specific details about this flow..."></textarea>
              </div>
              <button type="submit" className={`w-full ${btnColor} text-white font-black py-4 rounded-[1.5rem] transition-all shadow-xl active:scale-95 mt-4`}>
                {editMode ? 'Update Transaction' : 'Post Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
