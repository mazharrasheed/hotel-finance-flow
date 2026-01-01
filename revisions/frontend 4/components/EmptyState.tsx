
import React from 'react';
import { LayoutDashboard, Menu, TrendingUp, Globe } from 'lucide-react';

interface EmptyStateProps {
  onOpenSidebar: () => void;
  globalBalance?: number;
  projectCount?: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onOpenSidebar, globalBalance = 0, projectCount = 0 }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-100">
        <LayoutDashboard size={40} />
      </div>
      
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Portfolio Summary</h2>
      <p className="text-slate-400 max-w-sm mt-3 text-lg font-medium mb-10">
        You are currently managing {projectCount} project{projectCount !== 1 ? 's' : ''}. Select a workspace from the directory to start tracking.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-10">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-2">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-2">
            <Globe size={24} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Net Worth</span>
          <span className={`text-3xl font-black ${globalBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            PKR {globalBalance.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-2">
            <TrendingUp size={24} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Workspaces</span>
          <span className="text-3xl font-black text-slate-800">
            {projectCount}
          </span>
        </div>
      </div>

      <button 
        onClick={onOpenSidebar} 
        className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98]"
      >
        <Menu size={20} />
        Open Project Directory
      </button>
    </div>
  );
};

export default EmptyState;
