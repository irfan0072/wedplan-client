'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (
    emailOrData:
      | string
      | {
          email: string;
          name: string;
          image?: string;
          role?: string;
          accessToken?: string;
          idToken?: string;
          googleId?: string;
        },
    name?: string,
    image?: string,
    role?: string
  ) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    image?: string;
    businessName?: string;
    phone?: string;
  }) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user from token on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('wedplan_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err: any) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err: any) {
      console.error('Error refreshing user state:', err.message);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token && res.user) {
        localStorage.setItem('wedplan_token', res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);

        // Role-based redirect
        if (res.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (res.user.role === 'vendor') {
          router.push('/dashboard/vendor');
        } else {
          router.push('/dashboard/customer');
        }
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (
    emailOrData:
      | string
      | {
          email: string;
          name: string;
          image?: string;
          role?: string;
          accessToken?: string;
          idToken?: string;
          googleId?: string;
        },
    nameArg?: string,
    imageArg?: string,
    roleArg: string = 'customer'
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const payload =
        typeof emailOrData === 'string'
          ? { email: emailOrData, name: nameArg, image: imageArg, role: roleArg }
          : emailOrData;

      const res = await api.post('/auth/google', payload);
      if (res.success && res.token && res.user) {
        localStorage.setItem('wedplan_token', res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success(`Welcome, ${res.user.name}!`);

        if (res.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (res.user.role === 'vendor') {
          router.push('/dashboard/vendor');
        } else {
          router.push('/dashboard/customer');
        }
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Google authentication failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    image?: string;
    businessName?: string;
    phone?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', data);
      if (res.success && res.token && res.user) {
        localStorage.setItem('wedplan_token', res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success('Registration successful! Welcome to WedPlan.');

        if (res.user.role === 'vendor') {
          router.push('/dashboard/vendor');
        } else {
          router.push('/dashboard/customer');
        }
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.success && res.user) {
        setUser(res.user);
        toast.success('Profile updated successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('wedplan_token');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
    router.push('/login');
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        googleLogin,
        register,
        updateProfile,
        logout,
        refreshUser,
        isAuthenticated,
        isAdmin,
        isVendor,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
