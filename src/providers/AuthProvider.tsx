"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { hasPermission, hasRole } from "@/lib/permissionCheck";

interface AuthContextValue {
  user: CurrentUser;
  isAuthenticated: true;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  user: CurrentUser;
  children: ReactNode;
}

export default function AuthProvider({ user, children }: AuthProviderProps) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: true,
      hasPermission: (permission) => hasPermission(user, permission),
      hasRole: (role) => hasRole(user, role),
    }),
    [user],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
