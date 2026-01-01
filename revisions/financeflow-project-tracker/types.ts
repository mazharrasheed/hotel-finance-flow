
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  color: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  projectId: string;
  date: string; // ISO format
  type: TransactionType;
  amount: number;
  note: string;
}

export interface DayStats {
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}
