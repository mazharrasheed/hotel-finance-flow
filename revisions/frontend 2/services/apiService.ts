
import { Project, Transaction } from '../types';

const API_BASE = '/api';

export const apiService = {
  // Project endpoints
  fetchProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${API_BASE}/projects/`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  // Fix: Added icon parameter to project creation API call
  createProject: async (name: string, description: string, icon: string): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        icon,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      }),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  // Fix: Added icon parameter to project update API call
  updateProject: async (id: string, name: string, description: string, icon: string): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, icon }),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  deleteProject: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  // Transaction endpoints
  fetchTransactions: async (): Promise<Transaction[]> => {
    const res = await fetch(`${API_BASE}/transactions/`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  createTransaction: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const res = await fetch(`${API_BASE}/transactions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add transaction');
    return res.json();
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const res = await fetch(`${API_BASE}/transactions/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/transactions/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete transaction');
  }
};
