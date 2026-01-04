
import React, { useState } from 'react';
import { Transaction, User } from '../types';
import { X, Trash2, Check, Banknote, Plus, Edit2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface DayDetailModalProps {
  date: string;
  transactions: Transaction[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onAdd: (type: 'income' | 'expense', date: string) => void;
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

  const startEditing = (t: Transaction) => {
    if (!user.permissions.canEditTransaction) return;
    setEditingId(t.id);
    setEditValues({
      amount: t.amount,
      note: t.note
    });
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

  const hasIncome = income.length > 0;
  const hasExpense = expense.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100 relative">
        
        {/* Deletion Confirmation Overlay */}
        {confirmDeleteId && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm rounded-3xl animate-in fade-in duration-200">
            <div className="bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Delete Record?</h3>
              <p className="text-sm font-medium text-slate-500 mb-8">This action is permanent and will affect your project's balance.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Keep It
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all active:scale-95"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{format(new Date(date), 'MMMM do, yyyy')}</h2>
            <div className="flex gap-4 mt-2">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">Income: PKR {income.reduce((s, t) => s + t.amount, 0)}</span>
              <span className="text-xs font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-md">Expense: PKR {expense.reduce((s, t) => s + t.amount, 0)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records for this date</p>
              {user.permissions.canAddTransaction && (
                <div className="mt-6 flex justify-center gap-3">
                  <button 
                    onClick={() => onAdd('income', date)} 
                    className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    Add Income
                  </button>
                  <button 
                    onClick={() => onAdd('expense', date)} 
                    className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm bg-rose-50 text-rose-700 hover:bg-rose-100"
                  >
                    Add Expense
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inbound Revenue</h3>
                  {user.permissions.canAddTransaction && (
                    <button 
                      disabled={hasIncome}
                      onClick={() => onAdd('income', date)} 
                      className={`p-1.5 rounded-lg transition-all shadow-sm ${hasIncome ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      title={hasIncome ? "Income already recorded" : "Add Income"}
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {income.length > 0 ? income.map(t => (
                    <TransactionRow 
                      key={t.id}
                      t={t}
                      isEditing={editingId === t.id}
                      editValues={editValues}
                      setEditValues={setEditValues}
                      onStartEdit={() => startEditing(t)}
                      onUpdate={() => handleUpdate(t.id)}
                      onDelete={() => setConfirmDeleteId(t.id)}
                      onCancel={() => setEditingId(null)}
                      user={user}
                    />
                  )) : (
                    <p className="text-center py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">No income today</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Expenses</h3>
                  {user.permissions.canAddTransaction && (
                    <button 
                      disabled={hasExpense}
                      onClick={() => onAdd('expense', date)} 
                      className={`p-1.5 rounded-lg transition-all shadow-sm ${hasExpense ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                      title={hasExpense ? "Expense already recorded" : "Add Expense"}
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {expense.length > 0 ? expense.map(t => (
                    <TransactionRow 
                      key={t.id}
                      t={t}
                      isEditing={editingId === t.id}
                      editValues={editValues}
                      setEditValues={setEditValues}
                      onStartEdit={() => startEditing(t)}
                      onUpdate={() => handleUpdate(t.id)}
                      onDelete={() => setConfirmDeleteId(t.id)}
                      onCancel={() => setEditingId(null)}
                      user={user}
                    />
                  )) : (
                    <p className="text-center py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">No expenses today</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TransactionRow = ({ t, isEditing, editValues, setEditValues, onStartEdit, onUpdate, onDelete, onCancel, user }: any) => {
  const isIncome = t.type === 'income';

  if (isEditing) {
    return (
      <div className={`p-4 rounded-2xl border-2 ${isIncome ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'} animate-in fade-in slide-in-from-left-2 duration-150`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="number"
              value={editValues.amount}
              onChange={(e) => setEditValues({...editValues, amount: parseFloat(e.target.value)})}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-black focus:ring-2 ring-indigo-500 outline-none"
              placeholder="Amount"
            />
          </div>
          <input 
            type="text"
            value={editValues.note}
            onChange={(e) => setEditValues({...editValues, note: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 ring-indigo-500 outline-none"
            placeholder="Reference Note"
          />
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onCancel} className="px-4 py-1.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors">Discard</button>
          <button onClick={onUpdate} className={`px-5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-md transition-all active:scale-95 ${isIncome ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
            <Check size={14} /> Commit Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all bg-slate-50/30 group`}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-1.5 h-10 rounded-full shrink-0 ${isIncome ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-rose-500 shadow-lg shadow-rose-100'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-800">PKR {t.amount.toLocaleString()}</span>
          </div>
          <p className="text-xs font-bold text-slate-400 truncate mt-0.5 tracking-tight uppercase">{t.note || 'Internal Record'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {user.permissions.canEditTransaction && (
          <button onClick={onStartEdit} className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <Edit2 size={16} />
          </button>
        )}
        {user.permissions.canDeleteTransaction && (
          <button onClick={onDelete} className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-rose-600 transition-all shadow-sm">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DayDetailModal;
