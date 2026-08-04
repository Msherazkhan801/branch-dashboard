"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { getUserByCredentials, PERMISSIONS, Permission, UserRecord } from "@/lib/auth";

interface AuthContextValue {
  user: UserRecord | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "branch-dashboard-auth";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed: UserRecord = JSON.parse(stored);
        setUser(parsed);
      } catch (err) {
        console.warn("Failed to restore auth state:", err);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitializing(false);
  }, []);

  const login = async (email: string, password: string) => {
    const user = await getUserByCredentials(email, password);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    setUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.[permission] ?? false;
  };

  const value = useMemo(
    () => ({ user, initializing, login, logout, hasPermission }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
