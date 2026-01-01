
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

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  // Project Handlers
  const handleAddProject = async (name: string, description: string) => {
    try {
      const newProject = await apiService.createProject(name, description);
      setProjects(prev => [...prev, newProject]);
      setActiveProjectId(newProject.id);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Add Project Error:", error);
      alert("Failed to create project. Please check your connection.");
    }
  };

  const handleUpdateProject = async (id: string, name: string, description: string) => {
    try {
      const updated = await apiService.updateProject(id, name, description);
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
          onLogout={onLogout}
        />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {activeProject ? (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
              <ProjectHeader 
                project={activeProject} 
                transactions={transactions} 
              />

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
            <EmptyState onOpenSidebar={() => setIsSidebarOpen(true)} />
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
    </div>
  );
};

export default Dashboard;
