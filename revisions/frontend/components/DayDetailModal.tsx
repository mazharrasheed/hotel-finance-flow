
import React, { useState } from 'react';
import { Transaction } from '../types';
import { X, Trash2, Check, DollarSign, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface DayDetailModalProps {
  date: string;
  transactions: Transaction[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onAdd: (type: 'income' | 'expense', date: string) => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ 
  date, 
  transactions, 
  onClose, 
  onUpdate, 
  onDelete,
  onAdd
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});

  const startEditing = (t: Transaction) => {
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

  const income = transactions.filter(t => t.type === 'income');
  const expense = transactions.filter(t => t.type === 'expense');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        <header className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{format(new Date(date), 'MMMM do, yyyy')}</h2>
            <div className="flex gap-4 mt-1">
              <span className="text-sm font-semibold text-emerald-600">Total Income: ${income.reduce((s, t) => s + t.amount, 0)}</span>
              <span className="text-sm font-semibold text-rose-600">Total Expense: ${expense.reduce((s, t) => s + t.amount, 0)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 italic">No transactions for this day</p>
              <div className="mt-4 flex justify-center gap-3">
                <button onClick={() => onAdd('income', date)} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm">Add Income</button>
                <button onClick={() => onAdd('expense', date)} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold text-sm">Add Expense</button>
              </div>
            </div>
          ) : (
            <>
              {/* Income List */}
              {income.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Incomes</h3>
                    <button onClick={() => onAdd('income', date)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Plus size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    {income.map(t => (
                      <TransactionRow 
                        key={t.id}
                        t={t}
                        isEditing={editingId === t.id}
                        editValues={editValues}
                        setEditValues={setEditValues}
                        onStartEdit={() => startEditing(t)}
                        onUpdate={() => handleUpdate(t.id)}
                        onDelete={() => onDelete(t.id)}
                        onCancel={() => setEditingId(null)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Expense List */}
              {expense.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expenses</h3>
                    <button onClick={() => onAdd('expense', date)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Plus size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    {expense.map(t => (
                      <TransactionRow 
                        key={t.id}
                        t={t}
                        isEditing={editingId === t.id}
                        editValues={editValues}
                        setEditValues={setEditValues}
                        onStartEdit={() => startEditing(t)}
                        onUpdate={() => handleUpdate(t.id)}
                        onDelete={() => onDelete(t.id)}
                        onCancel={() => setEditingId(null)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TransactionRow = ({ t, isEditing, editValues, setEditValues, onStartEdit, onUpdate, onDelete, onCancel }: any) => {
  const isIncome = t.type === 'income';

  if (isEditing) {
    return (
      <div className={`p-4 rounded-2xl border-2 ${isIncome ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'} animate-in fade-in slide-in-from-left-2 duration-150`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="number"
              value={editValues.amount}
              onChange={(e) => setEditValues({...editValues, amount: parseFloat(e.target.value)})}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 ring-indigo-500 outline-none"
              placeholder="Amount"
            />
          </div>
          <input 
            type="text"
            value={editValues.note}
            onChange={(e) => setEditValues({...editValues, note: e.target.value})}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 ring-indigo-500 outline-none"
            placeholder="Note"
          />
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onCancel} className="px-4 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
          <button onClick={onUpdate} className={`px-4 py-1.5 rounded-xl text-white text-sm font-bold flex items-center gap-1 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            <Check size={16} /> Update
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/30 group`}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-2 h-8 rounded-full shrink-0 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">${t.amount}</span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{t.note || 'No description'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onStartEdit} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={onDelete} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-rose-600 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const Edit2 = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);

export default DayDetailModal;
