import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UserRole,
} from '@aegis-core/contracts';
import { useQueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { clearStoredSession, getStoredSession, setStoredSession } from '../lib/auth-storage';

import { apiClient } from '@/lib/api/client';


type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const storedSession = getStoredSession();

    if (!storedSession) {
      setIsBootstrapping(false);
      return;
    }

    let isActive = true;

    void apiClient
      .getMe()
      .then((currentUser) => {
        if (!isActive) {
          return;
        }

        const refreshedSession: AuthSession = {
          ...storedSession,
          user: currentUser,
        };

        setStoredSession(refreshedSession);
        setUser(currentUser);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        clearStoredSession();
        setUser(null);
      })
      .finally(() => {
        if (isActive) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const persistSession = (session: AuthSession) => {
    setStoredSession(session);
    setUser(session.user);
    queryClient.clear();
  };

  const login = async (payload: LoginPayload) => {
    const session = await apiClient.login(payload);
    persistSession(session);
  };

  const register = async (payload: RegisterPayload) => {
    const session = await apiClient.register(payload);
    persistSession(session);
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
    queryClient.clear();
  };

  const hasRole = (allowedRoles: UserRole[]) =>
    user ? allowedRoles.includes(user.role) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isBootstrapping,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
