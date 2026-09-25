"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { apiLogin, apiLoginWithIdentifier, apiLogout, apiMe, apiRegister, apiSendOtp, apiVerifyOtp } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  wallet: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
}

interface RegisterResult {
  ok: boolean;
  error?: string;
  pendingUserId?: string;
  mockOtp?: string | null;
  delivery?: "email" | "mock" | "failed";
  sentTo?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  sendOtp: (identifier: string, purpose?: string, userId?: string) => Promise<{ ok: boolean; error?: string; mockOtp?: string | null; delivery?: "email" | "mock" | "failed"; sentTo?: string }>;
  verifyOtp: (identifier: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string; uid: string; team: string }) => Promise<RegisterResult>;
  verifyRegistration: (pendingUserId: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiMe().then((res) => {
      if (cancelled) return;
      setUser(res.user);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await apiLoginWithIdentifier(identifier, password);
    if (!res.ok || !res.user) {
      return { ok: false, error: res.error || "Login failed." };
    }
    setUser(res.user);
    return { ok: true };
  }, []);

  const sendOtp = useCallback(async (identifier: string, purpose = "login", userId?: string) => {
    return apiSendOtp(identifier, purpose, userId);
  }, []);

  const verifyOtp = useCallback(async (identifier: string, otp: string) => {
    const res = await apiVerifyOtp({ identifier, otp, purpose: "login" });
    if (!res.ok || !res.user) {
      return { ok: false, error: res.error || "Verification failed." };
    }
    setUser(res.user);
    return { ok: true };
  }, []);

  const register = useCallback(async (data: { name: string; email: string; phone: string; password: string; uid: string; team: string }) => {
    const res = await apiRegister(data);
    if (!res.ok) {
      return { ok: false, error: res.error || "Registration failed." };
    }
    return { ok: true, pendingUserId: res.pendingUserId, mockOtp: res.mockOtp, delivery: res.delivery, sentTo: res.sentTo, error: res.error };
  }, []);

  const verifyRegistration = useCallback(async (pendingUserId: string, otp: string) => {
    const res = await apiVerifyOtp({ userId: pendingUserId, otp, purpose: "register" });
    if (!res.ok || !res.user) {
      return { ok: false, error: res.error || "Verification failed." };
    }
    setUser(res.user);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, sendOtp, verifyOtp, register, verifyRegistration, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
