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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage on load (Mock persistence)
    const storedUser = localStorage.getItem("punto_pos_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      // Get users from localStorage (populated in users page)
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
      
      // Direct landing based on role
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
    setUser(null);
    localStorage.removeItem("punto_pos_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitialized } as any}>
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
