
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HotelProject, Transaction, UserRole, TransactionType, AppTheme } from '../types';
import { ICONS } from '../constants';

interface Props {
  projects: HotelProject[];
  transactions: Transaction[];
  onAddProject: (project: HotelProject) => void;
  onUpdateProject: (project: HotelProject) => void;
  onDeleteProject: (id: string) => void;
  userRole?: UserRole;
  theme: AppTheme;
}

const formatCurrency = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

const ProjectList: React.FC<Props> = ({ projects, transactions, onAddProject, onUpdateProject, onDeleteProject, userRole, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newProject, setNewProject] = useState<Partial<HotelProject>>({
    name: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'Operational',
    budget: 0
  });

  const getSummary = (id: string) => {
    const pTrans = transactions.filter(t => t.projectId === id);
    return pTrans.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  };

  const handleEdit = (p: HotelProject, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewProject(p);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name && newProject.location) {
      if (editMode) {
        onUpdateProject(newProject as HotelProject);
      } else {
        onAddProject({
          ...newProject as HotelProject,
          id: Math.random().toString(36).substr(2, 9),
          budget: 0
        });
      }
      closeModal();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setNewProject({ name: '', location: '', startDate: new Date().toISOString().split('T')[0], status: 'Operational', budget: 0 });
  };

  const isAdmin = userRole === UserRole.ADMIN;
  const btnColor = theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                   theme === 'royal' ? 'bg-blue-600 hover:bg-blue-700' :
                   theme === 'gold' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700';
  
  const textTheme = theme === 'emerald' ? 'text-emerald-600' :
                    theme === 'royal' ? 'text-blue-600' :
                    theme === 'gold' ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Portfolio Directory</h2>
          <p className="text-slate-500">Managing active hotel developments across Pakistan.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className={`${btnColor} text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95`}
          >
            <ICONS.Add />
            Add New Project
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => {
          const { income, expense } = getSummary(project.id);
          const balance = income - expense;
          return (
            <Link 
              key={project.id} 
              to={`/project/${project.id}`}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-slate-300 transition-all hover:shadow-xl group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                  project.status === 'Operational' ? 'bg-emerald-50 text-emerald-700' : 
                  project.status === 'Construction' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {project.status}
                </span>
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                    <button 
                      onClick={(e) => handleEdit(project, e)}
                      className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      <ICONS.Edit />
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteProject(project.id); }}
                      className="p-2 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl"
                    >
                      <ICONS.Delete />
                    </button>
                  </div>
                )}
              </div>
              <h3 className={`text-xl font-bold text-slate-800 mb-1 transition-colors group-hover:${textTheme} relative z-10`}>{project.name}</h3>
              <p className="text-slate-500 text-sm mb-8 flex items-center gap-1.5 relative z-10">
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                {project.location}
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6 relative z-10">
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Yield</p>
                   <p className="text-sm font-bold text-emerald-600">{formatCurrency(income)}</p>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Expenses</p>
                   <p className="text-sm font-bold text-rose-600">{formatCurrency(expense)}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-2xl relative z-10">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Net Profit</p>
                 <p className={`text-lg font-black ${balance >= 0 ? textTheme : 'text-rose-600'}`}>
                   {formatCurrency(balance)}
                 </p>
              </div>
            </Link>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
            <div className={`p-8 ${btnColor} text-white`}>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">{editMode ? 'Edit Project' : 'New Project'}</h3>
                <button onClick={closeModal} className="bg-white/20 p-1.5 rounded-xl hover:bg-white/30">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="mt-1 text-white/80 font-medium text-sm">Register a new hotel development in the portfolio.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Hotel Brand Name</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" placeholder="e.g. Avari Xpress" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Regional Location</label>
                <input required type="text" value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm" placeholder="City, Pakistan" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Current Lifecycle</label>
                <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value as any})} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm bg-white">
                  <option value="Planning">Planning</option>
                  <option value="Construction">Construction</option>
                  <option value="Operational">Operational</option>
                  <option value="Renovating">Renovating</option>
                </select>
              </div>
              <button type="submit" className={`w-full ${btnColor} text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl active:scale-95 mt-4`}>
                {editMode ? 'Confirm Changes' : 'Initialize Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
