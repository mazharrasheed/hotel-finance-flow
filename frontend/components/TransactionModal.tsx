
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { X, Banknote, FileText, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionModalProps {
  type: TransactionType;
  date: string;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'project'>) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ type, date, onClose, onSubmit }) => {
  const [currentType, setCurrentType] = useState<TransactionType>(type);
  const [selectedDate, setSelectedDate] = useState<string>(date);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onSubmit({
        type: currentType,
        amount: parseFloat(amount),
        note,
        date: selectedDate,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-black tracking-tight ${currentType === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
              Add {currentType === 'income' ? 'Income' : 'Expense'}
            </h3>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Record Entry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setCurrentType('income')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              currentType === 'income' 
                ? 'bg-white text-emerald-600 shadow-sm scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <TrendingUp size={16} />
            Income
          </button>
          <button
            type="button"
            onClick={() => setCurrentType('expense')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              currentType === 'expense' 
                ? 'bg-white text-rose-600 shadow-sm scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <TrendingDown size={16} />
            Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Transaction Date</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                <CalendarIcon size={20} />
              </span>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 bg-slate-50/50 outline-none transition-all font-bold text-slate-700 focus:border-indigo-500 focus:bg-white border-transparent"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount (PKR)</label>
            <div className="relative">
              <span className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${currentType === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                <Banknote size={24} />
              </span>
              <input
                autoFocus
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-14 pr-6 py-5 rounded-2xl border-2 bg-slate-50/50 outline-none transition-all text-3xl font-black text-slate-800 placeholder:text-slate-200 ${
                  currentType === 'income' ? 'focus:border-emerald-500 focus:bg-white' : 'focus:border-rose-500 focus:bg-white'
                } border-transparent`}
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reference Note</label>
            <div className="relative">
              <span className="absolute left-5 top-5 text-slate-300">
                <FileText size={20} />
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this entry for?"
                className={`w-full pl-14 pr-6 py-5 rounded-2xl border-2 bg-slate-50/50 outline-none transition-all h-28 resize-none text-slate-700 font-medium ${
                  currentType === 'income' ? 'focus:border-emerald-500 focus:bg-white' : 'focus:border-rose-500 focus:bg-white'
                } border-transparent`}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-[0.98] ${
              currentType === 'income' 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200/50' 
                : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200/50'
            }`}
          >
            Commit Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
