
import React from 'react';
import { LayoutDashboard, Menu } from 'lucide-react';

interface EmptyStateProps {
  onOpenSidebar: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onOpenSidebar }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-100 animate-bounce-slow">
        <LayoutDashboard size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ready to Track?</h2>
      <p className="text-slate-400 max-w-sm mt-3 text-lg font-medium">
        Select a project from the sidebar or create a new one to begin managing your monthly budget and expenses.
      </p>
      <button 
        onClick={onOpenSidebar} 
        className="mt-8 flex lg:hidden items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98]"
      >
        <Menu size={20} />
        Open Projects
      </button>
    </div>
  );
};

export default EmptyState;
