import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import socketManager from '../utils/socket';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  coupleCode?: string;
  coupleId?: string;
  partnerId?: string;
  partner?: any;
  isOnline?: boolean;
  lastSeen?: Date;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate
    const token = localStorage.getItem('pairplay_token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.user;
      setUser(userData);
      
      // Connect socket with user ID
      socketManager.connect(userData.id);
      
    } catch (error) {
      console.error('Failed to refresh user:', error);
      localStorage.removeItem('pairplay_token');
      localStorage.removeItem('pairplay_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('pairplay_token', token);
      localStorage.setItem('pairplay_user', JSON.stringify(userData));
      
      setUser(userData);
      
      // Connect socket
      socketManager.connect(userData.id);
      
      toast.success('Welcome back! 💕');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await authAPI.register({ email, password, name });
      const { token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('pairplay_token', token);
      localStorage.setItem('pairplay_user', JSON.stringify(userData));
      
      setUser(userData);
      
      // Connect socket
      socketManager.connect(userData.id);
      
      toast.success('Account created! Share your couple code with your partner 💕');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('pairplay_token');
      localStorage.removeItem('pairplay_user');
      setUser(null);
      
      // Disconnect socket
      socketManager.disconnect();
      
      toast.success('Goodbye! See you soon 👋');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('pairplay_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};