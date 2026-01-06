
import React, { useState } from 'react';
import { Transaction, User, TransactionType } from '../types';
import { X, Trash2, Check, Banknote, Plus, Edit2, AlertTriangle, Landmark, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

import { useAuth } from '../context/AuthContext';

interface DayDetailModalProps {
  date: string;
  transactions: Transaction[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onAdd: (type: TransactionType, date: string) => void;
  user: User;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ 
  date, 
  transactions, 
  onClose, 
  onUpdate, 
  onDelete,
  onAdd,
  user
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { hasPerm, permissions } = useAuth();

  const canAdd = permissions.canAddTransaction || hasPerm('add_transaction', 'finance');
  const canEdit = permissions.canEditTransaction || hasPerm('change_transaction', 'finance');
  const canDelete = permissions.canDeleteTransaction || hasPerm('delete_transaction', 'finance');

  const startEditing = (t: Transaction) => {
    if (!canEdit) return;
    setEditingId(t.id);
    setEditValues({ amount: t.amount, note: t.note });
  };

  const handleUpdate = (id: string) => {
    onUpdate(id, editValues);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const income = transactions.filter(t => t.type === 'income');
  const expense = transactions.filter(t => t.type === 'expense');
  const investment = transactions.filter(t => t.type === 'investment');
  const general = transactions.filter(t => t.type === 'general');
  
  const incomeTotal = income.reduce((s, t) => s + t.amount, 0);
  const expenseTotal = expense.reduce((s, t) => s + t.amount, 0);
  const investmentTotal = investment.reduce((s, t) => s + t.amount, 0);
  const generalTotal = general.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100 relative">

        {confirmDeleteId && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm rounded-[3rem] animate-in fade-in duration-200">
            <div className="bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Discard Entry?</h3>
              <p className="text-sm font-medium text-slate-500 mb-8">Permanently remove this financial record.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all">Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        <header className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{format(new Date(date), 'MMMM do, yyyy')}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-2 py-1 rounded-md">
                Inv: {investmentTotal.toLocaleString()}
              </span>
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                Gen: {generalTotal.toLocaleString()}
              </span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
                In: {incomeTotal.toLocaleString()}
              </span>
              <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-md">
                Out: {expenseTotal.toLocaleString()}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {transactions.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4"><Banknote size={32} /></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No entries for this audit date</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {canAdd && (
                  <>
                    <button onClick={() => onAdd('income', date)} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all">Add Income</button>
                    <button onClick={() => onAdd('expense', date)} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all">Add Expense</button>
                    <button onClick={() => onAdd('general', date)} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all">Add General</button>
                    <button onClick={() => onAdd('investment', date)} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all">Add Invest</button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {investment.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Investments</h3>
                    {canAdd && (
                      <button onClick={() => onAdd('investment', date)} className="p-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all"><Plus size={14} /></button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {investment.map(t => (
                      <TransactionRow 
                        key={t.id} t={t} isEditing={editingId === t.id} editValues={editValues} setEditValues={setEditValues}
                        onStartEdit={() => startEditing(t)} onUpdate={() => handleUpdate(t.id)}
                        onDelete={() => setConfirmDeleteId(t.id)} onCancel={() => setEditingId(null)}
                        hasEditPerm={canEdit} hasDeletePerm={canDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {general.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Audit Entries</h3>
                    {canAdd && (
                      <button onClick={() => onAdd('general', date)} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"><Plus size={14} /></button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {general.map(t => (
                      <TransactionRow 
                        key={t.id} t={t} isEditing={editingId === t.id} editValues={editValues} setEditValues={setEditValues}
                        onStartEdit={() => startEditing(t)} onUpdate={() => handleUpdate(t.id)}
                        onDelete={() => setConfirmDeleteId(t.id)} onCancel={() => setEditingId(null)}
                        hasEditPerm={canEdit} hasDeletePerm={canDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Income</h3>
                  {canAdd && (
                    <button onClick={() => onAdd('income', date)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"><Plus size={14} /></button>
                  )}
                </div>
                <div className="space-y-3">
                  {income.map(t => (
                    <TransactionRow 
                      key={t.id} t={t} isEditing={editingId === t.id} editValues={editValues} setEditValues={setEditValues}
                      onStartEdit={() => startEditing(t)} onUpdate={() => handleUpdate(t.id)}
                      onDelete={() => setConfirmDeleteId(t.id)} onCancel={() => setEditingId(null)}
                      hasEditPerm={canEdit} hasDeletePerm={canDelete}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Expenses</h3>
                  {canAdd && (
                    <button onClick={() => onAdd('expense', date)} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"><Plus size={14} /></button>
                  )}
                </div>
                <div className="space-y-3">
                  {expense.map(t => (
                    <TransactionRow 
                      key={t.id} t={t} isEditing={editingId === t.id} editValues={editValues} setEditValues={setEditValues}
                      onStartEdit={() => startEditing(t)} onUpdate={() => handleUpdate(t.id)}
                      onDelete={() => setConfirmDeleteId(t.id)} onCancel={() => setEditingId(null)}
                      hasEditPerm={canEdit} hasDeletePerm={canDelete}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TransactionRow = ({ t, isEditing, editValues, setEditValues, onStartEdit, onUpdate, onDelete, onCancel, hasEditPerm, hasDeletePerm }: any) => {
  const isIncome = t.type === 'income';
  const isInvestment = t.type === 'investment';
  const isGeneral = t.type === 'general';

  const getTypeStyles = () => {
    if (isIncome) return 'bg-emerald-500 shadow-emerald-100';
    if (isInvestment) return 'bg-violet-600 shadow-violet-100';
    if (isGeneral) return 'bg-indigo-600 shadow-indigo-100';
    return 'bg-rose-500 shadow-rose-100';
  };

  if (isEditing) {
    return (
      <div className={`p-4 rounded-[1.5rem] border-2 bg-white animate-in slide-in-from-left-2 duration-150`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input 
            type="number" value={editValues.amount}
            onChange={(e) => setEditValues({...editValues, amount: parseFloat(e.target.value)})}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black outline-none"
            placeholder="Amount"
          />
          <input 
            type="text" value={editValues.note}
            onChange={(e) => setEditValues({...editValues, note: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none"
            placeholder="Context"
          />
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onCancel} className="px-4 py-1.5 text-xs font-black uppercase text-slate-400">Discard</button>
          <button onClick={onUpdate} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase shadow-lg transition-all active:scale-[0.98]">Save Changes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/50 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-1.5 h-10 rounded-full shrink-0 ${getTypeStyles()}`} />
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-slate-800 tracking-tight">PKR {t.amount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight uppercase">{t.note || 'Audit Entry'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {hasEditPerm && (
          <button onClick={onStartEdit} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
        )}
        {hasDeletePerm && (
          <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
        )}
      </div>
    </div>
  );
};

export default DayDetailModal;
