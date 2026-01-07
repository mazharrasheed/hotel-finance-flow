
export interface Permissions {
  [key: string]: any;
  canTakeBackup?: boolean;
  canAddTransaction?: boolean;
  canViewReports?: boolean;
  canEditTransaction?: boolean;
  canDeleteTransaction?: boolean;
}

export type UserRole = 'admin' | 'user';
export type AppTheme = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';

export interface User {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  password?: string;
  role?: UserRole;
  is_staff?: boolean;
  is_superuser?: boolean;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  website?: string;
  theme?: AppTheme;
  permissions: Permissions;
  // user_permissions is the raw array of permissions from the Django backend used for user administration
  user_permissions?: any[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  color: string;
  icon: string;
}

export type TransactionType = 'income' | 'expense' | 'investment';

export interface Transaction {
  id: string;
  project?: string | null; 
  date: string;
  type: TransactionType;
  amount: number;
  note: string;
}
