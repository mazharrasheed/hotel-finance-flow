
import { Project, Transaction } from '../types';

// Replace 'your-username' with your actual PythonAnywhere username
const PYTHON_ANYWHERE_USERNAME = 'projectsfinanceflow'; 
const API_BASE = `https://${PYTHON_ANYWHERE_USERNAME}.pythonanywhere.com/api`;

export const apiService = {
  // Project endpoints
fetchProjects: async (): Promise<Project[]> => {
  console.log("i mhrer")
  try {
    const res = await fetch(`${API_BASE}/projects/`);
    if (!res.ok) throw new Error('Failed to fetch projects');

    console.log(res)

    const data: Project[] = await res.json();
    console.log(data)

    // Optional normalization for future numeric fields
    return data.map(p => ({
      ...p,
      // Example: if you had a budget field: budget: Number(p.budget || 0),
    }));

  } catch (error) {
    console.warn('API fetchProjects failed, using local storage fallback');
    const local = localStorage.getItem('finance_projects');
    if (!local) return [];

    const parsed: Project[] = JSON.parse(local);

    return parsed.map(p => ({
      ...p,
      // Normalize numeric fields if any
      // budget: Number(p.budget || 0),
    }));
  }
},


  createProject: async (name: string, description: string, icon: string): Promise<Project> => {
    const projectData = {
      name,
      description,
      icon,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    };
    
    try {
      const res = await fetch(`${API_BASE}/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    } catch (error) {
      // Fallback for demo/offline
      const newProj = { ...projectData, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
      return newProj as Project;
    }
  },

  updateProject: async (id: string, name: string, description: string, icon: string): Promise<Project> => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, icon }),
      });
      if (!res.ok) throw new Error('Failed to update project');
      return res.json();
    } catch (error) {
      throw error;
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  
  // Transaction endpoints

  // Fetch all transactions
  fetchTransactions: async (): Promise<Transaction[]> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/`);
      if (!res.ok) throw new Error('Failed to fetch transactions');

      const data: Transaction[] = await res.json();
      // Normalize amount to number
      return data.map(t => ({ ...t, amount: Number(t.amount) }));

    } catch (error) {
      console.warn('API fetchTransactions failed, using local storage fallback');
      const local = localStorage.getItem('finance_transactions');
      if (!local) return [];

      const parsed: Transaction[] = JSON.parse(local);
      return parsed.map(t => ({ ...t, amount: Number(t.amount) }));
    }
  },

  // Create a new transaction
  createTransaction: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Bad Request Details:', errorData);
        throw new Error('Failed to add transaction');
      }

      const t: Transaction = await res.json();
      // Normalize amount to number
      return { ...t, amount: Number(t.amount) };

    } catch (error) {
      console.error('Transaction creation error:', error);
      // Fallback: create a temporary transaction in-memory
      return { ...data, id: Math.random().toString(36).substr(2, 9), amount: Number(data.amount) } as Transaction;
    }
  },

  // Update an existing transaction
  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update transaction');

      const t: Transaction = await res.json();
      // Normalize amount to number
      return { ...t, amount: Number(t.amount) };

    } catch (error) {
      console.error('Transaction update error:', error);
      throw error;
    }
  },

  // Delete a transaction
  deleteTransaction: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/transactions/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete transaction');
  }
}




