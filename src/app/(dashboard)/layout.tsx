"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isInitialized } = useAuth() as any;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.push("/login");
    } else {
      // Normalize pathname (remove trailing slash for comparison)
      const cleanPath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
      
      if (user.role !== "admin" && (cleanPath === "/dashboard" || cleanPath.startsWith("/users") || cleanPath.startsWith("/inventory") || cleanPath.startsWith("/settings"))) {
        // Prevent non-admins from accessing dashboard and admin pages
        router.push("/pos");
      }
    }
  }, [user, isInitialized, router, pathname]);

  if (!isInitialized || !user) return null; // Prevent hydration mismatch Flash of Unauthenticated Content

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <h2 className="text-lg font-semibold text-slate-800">Punto de Venta Multi-Empresa</h2>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
               <p className="text-xs text-slate-500 capitalize">{user.role}</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
               {user.name.charAt(0)}
             </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
