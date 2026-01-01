
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Transaction, User } from '../types';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CalendarView from './CalendarView';
import TransactionModal from './TransactionModal';
import DayDetailModal from './DayDetailModal';
import ProjectHeader from './ProjectHeader';
import EmptyState from './EmptyState';
import { apiService } from '../services/apiService';
import { Loader2 } from 'lucide-react';
// Added imports for views used in Sidebar navigation to support full functionality within Dashboard
import UserManagement from './UserManagement';
import ProfileSettings from './ProfileSettings';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Added activeView state to support Sidebar navigation between different application views
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'profile'>('dashboard');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projData, transData] = await Promise.all([
          apiService.fetchProjects(),
          apiService.fetchTransactions()
        ]);
        setProjects(projData);
        setTransactions(transData);
        if (projData.length > 0) setActiveProjectId(projData[0].id);
      } catch (error) {
        console.error("Data load error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Fix: Calculate global balance for Navbar and EmptyState to resolve missing prop error
  const globalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [transactions]);

  // Fix: Added logic to track if an income transaction exists for the current project
  const hasProjectIncome = useMemo(() => {
    if (!activeProjectId) return false;
    return transactions.some(t => t.projectId === activeProjectId && t.type === 'income');
  }, [transactions, activeProjectId]);

  // Fix: Added logic to track if an expense transaction exists for the current project
  const hasProjectExpense = useMemo(() => {
    if (!activeProjectId) return false;
    return transactions.some(t => t.projectId === activeProjectId && t.type === 'expense');
  }, [transactions, activeProjectId]);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  // Project Handlers
  // Fix: Added icon parameter to handleAddProject to match Sidebar requirements
  const handleAddProject = async (name: string, description: string, icon: string) => {
    try {
      const newProject = await apiService.createProject(name, description, icon);
      setProjects(prev => [...prev, newProject]);
      setActiveProjectId(newProject.id);
      setIsSidebarOpen(false);
      // Automatically switch to dashboard view when a new project is created
      setActiveView('dashboard');
    } catch (error) {
      console.error("Add Project Error:", error);
      alert("Failed to create project. Please check your connection.");
    }
  };

  // Fix: Added icon parameter to handleUpdateProject to match Sidebar requirements
  const handleUpdateProject = async (id: string, name: string, description: string, icon: string) => {
    try {
      const updated = await apiService.updateProject(id, name, description, icon);
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error("Update Project Error:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete project and all associated data?")) return;
    try {
      await apiService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setTransactions(prev => prev.filter(t => t.projectId !== id));
      if (activeProjectId === id) setActiveProjectId(null);
    } catch (error) {
      console.error("Delete Project Error:", error);
    }
  };

  // Fix: Added CSV Export Handler to match Navbar expectations
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("No transaction data to export yet.");
      return;
    }

    const headers = ["Project Name", "Date", "Type", "Amount", "Note"];
    const rows = transactions.map(t => {
      const project = projects.find(p => p.id === t.projectId);
      return [
        project ? project.name : "Archived Project",
        t.date,
        t.type.toUpperCase(),
        t.amount,
        t.note || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `FinanceFlow_Backup_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Transaction Handlers
  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'projectId' | 'date'>) => {
    if (!activeProjectId || !selectedDate) return;
    try {
      const newTransaction = await apiService.createTransaction({
        projectId: activeProjectId,
        date: selectedDate,
        ...data,
      });
      setTransactions(prev => [...prev, newTransaction]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Add Transaction Error:", error);
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updated = await apiService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error("Update Transaction Error:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Delete Transaction Error:", error);
    }
  };

  // Modal Handlers
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

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Financial Data...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      <Sidebar 
        projects={projects} 
        activeProjectId={activeProjectId} 
        onSelectProject={(id) => { setActiveProjectId(id); setIsSidebarOpen(false); setActiveView('dashboard'); }} 
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        // Fix: Added required user, activeView and onSetView props to Sidebar
        user={user}
        activeView={activeView}
        onSetView={setActiveView}
      />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Fix: Added missing onSetView prop to Navbar */}
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpen(true)}
          user={user}
          onLogout={onLogout}
          onExport={handleExportCSV}
          globalBalance={globalBalance}
          onSetView={setActiveView}
        />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {/* Fix: Added conditional rendering for Users and Profile views based on activeView state */}
          {activeView === 'users' && <UserManagement activeAdmin={user} />}
          {activeView === 'profile' && <ProfileSettings activeUser={user} onUpdateUser={() => {}} />}
          
          {activeView === 'dashboard' && (
            <>
              {activeProject ? (
                <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                  <ProjectHeader 
                    project={activeProject} 
                    transactions={transactions.filter(t => t.projectId === activeProject.id)} 
                  />

                  <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden ring-1 ring-slate-200/50">
                    <CalendarView 
                      projectId={activeProjectId}
                      transactions={transactions.filter(t => t.projectId === activeProjectId)}
                      onAddTransaction={handleOpenAddModal}
                      onOpenDayDetail={handleOpenDayDetail}
                      onDeleteTransaction={handleDeleteTransaction}
                      activeProject={activeProject}
                      // Fix: Added missing user prop to CalendarView
                      user={user}
                    />
                  </div>
                </div>
              ) : (
                <EmptyState 
                  onOpenSidebar={() => setIsSidebarOpen(true)} 
                  globalBalance={globalBalance}
                  projectCount={projects.length}
                />
              )}
            </>
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
          // Fix: Added missing hasProjectIncome prop to DayDetailModal to resolve property missing error
          hasProjectIncome={hasProjectIncome}
          // Fix: Added missing hasProjectExpense prop to DayDetailModal to resolve property missing error
          hasProjectExpense={hasProjectExpense}
          onClose={() => setIsDayDetailOpen(false)} 
          onUpdate={handleUpdateTransaction} 
          onDelete={handleDeleteTransaction} 
          onAdd={handleOpenAddModal} 
          // Fix: Added missing user prop to DayDetailModal
          user={user}
        />
      )}
    </div>
  );
};

export default Dashboard;
