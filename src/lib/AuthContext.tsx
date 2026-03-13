"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "admin" | "cajero" | "mesero";

interface User {
  id: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isInitialized: boolean;
  error: string | null;
  activeSession: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const APP_DATA_VERSION = "2"; // Increment to force-update INITIAL_USERS
const INITIAL_USERS = [
  { id: "1", name: "Carlos López", email: "carlos@pospro.com", role: "Admin", status: "Activo", lastLogin: "Hace 2 horas", password: "123", biometricEnabled: true, cashBase: 0 },
  { id: "2", name: "Ana Gómez", email: "ana@pospro.com", role: "Cajero", status: "Activo", lastLogin: "Hace 5 mins", password: "123", biometricEnabled: false, cashBase: 200000 },
  { id: "3", name: "Pacheco Max", email: "sst.pacheco@gmail.com", role: "Admin", status: "Activo", lastLogin: "Hace poco", password: "123", biometricEnabled: true, cashBase: 0 },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const refreshSession = () => {
    if (!user) {
      setActiveSession(null);
      return;
    }
    const sessions = JSON.parse(localStorage.getItem("punto_pos_cash_sessions") || "[]");
    const session = sessions.find((s: any) => s.userId === user.id && s.status === "open");
    setActiveSession(session || null);
  };

  useEffect(() => {
    // Check localStorage on load (Mock persistence)
    const storedUser = localStorage.getItem("punto_pos_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Seed/Update default users
    const currentVersion = localStorage.getItem("punto_pos_users_version");
    const storedUsersString = localStorage.getItem("punto_pos_users");
    
    if (!storedUsersString || currentVersion !== APP_DATA_VERSION) {
      let finalUsers = INITIAL_USERS;
      if (storedUsersString) {
        const existingUsers = JSON.parse(storedUsersString);
        // Ensure sst.pacheco@gmail.com exists in the list
        if (!existingUsers.find((u: any) => u.email === INITIAL_USERS[2].email)) {
          finalUsers = [...existingUsers, INITIAL_USERS[2]];
        } else {
          // If already there but version mismatch, update role/password just in case
          finalUsers = existingUsers.map((u: any) => 
            u.email === INITIAL_USERS[2].email ? { ...u, ...INITIAL_USERS[2] } : u
          );
        }
      }
      localStorage.setItem("punto_pos_users", JSON.stringify(finalUsers));
      localStorage.setItem("punto_pos_users_version", APP_DATA_VERSION);
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const storedUsers = localStorage.getItem("punto_pos_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        setError("Usuario no encontrado.");
        return false;
      }

      if (foundUser.password !== password) {
        setError("Contraseña incorrecta.");
        return false;
      }

      if (foundUser.status !== "Activo") {
        setError("Tu cuenta está inactiva. Contacta al administrador.");
        return false;
      }

      const role = foundUser.role.toLowerCase() as Role;
      const sessionUser: User = {
        id: String(foundUser.id),
        name: foundUser.name,
        role: role,
      };

      setUser(sessionUser);
      localStorage.setItem("punto_pos_user", JSON.stringify(sessionUser));
      
      if (role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/pos");
      }
      return true;
    } catch (e) {
      setError("Error al iniciar sesión. Inténtalo de nuevo.");
      return false;
    }
  };

  const logout = () => {
    // Session closing guard for cashiers
    if (activeSession && user?.role === "cajero") {
      alert("⚠️ Debes realizar el Arqueo y Cierre de Caja antes de cerrar sesión.");
      router.push("/pos");
      return;
    }

    setUser(null);
    setActiveSession(null);
    localStorage.removeItem("punto_pos_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitialized, error, activeSession, refreshSession } as any}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
