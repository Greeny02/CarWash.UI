import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import { apiClient } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // TEMPORARY: Mock user for development without API
  // Remove this useEffect and uncomment the one below when API is ready
  useEffect(() => {
    // Mock admin user for development
    const mockUser: User = {
      id: 'mock-admin-id',
      email: 'admin@carwash.com',
      name: 'Admin User',
      role: 'admin'
    };
    setUser(mockUser);
    setLoading(false);
  }, []);

  /* UNCOMMENT THIS WHEN API IS READY:
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  */

  const login = async (email: string, password: string) => {
    const { user, token } = await apiClient.login(email, password);
    apiClient.setToken(token);
    setUser(user);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}