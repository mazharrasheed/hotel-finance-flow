
export interface Permissions {
  canViewDashboard: boolean;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canAddTransaction: boolean;
  canEditTransaction: boolean;
  canDeleteTransaction: boolean;
  canViewReports: boolean;
  canTakeBackup: boolean;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  permissions: Permissions;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  website?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  color: string;
  icon: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  project: string; // Matches Django ForeignKey field name
  date: string;
  type: TransactionType;
  amount: number;
  note: string;
}
