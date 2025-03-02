import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<boolean>;
  register: (email: string, password: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      const success = await logoutUser();
      if (success) {
        setUser(null);
      }
      return success;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const registeredUser = await registerUser(email, password);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};