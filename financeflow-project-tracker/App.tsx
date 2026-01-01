
import React, { useState, useEffect, useMemo } from 'react';
import { User, Project, Transaction } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CalendarView from './components/CalendarView';
import TransactionModal from './components/TransactionModal';
import DayDetailModal from './components/DayDetailModal';
import Login from './components/Login';
import { LayoutDashboard, Wallet, Menu, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Local State instead of API
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    const savedUser = localStorage.getItem('finance_user');
    const savedProjects = localStorage.getItem('finance_projects');
    const savedTransactions = localStorage.getItem('finance_transactions');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
      if (parsedProjects.length > 0) setActiveProjectId(parsedProjects[0].id);
    }
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    
    setIsInitializing(false);
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('finance_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleLogout = () => {
    localStorage.removeItem('finance_user');
    setUser(null);
  };

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  // Project Handlers
  const handleAddProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      createdAt: Date.now(),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    };
    // Add to top as requested
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
  };

  const handleUpdateProject = (id: string, name: string, description: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, description } : p));
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm("Delete project and all associated data?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    setTransactions(prev => prev.filter(t => t.projectId !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

  // Transaction Handlers
  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'projectId' | 'date'>) => {
    if (!activeProjectId || !selectedDate) return;
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: activeProjectId,
      date: selectedDate,
      ...data,
    };
    setTransactions(prev => [...prev, newTransaction]);
    setIsModalOpen(false);
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Modal Helpers
  const handleOpenAddModal = (type: 'income' | 'expense', date: string) => {
    setModalType(type);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleOpenDayDetail = (date: string) => {
    setSelectedDate(date);
    setIsDayDetailOpen(true);
  };

  const activeDayTransactions = useMemo(() => {
    if (!selectedDate || !activeProjectId) return [];
    return transactions.filter(t => t.projectId === activeProjectId && t.date === selectedDate);
  }, [transactions, activeProjectId, selectedDate]);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Initializing FinanceFlow...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-['Inter']">
      <Sidebar 
        projects={projects} 
        activeProjectId={activeProjectId} 
        onSelectProject={(id) => { setActiveProjectId(id); setIsSidebarOpen(false); }} 
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 h-full">
        <Navbar 
          projects={projects} 
          activeProjectId={activeProjectId} 
          onSelectProject={setActiveProjectId}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {activeProject ? (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2 truncate tracking-tight">
                    <span className="w-3 h-8 md:w-3.5 md:h-10 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: activeProject.color }} />
                    <span className="truncate">{activeProject.name}</span>
                  </h1>
                  <p className="text-slate-400 mt-1 text-sm md:text-base font-medium line-clamp-1">{activeProject.description || 'No description provided'}</p>
                </div>
                
                <div className="bg-white p-3 md:p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 w-full md:w-auto transition-transform hover:scale-[1.02]">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner shadow-emerald-100/50">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Total Balance</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                      ${transactions.filter(t => t.projectId === activeProjectId)
                        .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </header>

              <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden ring-1 ring-slate-200/50">
                <CalendarView 
                  projectId={activeProjectId}
                  transactions={transactions.filter(t => t.projectId === activeProjectId)}
                  onAddTransaction={handleOpenAddModal}
                  onOpenDayDetail={handleOpenDayDetail}
                  onDeleteTransaction={handleDeleteTransaction}
                  activeProject={activeProject}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-100">
                <LayoutDashboard size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ready to Track?</h2>
              <p className="text-slate-400 max-w-sm mt-3 text-lg font-medium">Select a project from the sidebar or create a new one to begin.</p>
              <button onClick={() => setIsSidebarOpen(true)} className="mt-8 flex lg:hidden items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200">
                <Menu size={20} />
                Open Projects
              </button>
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
          transactions={activeDayTransactions} 
          onClose={() => setIsDayDetailOpen(false)} 
          onUpdate={handleUpdateTransaction} 
          onDelete={handleDeleteTransaction} 
          onAdd={handleOpenAddModal} 
        />
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
