
import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, Briefcase, X, Trash2, Edit2 } from 'lucide-react';
import ProjectModal from './ProjectModal';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string, description: string) => void;
  onUpdateProject: (id: string, name: string, description: string) => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  isOpen,
  onClose
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteProject(id);
  };

  const handleSubmit = (name: string, description: string) => {
    if (editingProject) {
      onUpdateProject(editingProject.id, name, description);
    } else {
      onAddProject(name, description);
    }
    setIsModalOpen(false);
  };

  return (
    <aside className={`
      fixed lg:relative inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-40 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <div className="bg-indigo-600 p-1 rounded text-white">
              <Briefcase size={20} strokeWidth={2.5} />
            </div>
            FinanceFlow
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full lg:hidden text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-slate-200 active:scale-95"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        <div className="px-2 mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Projects</span>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-slate-400 italic">No projects yet</p>
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group cursor-pointer ${
                activeProjectId === project.id 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="truncate flex-1 text-left text-sm">{project.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleOpenEdit(e, project)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, project.id)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </nav>

      {isModalOpen && (
        <ProjectModal 
          editingProject={editingProject}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </aside>
  );
};

export default Sidebar;
