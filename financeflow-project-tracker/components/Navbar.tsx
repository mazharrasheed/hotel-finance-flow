
import React from 'react';
import { Project, User } from '../types';
import { Menu, LogOut, LogIn, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onToggleSidebar: () => void;
  user: User | null;
  onLogout: () => void;
  onShowLogin?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onToggleSidebar,
  user,
  onLogout,
  onShowLogin
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 shrink-0 overflow-hidden shadow-sm z-20">
      <button 
        onClick={onToggleSidebar}
        className="p-2 mr-4 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 flex h-full overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex h-full">
          {projects.length === 0 ? (
            <span className="text-slate-400 text-sm flex items-center">
              {user ? 'Add a project to begin' : 'Login to manage projects'}
            </span>
          ) : (
            projects.map(project => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`px-4 md:px-6 h-full flex items-center border-b-2 transition-all whitespace-nowrap text-sm font-semibold tracking-tight ${
                  activeProjectId === project.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full mr-2.5 shadow-sm" 
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-4 pl-4 border-l border-slate-100">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-black text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 leading-tight">Pro Account</p>
            </div>
            <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200 shadow-sm overflow-hidden">
               <UserIcon size={20} />
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Log Out</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={onShowLogin}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all font-bold text-sm shadow-md shadow-indigo-100"
          >
            <LogIn size={18} />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
