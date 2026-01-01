
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { X, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionModalProps {
  type: TransactionType;
  date: string;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'projectId' | 'date'>) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ type, date, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onSubmit({
        type,
        amount: parseFloat(amount),
        note,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className={`text-2xl font-bold ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
              Add {type === 'income' ? 'Income' : 'Expense'}
            </h3>
            <p className="text-slate-400 text-sm font-medium">{format(new Date(date), 'MMMM do, yyyy')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label className="block text-sm font-bold text-slate-700 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <DollarSign size={20} />
              </span>
              <input
                autoFocus
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all text-2xl font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-bold text-slate-700 mb-2">Note (Optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600">
                <FileText size={20} />
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all h-24 resize-none text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
              type === 'income' 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' 
                : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
            }`}
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
