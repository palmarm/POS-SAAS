import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  branch_id: number;
  business_id: number;
  phone?: string;
  is_active: boolean;
}

interface Business {
  id: number;
  name: string;
  subscription?: {
    plan: string;
    status: string;
    next_billing_date: string;
  };
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isCashier: () => boolean;
  hasRole: (role: string) => boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedBusiness = localStorage.getItem('business');

    if (token && storedUser && storedBusiness) {
      try {
        // Verify token with backend
        const response = await authAPI.getProfile();
        setUser(response.data.data);
        setBusiness({
            id: response.data.data.business_id,
            name: response.data.data.business_name,
            subscription: response.data.data.subscription_status ? {
                plan: response.data.data.plan_name,
                status: response.data.data.subscription_status,
                next_billing_date: response.data.data.next_billing_date,
            } : undefined
        });
      } catch (error) {
        console.error('Token invalid:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login(email, password);
      const { user, business, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('business', JSON.stringify(business));
      
      setUser(user);
      setBusiness(business);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
        try {
            setError(null);
            setLoading(true);
            
            const response = await authAPI.register(data);
            return { success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('business');
    localStorage.removeItem('user');
    setUser(null);
    setBusiness(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager' || user?.role === 'admin';
  const isCashier = () => user?.role === 'cashier';
  const hasRole = (role: string) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        error,
        login,
        logout,
        register,
        isAdmin,
        isManager,
        isCashier,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};