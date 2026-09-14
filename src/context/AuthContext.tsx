import * as React from 'react';
import type { User } from '../types/user';
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  getSession,
  setSession,
  updateUser,
  DEFAULT_AVATAR,
} from '../services/storage';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  register: (data: {
    name: string;
    email: string;
    password: string;
    avatar: string;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: {
    avatar?: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => void;
  refreshUser: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshUser = React.useCallback(() => {
    const session = getSession();
    if (!session) {
      setUser(null);
      return;
    }
    const found = findUserById(session.userId);
    setUser(found ?? null);
    if (!found) {
      setSession(null);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, [refreshUser]);

  const register = React.useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      avatar: string;
    }) => {
      if (findUserByEmail(data.email)) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: data.avatar || DEFAULT_AVATAR,
      };
      createUser(newUser);
      setSession({ userId: newUser.id });
      setUser(newUser);
      return { success: true };
    },
    [],
  );

  const login = React.useCallback(async (email: string, password: string) => {
    const found = findUserByEmail(email);
    if (!found || found.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }
    setSession({ userId: found.id });
    setUser(found);
    return { success: true };
  }, []);

  const logout = React.useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  const updateProfile = React.useCallback(
    async (data: { avatar?: string; password?: string }) => {
      if (!user) {
        return { success: false, error: 'Not authenticated.' };
      }
      if (data.password && data.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      const updated: User = {
        ...user,
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.password ? { password: data.password } : {}),
      };
      updateUser(updated);
      setUser(updated);
      return { success: true };
    },
    [user],
  );

  const deleteAccount = React.useCallback(() => {
    if (!user) return;
    deleteUser(user.id);
    setSession(null);
    setUser(null);
  }, [user]);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      register,
      login,
      logout,
      updateProfile,
      deleteAccount,
      refreshUser,
    }),
    [user, isLoading, register, login, logout, updateProfile, deleteAccount, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
