import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';
import { loginUser, signupUser } from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedHotspotId: string;
  setSelectedHotspotId: (id: string) => void;
  highlightedReportId: string | null;
  setHighlightedReportId: (id: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const defaultUser: UserSession = {
  email: 'saiprasadkawdikar25@gmail.com',
  name: 'Saiprasad Kawdikar',
  role: 'Regional Environmental Controller',
  department: 'Central Pollution Intelligence Directorate',
  jurisdiction: 'Maharashtra & NCR Inter-State Grid',
  sessionId: 'officer-demo-session',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('aeroveda_demo_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultUser;
      }
    }
    return defaultUser;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('hotspot-pune-corridor');
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aeroveda_demo_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('aeroveda_demo_session');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, password);
      setUser(res.user);
      setActiveTab('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await signupUser(email, password, name);
      setUser(res.user);
      setActiveTab('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aeroveda_demo_session');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeTab,
        setActiveTab,
        selectedHotspotId,
        setSelectedHotspotId,
        highlightedReportId,
        setHighlightedReportId,
        login,
        signup,
        logout,
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
