
import React from 'react';
import { Project, Transaction } from '../types';
import { Wallet } from 'lucide-react';
import { DynamicIcon } from '../App';

interface ProjectHeaderProps {
  project: Project;
  transactions: Transaction[];
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, transactions }) => {
  const projectBalance = transactions
    .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0">
        <div 
          className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-xl text-white animate-in zoom-in duration-500" 
          style={{ backgroundColor: project.color }}
        >
          <DynamicIcon name={project.icon || 'Briefcase'} size={32} />
        </div>
        <div className="min-w-0 py-1">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 truncate tracking-tight">
            {project.name}
          </h1>
          {/* <p className="text-slate-400 mt-1 text-sm md:text-base font-medium line-clamp-1">
            {project.description || 'No project description provided'}
          </p> */}
        </div>
      </div>
      
      <div className="bg-white p-4 md:p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 w-full md:w-auto transition-transform hover:scale-[1.02]">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner shadow-emerald-100/50">
          <Wallet size={24} />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Project Wallet</p>
          <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            PKR {projectBalance.toLocaleString()}
          </p>
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
