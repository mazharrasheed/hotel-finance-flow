
import React from 'react';
import { Project, Transaction } from '../types';
import { Wallet, Globe, TrendingUp, LayoutGrid, ChevronRight, Sparkles, FolderPlus } from 'lucide-react';
import { DynamicIcon } from '../App';

interface EmptyStateProps {
  onOpenSidebar: () => void;
  globalBalance: number;
  projectCount: number;
  projects: Project[];
  transactions: Transaction[];
  onSelectProject: (id: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  onOpenSidebar, 
  globalBalance, 
  projectCount, 
  projects, 
  transactions,
  onSelectProject
}) => {
  return (
    <div className="h-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Globe size={240} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles size={12} /> Financial Command Center
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Manage your entire <br /> project portfolio.
            </h1>
            <p className="mt-4 text-indigo-100 font-medium text-lg leading-relaxed">
              You are currently auditing {projectCount} active entities. Switch between projects in the sidebar or select a card below to dive deep into specifics.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shrink-0 min-w-[280px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">Portfolio Worth</p>
            <p className="text-4xl font-black tracking-tighter">
              PKR {globalBalance.toLocaleString()}
            </p>
            <div className="mt-6 flex items-center gap-2 text-emerald-300">
              <TrendingUp size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Audit Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <LayoutGrid size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Projects</h2>
          </div>
          {projectCount > 0 ? (
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{projectCount} Entities Found</span>
          ) : (
            <button 
              onClick={onOpenSidebar}
              className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:underline"
            >
              <FolderPlus size={16} /> Create your first project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6">
              <FolderPlus size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2 text-center">Empty Registry</h3>
            <p className="text-slate-400 font-medium max-w-xs text-center">Start by adding a new project using the button in the side menu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const pTransactions = transactions.filter(t => t.projectId === project.id);
              const balance = pTransactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
              
              return (
                <div 
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-100 transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-500">
                    <DynamicIcon name={project.icon || 'Briefcase'} size={120} />
                  </div>
                  
                  <div className="relative z-10">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: project.color }}
                    >
                      <DynamicIcon name={project.icon || 'Briefcase'} size={28} />
                    </div>
                    
                    <h4 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{project.name}</h4>
                    <p className="text-slate-400 text-sm font-medium mt-2 line-clamp-1">{project.description || 'No project description provided'}</p>
                    
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Balance</p>
                        <p className={`text-xl font-black tracking-tight ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          PKR {balance.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default EmptyState;
