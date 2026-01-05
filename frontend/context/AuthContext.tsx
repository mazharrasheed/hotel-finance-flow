
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import { User, Permissions } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: Permissions;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  hasPerm: (perm: string, appLabel?: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ff_token'));
  const [permissions, setPermissions] = useState<Permissions>({});
  const [isLoading, setIsLoading] = useState(true);
  const initializationRef = useRef(false);

  // Normalize Django permission array to object map with prefix support and convenience flags
  const normalizePermissions = (permsArray: any[]): Permissions => {
    const perms: Permissions = {};
    if (Array.isArray(permsArray)) {
      permsArray.forEach(p => {
        if (p.codename) {
          // Store raw codename
          perms[p.codename] = true;
          // Store app-prefixed version (e.g., finance.add_transaction)
          if (p.app_label) {
            perms[`${p.app_label}.${p.codename}`] = true;
          }
        }
      });
    }

    // Populate convenience properties used by Navbar and CalendarView
    perms.canTakeBackup = !!(perms.can_backup || perms['finance.can_backup'] || perms.is_superuser);
    perms.canAddTransaction = !!(perms.add_transaction || perms['finance.add_transaction']);
    perms.canViewReports = !!(perms.view_reports || perms['finance.view_reports'] || perms.view_ledger || perms['finance.view_ledger']);
    perms.canEditTransaction = !!(perms.change_transaction || perms['finance.change_transaction']);
    perms.canDeleteTransaction = !!(perms.delete_transaction || perms['finance.delete_transaction']);

    return perms;
  };

  const fetchUserData = useCallback(async (authToken: string) => {
    if (!authToken) return false;

    try {
      const [userResponse, userPerms] = await Promise.all([
        authService.getCurrentUser(authToken),
        authService.getPermissions(authToken)
      ]);

      const userData = Array.isArray(userResponse) ? userResponse[0] : userResponse;
      if (!userData || typeof userData !== 'object') throw new Error("Invalid user data");

      const firstName = userData.first_name || userData.username || 'User';
      const lastName = userData.last_name || '';

      const normalizedPerms = normalizePermissions(userPerms);

      const enrichedUser: User = {
        ...userData,
        name: `${firstName} ${lastName}`.trim(),
        permissions: normalizedPerms
      };

      setUser(enrichedUser);
      setPermissions(normalizedPerms);
      return true;
    } catch (err) {
      console.error("Auth initialization failed:", err);
      setUser(null);
      setPermissions({});
      setToken(null);
      localStorage.removeItem('ff_token');
      return false;
    }
  }, []);

  useEffect(() => {
    if (initializationRef.current) return;

    const init = async () => {
      if (token) await fetchUserData(token);
      setIsLoading(false);
      initializationRef.current = true;
    };

    init();
  }, [token, fetchUserData]);

  const login = async (newToken: string) => {
    if (!newToken) throw new Error("No token provided");

    setIsLoading(true);
    localStorage.setItem('ff_token', newToken);
    setToken(newToken);

    await fetchUserData(newToken);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('ff_token');
    setToken(null);
    setUser(null);
    setPermissions({});
    initializationRef.current = false;
  };

  const hasPerm = (perm: string, appLabel?: string): boolean => {
    if (user?.is_superuser) return true;
    if (appLabel) {
      const fullPath = `${appLabel}.${perm}`;
      return !!permissions[fullPath] || !!permissions[perm];
    }
    return !!permissions[perm];
  };

  const refreshUser = async () => {
    if (token) await fetchUserData(token);
  };

  return (
    <AuthContext.Provider value={{ user, token, permissions, isLoading, login, logout, hasPerm, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
