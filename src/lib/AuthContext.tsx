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
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage on load (Mock persistence)
    const storedUser = localStorage.getItem("punto_pos_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Protect routes
    if (!user && pathname !== "/" && pathname !== "/login") {
       // Avoid redirecting immediately on hydration if we haven't checked storage yet, 
       // but for simplicity in this mock, we let the protected layout handle redirects.
    }
  }, [user, pathname]);

  const login = (role: Role) => {
    const mockUser: User = {
      id: "1",
      name: role === "admin" ? "Admin Supremo" : role === "cajero" ? "Juan Cajero" : "Pedro Mesero",
      role,
    };
    setUser(mockUser);
    localStorage.setItem("punto_pos_user", JSON.stringify(mockUser));
    router.push("/dashboard"); // Default landing after login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("punto_pos_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
