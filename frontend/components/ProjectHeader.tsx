
import React from 'react';
import { Project, Transaction } from '../types';
import { Wallet } from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
  transactions: Transaction[];
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, transactions }) => {
  const totalBalance = transactions
    .filter(t => t.projectId === project.id)
    .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2 truncate tracking-tight">
          <span 
            className="w-3 h-8 md:w-3.5 md:h-10 rounded-full shrink-0 shadow-sm" 
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate">{project.name}</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base font-medium line-clamp-1">
          {project.description || 'No description provided'}
        </p>
      </div>
      
      <div className="bg-white p-3 md:p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 w-full md:w-auto transition-transform hover:scale-[1.02]">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner shadow-emerald-100/50">
          <Wallet size={24} />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Total Balance</p>
          <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            ${totalBalance.toLocaleString()}
          </p>
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
