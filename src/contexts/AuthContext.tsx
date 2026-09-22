"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PortalType, UserRole } from '@/types';
import { apiLogin, apiRegister, apiGetMe, apiSocialAuth, AuthUser, RegisterInput } from '@/services/auth.service';
import { setToken, getToken, removeToken } from '@/lib/api';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';

const ROLE_PORTALS: Record<UserRole, PortalType> = {
  farmer: 'farmer',
  buyer: 'marketplace',
  supplier: 'marketplace',
  inspector: 'operations',
  logistics: 'operations',
  support: 'support',
  admin: 'admin',
};

const PORTAL_LABELS: Record<PortalType, string> = {
  farmer: 'Farmer',
  marketplace: 'Marketplace',
  operations: 'Operations',
  support: 'Support',
  admin: 'Admin',
};

const PORTAL_DESCRIPTIONS: Record<PortalType, string> = {
  farmer: 'Manage your farms, fields, crops, and harvests',
  marketplace: 'Buy and sell produce and farming inputs',
  operations: 'Quality inspections and delivery tracking',
  support: 'Disputes, help desk, and resolution center',
  admin: 'Full platform administration and control',
};

const PORTAL_ICONS: Record<PortalType, string> = {
  farmer: '🌾',
  marketplace: '🛒',
  operations: '🔍',
  support: '🎧',
  admin: '🛡️',
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  portal: PortalType | null;
  selectedPortal: PortalType | null;
  availablePortals: PortalType[];
  login: (email: string, password: string) => Promise<{ needsPortalSelection: boolean }>;
  register: (data: RegisterInput) => Promise<void>;
  selectPortal: (portal: PortalType) => void;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  getPortalLabel: (portal: PortalType) => string;
  getPortalDescription: (portal: PortalType) => string;
  getPortalIcon: (portal: PortalType) => string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  portal: null,
  selectedPortal: null,
  availablePortals: [],
  login: async () => ({ needsPortalSelection: false }),
  register: async () => {},
  selectPortal: () => {},
  logout: () => {},
  loginWithGoogle: async () => {},
  loginWithGitHub: async () => {},
  getPortalLabel: () => '',
  getPortalDescription: () => '',
  getPortalIcon: () => '',
});

const USER_KEY = 'farmPath_user';
const PORTAL_KEY = 'farmPath_portal';

function getPortalsForRoles(roles: string[]): PortalType[] {
  const portals = new Set<PortalType>();
  roles.forEach((role) => {
    const portal = ROLE_PORTALS[role as UserRole];
    if (portal) portals.add(portal);
  });
  return Array.from(portals);
}

function makeInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

async function syncSocialUser(firebaseUser: FirebaseUser): Promise<{ token: string; user: AuthUser }> {
  return apiSocialAuth({
    firebaseUid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    phone: firebaseUser.phoneNumber || '',
    role: 'farmer',
    avatarUrl: firebaseUser.photoURL || '',
  });
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        const userData = await apiGetMe();
        setUser(userData);

        const savedPortal = localStorage.getItem(PORTAL_KEY) as PortalType | null;
        const available = getPortalsForRoles(userData.roles);

        if (savedPortal && available.includes(savedPortal)) {
          setSelectedPortal(savedPortal);
        } else if (available.length === 1) {
          setSelectedPortal(available[0]);
          localStorage.setItem(PORTAL_KEY, available[0]);
        }
      } catch {
        removeToken();
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PORTAL_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));

    const available = getPortalsForRoles(result.user.roles);

    if (available.length === 1) {
      setSelectedPortal(available[0]);
      localStorage.setItem(PORTAL_KEY, available[0]);
    }

    router.push('/');
    return { needsPortalSelection: available.length > 1 };
  }, [router]);

  const register = useCallback(async (data: RegisterInput) => {
    await apiRegister(data);
  }, []);

  const selectPortal = useCallback((portal: PortalType) => {
    setSelectedPortal(portal);
    localStorage.setItem(PORTAL_KEY, portal);
    router.push('/');
  }, [router]);

  const logout = useCallback(() => {
    try {
      firebaseSignOut(auth).catch(() => {});
    } catch {}
    setUser(null);
    setSelectedPortal(null);
    removeToken();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PORTAL_KEY);
    router.push('/');
  }, [router]);

  const syncAndRedirect = useCallback(
    async (firebaseUser: FirebaseUser) => {
      try {
        const result = await syncSocialUser(firebaseUser);
        setToken(result.token);
        setUser(result.user);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));

        const available = getPortalsForRoles(result.user.roles);
        if (available.length === 1) {
          setSelectedPortal(available[0]);
          localStorage.setItem(PORTAL_KEY, available[0]);
        }

        router.push('/');
      } catch (err) {
        console.error('Backend sync failed:', err);
        throw err;
      }
    },
    [router]
  );

  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await syncAndRedirect(result.user);
  }, [syncAndRedirect]);

  const loginWithGitHub = useCallback(async () => {
    const result = await signInWithPopup(auth, githubProvider);
    await syncAndRedirect(result.user);
  }, [syncAndRedirect]);

  const availablePortals = user ? getPortalsForRoles(user.roles) : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        portal: selectedPortal,
        selectedPortal,
        availablePortals,
        login,
        register,
        selectPortal,
        logout,
        loginWithGoogle,
        loginWithGitHub,
        getPortalLabel: (portal) => PORTAL_LABELS[portal],
        getPortalDescription: (portal) => PORTAL_DESCRIPTIONS[portal],
        getPortalIcon: (portal) => PORTAL_ICONS[portal],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
