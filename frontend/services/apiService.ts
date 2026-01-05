
import { Project, Transaction, User } from '../types';

const PYTHON_ANYWHERE_USERNAME = 'projectsfinanceflow'; 
const API_BASE = `https://${PYTHON_ANYWHERE_USERNAME}.pythonanywhere.com/api`;

const getHeaders = () => {
  const token = localStorage.getItem('ff_token');
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;
  return headers;
};

export const apiService = {
  fetchProjects: async (): Promise<Project[]> => {
    try {
      const res = await fetch(`${API_BASE}/projects/`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return await res.json();
    } catch (error) {
      console.error('API fetchProjects failed:', error);
      return [];
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
        headers: getHeaders(),
        body: JSON.stringify(projectData),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    } catch (error) {
      console.error('Project creation failed:', error);
      throw error;
    }
  },

  updateProject: async (id: string, name: string, description: string, icon: string): Promise<Project> => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ name, description, icon }),
      });
      if (!res.ok) throw new Error('Failed to update project');
      return res.json();
    } catch (error) {
      console.error('Project update failed:', error);
      throw error;
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/projects/${id}/`, { 
      method: 'DELETE',
      headers: getHeaders() 
    });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  fetchTransactions: async (): Promise<Transaction[]> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data: Transaction[] = await res.json();
      return data.map(t => ({ ...t, amount: Number(t.amount) }));
    } catch (error) {
      console.error('API fetchTransactions failed:', error);
      return [];
    }
  },

  createTransaction: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      const payload: any = { ...data };
      if (payload.project === null || payload.project === undefined || payload.project === "") {
        delete payload.project;
      }
      payload.amount = parseFloat(payload.amount.toString()).toFixed(2);

      const res = await fetch(`${API_BASE}/transactions/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to add transaction');
      const t: Transaction = await res.json();
      return { ...t, amount: Number(t.amount) };
    } catch (error) {
      console.error('Transaction creation error:', error);
      throw error;
    }
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      const t: Transaction = await res.json();
      return { ...t, amount: Number(t.amount) };
    } catch (error) {
      console.error('Transaction update error:', error);
      throw error;
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/transactions/${id}/`, { 
      method: 'DELETE',
      headers: getHeaders() 
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
  },

  fetchUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_BASE}/users/`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (error) {
      console.error('API fetchUsers failed:', error);
      return [];
    }
  },

  createUser: async (userData: any): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || errorData.username?.[0] || 'Failed to register user');
    }
    return res.json();
  },

  updateUser: async (id: string | number, userData: any): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || errorData.username?.[0] || 'Failed to update user');
    }
    return res.json();
  }
}
