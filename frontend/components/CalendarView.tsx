
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Project, User } from '../types';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  endOfWeek,
  parseISO,
  isValid
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, BarChart4, Search, X, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { getFinancialInsights } from '../services/geminiService';

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const subMonths = (date: Date, amount: number) => addMonths(date, -amount);
const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const result = new Date(d.setDate(diff));
  result.setHours(0, 0, 0, 0);
  return result;
};

interface CalendarViewProps {
  projectId: string;
  transactions: Transaction[];
  onAddTransaction: (type: 'income' | 'expense', date: string) => void;
  onOpenDayDetail: (date: string) => void;
  onDeleteTransaction: (id: string) => void;
  activeProject: Project;
  user: User;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  projectId, 
  transactions, 
  onAddTransaction, 
  onOpenDayDetail,
  onDeleteTransaction,
  activeProject,
  user
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const generateInsight = async () => {
    setIsLoadingInsight(true);
    const text = await getFinancialInsights(activeProject, transactions);
    setInsight(text || null);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    setInsight(null);
  }, [projectId, currentMonth]);

  const statsByDate = useMemo(() => {
    const stats: Record<string, { income: number; expense: number; transactions: Transaction[] }> = {};
    
    transactions.forEach(t => {
      const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
      if (!stats[dateKey]) {
        stats[dateKey] = { income: 0, expense: 0, transactions: [] };
      }
      if (t.type === 'income') stats[dateKey].income += t.amount;
      else stats[dateKey].expense += t.amount;
      stats[dateKey].transactions.push(t);
    });
    
    return stats;
  }, [transactions]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    return transactions.filter(t => {
      const tDate = parseISO(t.date);
      if (!isValid(tDate)) return false;

      const noteMatch = t.note.toLowerCase().includes(query);
      const isoMatch = format(tDate, 'yyyy-MM-dd').includes(query);
      const longDateMatch = format(tDate, 'MMMM dd, yyyy').toLowerCase().includes(query);
      const shortDateMatch = format(tDate, 'MMM dd, yyyy').toLowerCase().includes(query);
      const dayMatch = format(tDate, 'dd').includes(query);
      
      return noteMatch || isoMatch || longDateMatch || shortDateMatch || dayMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery]);

  return (
    <div className="flex flex-col w-full overflow-hidden print:hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 shrink-0">
            {format(currentMonth, 'MMM yyyy')}
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 md:p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 md:p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-2 shrink-0"
          >
            Today
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search date (e.g. Oct 15) or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {user.permissions.canViewReports && (
            <button 
              onClick={generateInsight}
              disabled={isLoadingInsight || transactions.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-all disabled:opacity-50 text-xs md:text-sm"
            >
              <BarChart4 size={16} className={isLoadingInsight ? 'animate-pulse' : ''} />
              {isLoadingInsight ? 'Processing...' : 'Budget Analysis'}
            </button>
          )}
        </div>
      </div>

      {insight && (
        <div className="mx-4 md:mx-6 mt-4 p-4 bg-indigo-600 text-white rounded-2xl flex items-start gap-4 animate-in slide-in-from-top duration-300 shadow-xl shadow-indigo-200/50">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <BarChart4 size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs md:text-sm font-medium leading-relaxed">{insight}</p>
          </div>
          <button onClick={() => setInsight(null)} className="p-1 hover:bg-white/10 rounded">
            <Plus size={18} className="rotate-45" />
          </button>
        </div>
      )}

      {searchQuery.trim() ? (
        <div className="p-4 md:p-8 space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Search size={14} /> Found {searchResults.length} Records
            </h3>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(t => (
                <div 
                  key={t.id}
                  onClick={() => onOpenDayDetail(t.date)}
                  className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Record Date</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">{format(parseISO(t.date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-800 mb-1">PKR {t.amount.toLocaleString()}</p>
                  <p className="text-xs font-medium text-slate-500 italic line-clamp-2">
                    {t.note || 'Internal system record...'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching transactions found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-2 md:p-6 overflow-x-auto">
          <div className="min-w-[700px] lg:min-w-0">
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-slate-50 py-3 text-center text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayStats = statsByDate[dateKey] || { income: 0, expense: 0, transactions: [] };
                const balance = dayStats.income - dayStats.expense;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDayToday = isToday(day);

                const hasIncome = dayStats.income > 0;
                const hasExpense = dayStats.expense > 0;

                return (
                  <div 
                    key={idx} 
                    onClick={() => onOpenDayDetail(dateKey)}
                    className={`min-h-[100px] md:min-h-[140px] bg-white p-1.5 md:p-2 flex flex-col group transition-all cursor-pointer hover:bg-slate-50 ${
                      !isCurrentMonth ? 'bg-slate-50/50 opacity-40' : ''
                    } ${isDayToday ? 'ring-2 ring-inset ring-indigo-500/20' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1 md:mb-2">
                      <span className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-bold ${
                        isDayToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      
                      {user.permissions.canAddTransaction && (
                        <div className="transition-opacity flex gap-1">
                          <button 
                            disabled={hasIncome}
                            onClick={(e) => { e.stopPropagation(); onAddTransaction('income', dateKey); }}
                            className={`p-1 md:p-1.5 rounded-md transition-all bg-emerald-100 text-emerald-700 ${hasIncome ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:bg-emerald-200'}`}
                            title={hasIncome ? "Income already recorded" : "Add Income"}
                          >
                            <Plus size={12} />
                          </button>
                          <button 
                            disabled={hasExpense}
                            onClick={(e) => { e.stopPropagation(); onAddTransaction('expense', dateKey); }}
                            className={`p-1 md:p-1.5 rounded-md transition-all bg-rose-100 text-rose-700 ${hasExpense ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:bg-rose-200'}`}
                            title={hasExpense ? "Expense already recorded" : "Add Expense"}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-0.5">
                      {dayStats.transactions.slice(0, 3).map(t => (
                        <div 
                          key={t.id} 
                          className={`text-[9px] md:text-[10px] px-1.5 py-0.5 md:px-2 md:py-1 rounded-md flex justify-between items-center group/item ${
                            t.type === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          <span className="truncate max-w-[40px] md:max-w-[50px] font-medium uppercase tracking-tighter">{t.type}</span>
                          <div className="flex items-center gap-1">
                            <span className="font-bold">PKR {t.amount}</span>
                          </div>
                        </div>
                      ))}
                      {dayStats.transactions.length > 3 && (
                        <div className="text-[8px] md:text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-1">
                          +{dayStats.transactions.length - 3} more
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-1 md:pt-2 border-t border-slate-50 flex flex-col items-end">
                       <div className="flex gap-2 w-full justify-between items-center mb-0.5">
                          <div className="flex flex-col">
                            {dayStats.income > 0 && <span className="text-[8px] md:text-[9px] font-bold text-emerald-500 leading-none">+PKR {dayStats.income}</span>}
                            {dayStats.expense > 0 && <span className="text-[8px] md:text-[9px] font-bold text-rose-500 leading-none">-PKR {dayStats.expense}</span>}
                          </div>
                          <span className={`text-[10px] md:text-xs font-black ${
                            balance > 0 ? 'text-emerald-600' : balance < 0 ? 'text-rose-600' : 'text-slate-300'
                          }`}>
                            {balance === 0 ? 'PKR 0' : (balance > 0 ? `+PKR ${balance}` : `-PKR ${Math.abs(balance)}`)}
                          </span>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
