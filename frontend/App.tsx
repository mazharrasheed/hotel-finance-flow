
import React, { useState, useEffect, useMemo } from 'react';
import { User, Project, Transaction } from './types';
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
import { Loader2, ConciergeBell, Bed, Utensils, Key, Coffee } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import './index.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [view, setView] = useState<'dashboard' | 'users' | 'profile' | 'reports'>('dashboard');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Warning before closing the tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; 
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const savedActiveUser = localStorage.getItem('finance_active_user');
    const savedProjects = localStorage.getItem('finance_projects');
    const savedTransactions = localStorage.getItem('finance_transactions');

    if (savedActiveUser) setUser(JSON.parse(savedActiveUser));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    
    setIsInitializing(false);
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

  const handleAddProject = (name: string, description: string, icon: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      createdAt: Date.now(),
      color: `hsl(${Math.random() * 360}, 70%, 55%)`,
      icon: icon || 'Briefcase',
    };
    // Prepend to array so new projects show at the top
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setView('dashboard');
  };

  const handleUpdateProject = (id: string, name: string, description: string, icon: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, description, icon } : p));
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm("Permanently remove this project archive?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    setTransactions(prev => prev.filter(t => t.projectId !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

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

  const handleExportCSV = () => {
    if (transactions.length === 0 && projects.length === 0) {
      alert("No records found to export.");
      return;
    }

    const transactionHeaders = ["Section", "Project", "Date", "Type", "Amount (PKR)", "Reference"];
    const transactionRows = transactions.map(t => {
      const project = projects.find(p => p.id === t.projectId);
      return [
        "LOG",
        project ? project.name : "Archived Asset",
        t.date,
        t.type.toUpperCase(),
        t.amount,
        t.note || "General"
      ];
    });

    const projectSummaries = projects.map(p => {
      const pTransactions = transactions.filter(t => t.projectId === p.id);
      const income = pTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = pTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return ["SUMMARY", p.name, "-", "BALANCE", income - expense, `In: ${income} | Out: ${expense}`];
    });

    const globalSummary = [
      ["TOTALS", "OVERALL PORTFOLIO", "-", "NET BALANCE", globalBalance, "Full Backup Data"]
    ];

    const csvContent = [
      transactionHeaders.join(","),
      ...transactionRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      "",
      "--- PROJECT BALANCES ---",
      "Type,Project Name,Date,Field,Balance/Amount,Details",
      ...projectSummaries.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      "",
      "--- GLOBAL PORTFOLIO BALANCE ---",
      ...globalSummary.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `FinanceFlow_Backup_${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Syncing Accounts...</p>
      </div>
    );
  }

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-['Inter']">
      {/* Background Icons */}
      <div className="absolute top-20 right-40 text-indigo-600/5 pointer-events-none -rotate-12 print:hidden"><ConciergeBell size={180} /></div>
      <div className="absolute bottom-20 left-40 text-indigo-600/5 pointer-events-none rotate-12 print:hidden"><Key size={140} /></div>
      <div className="absolute top-1/2 left-10 text-indigo-600/5 pointer-events-none -translate-y-1/2 rotate-6 print:hidden"><Bed size={120} /></div>
      <div className="absolute bottom-10 right-10 text-indigo-600/5 pointer-events-none -rotate-6 print:hidden"><Utensils size={100} /></div>
      <div className="absolute top-10 left-1/4 text-indigo-600/5 pointer-events-none rotate-45 print:hidden"><Coffee size={80} /></div>

      <Sidebar 
        projects={projects} 
        activeProjectId={activeProjectId} 
        onSelectProject={(id) => { setActiveProjectId(id); setIsSidebarOpen(false); setView('dashboard'); }} 
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden print:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10">
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
                <div className="space-y-6 animate-in fade-in duration-500">
                  <ProjectHeader 
                    project={activeProject} 
                    transactions={transactions.filter(t => t.projectId === activeProject.id)} 
                  />

                  <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden ring-1 ring-slate-200/50">
                    <CalendarView 
                      projectId={activeProjectId}
                      transactions={transactions.filter(t => t.projectId === activeProjectId)}
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
                  onSelectProject={setActiveProjectId}
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
          transactions={transactions.filter(t => t.projectId === activeProjectId && t.date === selectedDate)} 
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

export const DynamicIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Hotel;
  return <Icon size={size} className={className} />;
};

export default App;
