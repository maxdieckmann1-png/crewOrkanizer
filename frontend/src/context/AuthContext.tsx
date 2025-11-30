import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginDto, RegisterDto } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isManagement: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginDto) => {
    const response = await authService.login(data);
    setUser(response.user as any);
  };

  const register = async (data: RegisterDto) => {
    const response = await authService.register(data);
    setUser(response.user as any);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.some((r: any) => r === role || r.name === role) || false;
  };

  const isManagement = hasRole('admin') || hasRole('management') || hasRole('team_lead');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isManagement,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
