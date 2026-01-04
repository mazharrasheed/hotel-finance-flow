
import React, { useState, useEffect, useMemo } from 'react';
import { User, Project, Transaction, AppTheme } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CalendarView from './components/CalendarView';
import TransactionModal from './components/TransactionModal';
import DayDetailModal from './components/DayDetailModal';
import Login from './components/Login';
import EmptyState from './components/EmptyState';
import ProjectHeader from './components/ProjectHeader';
import UserManagement from './components/UserManagement';
import ProfileSettings from './components/ProfileSettings';
import ReportsView from './components/ReportsView';
import { Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { apiService } from './services/apiService';
import {
  Briefcase,
  Target,
  Layers,
  PieChart,
  Key,
  Users,
  Cpu,
  Shield,
  BarChart3,
  FileText,
  Award,
  Zap,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Target,
  Layers,
  PieChart,
  Key,
  Users,
  Cpu,
  Shield,
  BarChart3,
  FileText,
  Award,
  Zap,
};

export const DynamicIcon = ({
  name,
  size = 16,
  ...props
}: {
  name: string;
  size?: number;
}) => {
  const Icon = ICON_MAP[name] || Briefcase;
  return <Icon size={size} {...props} />;
};


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [view, setView] = useState<'dashboard' | 'users' | 'profile' | 'reports'>('dashboard');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const theme: AppTheme = user?.theme || 'indigo';

  useEffect(() => {
    const initApp = async () => {
      const savedActiveUser = localStorage.getItem('finance_active_user');
      if (savedActiveUser) setUser(JSON.parse(savedActiveUser));

      try {
        const [apiProjects, apiTransactions] = await Promise.all([
          apiService.fetchProjects(),
          apiService.fetchTransactions()
        ]);
        
        if (apiProjects.length > 0) setProjects(apiProjects);
        else {
          const local = localStorage.getItem('finance_projects');
          if (local) setProjects(JSON.parse(local));
        }

        if (apiTransactions.length > 0) setTransactions(apiTransactions);
        else {
          const local = localStorage.getItem('finance_transactions');
          if (local) setTransactions(JSON.parse(local));
        }
      } catch (err) {
        const localProjs = localStorage.getItem('finance_projects');
        const localTrans = localStorage.getItem('finance_transactions');
        if (localProjs) setProjects(JSON.parse(localProjs));
        if (localTrans) setTransactions(JSON.parse(localTrans));
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem('finance_projects', JSON.stringify(projects));
      localStorage.setItem('finance_transactions', JSON.stringify(transactions));
    }
  }, [projects, transactions, isInitializing]);

  const handleLogout = () => {
    localStorage.removeItem('finance_active_user');
    setUser(null);
    setView('dashboard');
    setActiveProjectId(null);
  };

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  const globalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [transactions]);

  const handleAddProject = async (name: string, description: string, icon: string) => {
    try {
      const newProject = await apiService.createProject(name, description, icon);
      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setView('dashboard');
    } catch (err) {
      alert('Error creating project. Check API connection.');
    }
  };

  const handleUpdateProject = async (id: string, name: string, description: string, icon: string) => {
    try {
      const updated = await apiService.updateProject(id, name, description, icon);
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      alert('Error updating project.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Permanently remove this project?")) return;
    try {
      await apiService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setTransactions(prev => prev.filter(t => t.project !== id));
      if (activeProjectId === id) setActiveProjectId(null);
    } catch (err) {
      alert('Error deleting project.');
    }
  };

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'project' | 'date'>) => {
    if (!activeProjectId || !selectedDate) return;
    
    try {
      const newTransaction = await apiService.createTransaction({
        project: activeProjectId,
        date: selectedDate,
        ...data,
      });
      setTransactions(prev => [...prev, newTransaction]);
      setIsModalOpen(false);
    } catch (err) {
      alert('Error saving transaction.');
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updated = await apiService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      alert('Error updating transaction.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Error deleting transaction.');
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0 && projects.length === 0) return;
    const headers = ["Project", "Date", "Type", "Amount", "Note"];
    const rows = transactions.map(t => {
      const p = projects.find(proj => proj.id === t.project);
      return [p?.name || "Archived", t.date, t.type.toUpperCase(), t.amount, t.note];
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className={`flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-['Inter'] theme-${theme}`}>
      <Sidebar 
        projects={projects} 
        activeProjectId={activeProjectId} 
        onSelectProject={(id) => { 
          setActiveProjectId(id); 
          setIsSidebarOpen(false); 
          if (id) setView('dashboard');
        }} 
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        activeView={view}
        onSetView={setView}
      />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
          onExport={handleExportCSV}
          globalBalance={globalBalance}
          onSetView={setView}
        />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {view === 'users' && <UserManagement activeAdmin={user} />}
          {view === 'profile' && <ProfileSettings activeUser={user} onUpdateUser={setUser} />}
          {view === 'reports' && <ReportsView transactions={transactions} projects={projects} />}
          
          {view === 'dashboard' && (
            <div className="max-w-7xl mx-auto h-full">
              {activeProject ? (
                <div className="space-y-6">
                  <ProjectHeader 
                    project={activeProject} 
                    transactions={transactions.filter(t => t.project === activeProject.id)} 
                  />
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <CalendarView 
                      projectId={activeProjectId!}
                      transactions={transactions.filter(t => t.project === activeProjectId)}
                      onAddTransaction={(type, date) => { setModalType(type); setSelectedDate(date); setIsModalOpen(true); }}
                      onOpenDayDetail={(date) => { setSelectedDate(date); setIsDayDetailOpen(true); }}
                      onDeleteTransaction={handleDeleteTransaction}
                      activeProject={activeProject}
                      user={user}
                    />
                  </div>
                </div>
              ) : (
                <EmptyState 
                  onOpenSidebar={() => setIsSidebarOpen(true)} 
                  globalBalance={globalBalance}
                  projectCount={projects.length}
                  projects={projects}
                  transactions={transactions}
                  onSelectProject={(id) => { setActiveProjectId(id); setView('dashboard'); }}
                  theme={theme}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <TransactionModal 
          type={modalType} 
          date={selectedDate!} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleAddTransaction} 
        />
      )}

      {isDayDetailOpen && selectedDate && (
        <DayDetailModal 
          date={selectedDate} 
          transactions={transactions.filter(t => t.project === activeProjectId && t.date === selectedDate)} 
          onClose={() => setIsDayDetailOpen(false)} 
          onUpdate={handleUpdateTransaction} 
          onDelete={handleDeleteTransaction} 
          onAdd={(type, date) => { 
            setIsDayDetailOpen(false); 
            setModalType(type); 
            setSelectedDate(date); 
            setIsModalOpen(true); 
          }} 
          user={user}
        />
      )}
    </div>
  );
};

// export const DynamicIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
//   const Icon = (LucideIcons as any)[name] || LucideIcons.Briefcase;
//   return <Icon size={size} className={className} />;
// };

export default App;
