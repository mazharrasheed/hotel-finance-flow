
import React, { useState } from 'react';
import { Project, User } from '../types';
import { 
  Plus, X, Trash2, Edit2, Wallet, LayoutDashboard,
  Target, Layers, PieChart, Users, Cpu, Shield, 
  BarChart3, FileText, Award, Zap, Briefcase, Settings, UserCheck
} from 'lucide-react';
import { DynamicIcon } from '../App';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onAddProject: (name: string, description: string, icon: string) => void;
  onUpdateProject: (id: string, name: string, description: string, icon: string) => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  user: User;
  activeView: 'dashboard' | 'users' | 'profile';
  onSetView: (view: 'dashboard' | 'users' | 'profile') => void;
}

const AVAILABLE_ICONS = [
  'Target', 'Layers', 'PieChart', 'Users', 'Cpu', 'Shield',
  'BarChart3', 'FileText', 'Award', 'Zap', 'Briefcase'
];

const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  isOpen,
  onClose,
  user,
  activeView,
  onSetView
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');

  const handleDashboardClick = () => {
    onSetView('dashboard');
    onSelectProject(null);
  };

  const handleManagementClick = (view: 'users' | 'profile') => {
    onSetView(view);
    onSelectProject(null);
  };

  const handleProjectClick = (id: string) => {
    onSetView('dashboard');
    onSelectProject(id);
  };

  const openAdd = () => {
    if (!user.permissions.canCreateProject) return;
    setEditingProject(null);
    setNewName('');
    setNewDesc('');
    setSelectedIcon('Briefcase');
    setShowForm(true);
  };

  const openEdit = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    if (!user.permissions.canEditProject) return;
    setEditingProject(p);
    setNewName(p.name);
    setNewDesc(p.description);
    setSelectedIcon(p.icon || 'Briefcase');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      if (editingProject) {
        onUpdateProject(editingProject.id, newName, newDesc, selectedIcon);
      } else {
        onAddProject(newName, newDesc, selectedIcon);
      }
      setShowForm(false);
    }
  };

  return (
    <aside className={`
      fixed lg:relative inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-40 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl cursor-pointer" onClick={handleDashboardClick}>
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md">
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            FinanceFlow
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        {user.permissions.canCreateProject && (
          <button 
            onClick={openAdd}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 active:scale-[0.97]"
          >
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-6">
        <div className="px-3 py-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</span>
        </div>

        <button
          onClick={handleDashboardClick}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group border ${
            activeView === 'dashboard' && activeProjectId === null
              ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold shadow-sm' 
              : 'text-slate-600 border-transparent hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
            activeView === 'dashboard' && activeProjectId === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
          }`}>
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[13px] tracking-tight">Portfolio Overview</span>
        </button>

        {user.role === 'admin' && (
          <button
            onClick={() => handleManagementClick('users')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group border ${
              activeView === 'users' 
                ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold shadow-sm' 
                : 'text-slate-600 border-transparent hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
              activeView === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
            }`}>
              <UserCheck size={20} />
            </div>
            <span className="text-[13px] tracking-tight">User Control</span>
          </button>
        )}

        <button
          onClick={() => handleManagementClick('profile')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group border ${
            activeView === 'profile' 
              ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold shadow-sm' 
              : 'text-slate-600 border-transparent hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
            activeView === 'profile' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
          }`}>
            <Settings size={20} />
          </div>
          <span className="text-[13px] tracking-tight">Profile Settings</span>
        </button>

        <div className="px-3 pt-6 pb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Vault</span>
        </div>
        
        {projects.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">Vault currently empty</p>
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group cursor-pointer border ${
                activeProjectId === project.id && activeView === 'dashboard'
                  ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold shadow-sm' 
                  : 'text-slate-600 border-transparent hover:bg-slate-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 text-white`} style={{ backgroundColor: project.color }}>
                <DynamicIcon name={project.icon || 'Briefcase'} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block truncate text-[13px] tracking-tight">{project.name}</span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {user.permissions.canEditProject && (
                  <button onClick={(e) => openEdit(e, project)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm"><Edit2 size={13} /></button>
                )}
                {user.permissions.canDeleteProject && (
                  <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 shadow-sm"><Trash2 size={13} /></button>
                )}
              </div>
            </div>
          ))
        )}
      </nav>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800">{editingProject ? 'Edit Asset' : 'New Asset'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Icon Identity</label>
                <div className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 max-h-40 overflow-y-auto">
                  {AVAILABLE_ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setSelectedIcon(icon)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${selectedIcon === icon ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}>
                      <DynamicIcon name={icon} size={18} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Label</label>
                <input autoFocus type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Project Name" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700" />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98]">
                {editingProject ? 'Commit Update' : 'Initialize Vault'}
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
