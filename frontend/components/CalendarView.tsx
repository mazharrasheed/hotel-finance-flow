
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
  isValid
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, BarChart4, Search, X, Calendar as CalendarIcon, FileText, Landmark } from 'lucide-react';
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
  onAddTransaction: (type: 'income' | 'expense' | 'investment', date: string) => void;
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
    const stats: Record<string, { income: number; expense: number; investment: number; transactions: Transaction[] }> = {};
    
    transactions.forEach(t => {
      const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
      if (!stats[dateKey]) {
        stats[dateKey] = { income: 0, expense: 0, investment: 0, transactions: [] };
      }
      if (t.type === 'income') stats[dateKey].income += t.amount;
      else if (t.type === 'expense') stats[dateKey].expense += t.amount;
      else if (t.type === 'investment') stats[dateKey].investment += t.amount;
      stats[dateKey].transactions.push(t);
    });
    
    return stats;
  }, [transactions]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (!isValid(tDate)) return false;

      const noteMatch = t.note.toLowerCase().includes(query);
      const isoMatch = format(tDate, 'yyyy-MM-dd').includes(query);
      
      return noteMatch || isoMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery]);

  return (
    <div className="flex flex-col w-full overflow-hidden print:hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <h2 className="text-lg md:text-xl font-black text-slate-800 shrink-0">
            {format(currentMonth, 'MMMM yyyy')}
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
            className="text-xs md:text-sm font-black text-indigo-600 hover:text-indigo-700 px-2 shrink-0"
          >
            Today
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all font-bold"
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
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black hover:bg-indigo-100 transition-all disabled:opacity-50 text-xs md:text-sm"
            >
              <BarChart4 size={16} className={isLoadingInsight ? 'animate-pulse' : ''} />
              {isLoadingInsight ? 'Processing...' : 'Audit AI'}
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
            <p className="text-xs md:text-sm font-bold leading-relaxed">{insight}</p>
          </div>
          <button onClick={() => setInsight(null)} className="p-1 hover:bg-white/10 rounded">
            <Plus size={18} className="rotate-45" />
          </button>
        </div>
      )}

      <div className="p-2 md:p-6 overflow-x-auto">
        <div className="min-w-[800px] lg:min-w-0">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayStats = statsByDate[dateKey] || { income: 0, expense: 0, investment: 0, transactions: [] };
              const opBalance = dayStats.income - dayStats.expense;
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isDayToday = isToday(day);

              return (
                <div 
                  key={idx} 
                  onClick={() => onOpenDayDetail(dateKey)}
                  className={`min-h-[120px] md:min-h-[160px] bg-white p-2 flex flex-col group transition-all cursor-pointer hover:bg-slate-50 ${
                    !isCurrentMonth ? 'bg-slate-50/50 opacity-30' : ''
                  } ${isDayToday ? 'ring-2 ring-inset ring-indigo-500/30' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                      isDayToday ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-700'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    
                    {user.permissions.canAddTransaction && isCurrentMonth && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAddTransaction('income', dateKey); }}
                          className="p-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        ><Plus size={10} /></button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAddTransaction('expense', dateKey); }}
                          className="p-1 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200"
                        ><Plus size={10} /></button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-0.5 max-h-[60px] md:max-h-[80px]">
                    {dayStats.transactions.map(t => (
                      <div 
                        key={t.id} 
                        className={`text-[9px] px-1.5 py-0.5 rounded-md flex justify-between items-center ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 
                          t.type === 'expense' ? 'bg-rose-50 text-rose-700' : 
                          'bg-violet-50 text-violet-700'
                        }`}
                      >
                        <span className="truncate font-black">{t.type === 'investment' ? 'INV' : t.type.toUpperCase()}</span>
                        <span className="font-bold">{t.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-2 border-t border-slate-50">
                    <div className="flex flex-col gap-0.5">
                       {dayStats.investment > 0 && (
                         <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-violet-400 uppercase tracking-tighter">Invest</span>
                            <span className="text-[9px] font-black text-violet-600 leading-none">+{dayStats.investment}</span>
                         </div>
                       )}
                       <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Daily Op</span>
                          <span className={`text-[10px] font-black ${
                            opBalance > 0 ? 'text-emerald-600' : opBalance < 0 ? 'text-rose-600' : 'text-slate-300'
                          }`}>
                            {opBalance === 0 ? '0' : (opBalance > 0 ? `+${opBalance}` : `-${Math.abs(opBalance)}`)}
                          </span>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
