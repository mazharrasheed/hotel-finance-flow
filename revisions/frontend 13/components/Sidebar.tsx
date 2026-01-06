
import React, { useState } from 'react';
import { Project, User } from '../types';
import { 
  X, Trash2, Edit2, LayoutDashboard,
  Target, Layers, PieChart, Users, Cpu, Shield, 
  BarChart3, FileText, Award, Zap, Briefcase, Settings, UserCheck,
  Key, Sparkles, FolderPlus, Hotel
} from 'lucide-react';
import { DynamicIcon } from '../App';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onAddProject: (name: string, description: string, icon: string) => void;
  onUpdateProject: (id: string, name: string, description: string, icon: string) => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  activeView: 'dashboard' | 'users' | 'profile' | 'reports';
  onSetView: (view: 'dashboard' | 'users' | 'profile' | 'reports') => void;
}

const AVAILABLE_ICONS = [
  'Briefcase', 'Target', 'Layers', 'PieChart', 'Key', 'Users', 'Cpu', 'Shield',
  'BarChart3', 'FileText', 'Award', 'Zap'
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
  activeView,
  onSetView
}) => {
  const { user, hasPerm } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');

  const handleDashboardClick = () => {
    onSelectProject(null);
    onSetView('dashboard');
  };

  const handleManagementClick = (view: 'users' | 'profile' | 'reports') => {
    onSelectProject(null);
    onSetView(view);
  };

  const handleProjectClick = (id: string) => {
    onSelectProject(id);
    onSetView('dashboard');
  };

  const openAdd = () => {
    setEditingProject(null);
    setNewName('');
    setNewDescription('');
    setSelectedIcon('Briefcase');
    setShowForm(true);
  };

  const openEdit = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    setEditingProject(p);
    setNewName(p.name);
    setNewDescription(p.description || '');
    setSelectedIcon(p.icon || 'Briefcase');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      if (editingProject) {
        onUpdateProject(editingProject.id, newName, newDescription, selectedIcon);
      } else {
        onAddProject(newName, newDescription, selectedIcon);
      }
      setShowForm(false);
    }
  };

  if (!user) return null;

  return (
    <aside className={`fixed lg:relative inset-y-0 left-0 w-72 border-r border-slate-200 flex flex-col h-full z-40 transition-transform duration-300 ease-in-out overflow-hidden bg-white ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50 opacity-80 pointer-events-none" />
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl cursor-pointer" onClick={handleDashboardClick}>
            <LayoutDashboard size={24} /> FinanceFlow
          </div>
          <button onClick={onClose} className="p-2 lg:hidden text-slate-400"><X size={20} /></button>
        </div>

        {hasPerm('finance.add_project') && (
          <button onClick={openAdd} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-md">
            <FolderPlus size={18} /> Add Project
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-6 relative z-10">
        <div className="px-3 py-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">General</span></div>

        <button onClick={handleDashboardClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === 'dashboard' && !activeProjectId ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-white/60'}`}>
          <LayoutDashboard size={20} /> <span className="text-sm">Project Hub</span>
        </button>

        {hasPerm('finance.view_reports') && (
          <button onClick={() => handleManagementClick('reports')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === 'reports' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-white/60'}`}>
            <FileText size={20} /> <span className="text-sm">Ledger</span>
          </button>
        )}

        <div className="px-3 pt-6 py-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Entities</span></div>
        <div className="space-y-1">
          {projects.map((project) => (
            <div key={project.id} onClick={() => handleProjectClick(project.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer group ${activeProjectId === project.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-white/60'}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: project.color }}>
                <DynamicIcon name={project.icon || 'Briefcase'} size={16} />
              </div>
              <span className="flex-1 truncate text-sm">{project.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {hasPerm('finance.change_project') && (
                  <button onClick={(e) => openEdit(e, project)} className="p-1 hover:bg-white rounded-md text-slate-400"><Edit2 size={12} /></button>
                )}
                {hasPerm('finance.delete_project') && (
                  <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-1 hover:bg-white rounded-md text-slate-400"><Trash2 size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-3 pt-6 py-2 border-t border-slate-100 mt-4"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</span></div>
        {(user.is_staff || user.is_superuser) && (
          <button onClick={() => handleManagementClick('users')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === 'users' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-white/60'}`}>
            <UserCheck size={20} /> <span className="text-sm">Personnel</span>
          </button>
        )}
        <button onClick={() => handleManagementClick('profile')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === 'profile' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-white/60'}`}>
          <Settings size={20} /> <span className="text-sm">Profile</span>
        </button>
      </nav>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingProject ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Project name" />
              <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl h-24" placeholder="Description" />
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-sm">Save</button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
