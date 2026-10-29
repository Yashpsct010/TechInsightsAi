'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { AuthResponse } from '../services/authService';

export interface User extends AuthResponse {}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePreferences: (preferences?: string[], newsletterSubscribed?: boolean) => Promise<boolean>;
  toggleBookmark: (blogId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Check if user is stored locally on mount
    const checkUserLoggedIn = async () => {
      if (typeof window === 'undefined') return;

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        const profile = await authService.getProfile();

        if (isMounted) {
          const mergedUser: User = {
            ...profile,
            token: parsedUser.token,
            bookmarks: profile.bookmarks || [],
          };
          setUser(mergedUser);
          localStorage.setItem('user', JSON.stringify(mergedUser));
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Session verification failed:', err);
          if (err.response?.status === 401 || err.message?.includes('401')) {
            setUser(null);
            localStorage.removeItem('user');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkUserLoggedIn();

    // Listen to unauthorized interceptor event from Axios
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.login(email, password);
      const normalizedUser: User = {
        ...userData,
        bookmarks: userData.bookmarks || [],
      };
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.register(email, password);
      const normalizedUser: User = {
        ...userData,
        bookmarks: userData.bookmarks || [],
      };
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updatePreferences = async (
    preferences?: string[],
    newsletterSubscribed?: boolean
  ): Promise<boolean> => {
    try {
      const data = await authService.updatePreferences(preferences, newsletterSubscribed);
      setUser((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          preferences: data.preferences ?? prev.preferences,
          newsletterSubscribed: data.newsletterSubscribed ?? prev.newsletterSubscribed,
        };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      return false;
    }
  };

  const toggleBookmark = async (blogId: string): Promise<boolean> => {
    if (!user) return false;

    const currentBookmarks = user.bookmarks || [];
    const isAdding = !currentBookmarks.includes(blogId);

    // Optimistic UI update
    setUser((prev) => {
      if (!prev) return null;
      const nextBookmarks = isAdding
        ? [...prev.bookmarks, blogId]
        : prev.bookmarks.filter((id) => id !== blogId);
      return { ...prev, bookmarks: nextBookmarks };
    });

    try {
      const updatedBookmarks = await authService.toggleBookmark(blogId);
      setUser((prev) => {
        if (!prev) return null;
        const updated = { ...prev, bookmarks: updatedBookmarks };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (err: any) {
      // Revert optimistic update
      setUser((prev) => {
        if (!prev) return null;
        const revertedBookmarks = isAdding
          ? prev.bookmarks.filter((id) => id !== blogId)
          : [...prev.bookmarks, blogId];
        return { ...prev, bookmarks: revertedBookmarks };
      });
      setError(err.response?.data?.message || err.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updatePreferences,
        toggleBookmark,
      }}
    >
      {/* V2 Improvement: Render children immediately so public routes load with Zero TTFB */}
      {children}
    </AuthContext.Provider>
  );
};
