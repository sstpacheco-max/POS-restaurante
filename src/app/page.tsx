"use client";

import { LayoutDashboard, ShoppingCart, Users, Settings, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center relative overflow-hidden"
      style={{ backgroundImage: "url('/restaurant-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[3px]"></div>
      
      <div className="relative z-10 p-12 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl max-w-2xl w-full space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center">
          <div className="p-4 bg-primary rounded-2xl shadow-[0_0_40px_-5px_#3b82f6] ring-2 ring-primary/50">
            <UtensilsCrossed className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-lg">
            La Española <span className="text-blue-400 italic">Restaurante</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md mx-auto drop-shadow-md font-medium">
            Terminal de Transporte - Gestión Inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
            <ShoppingCart className="w-8 h-8 text-blue-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-semibold block text-slate-200">Ventas</span>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
            <LayoutDashboard className="w-8 h-8 text-indigo-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-semibold block text-slate-200">Dashboard</span>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
            <Users className="w-8 h-8 text-emerald-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-semibold block text-slate-200">Usuarios</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          {user ? (
            <Link href="/dashboard" className="inline-block px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
              Ir al Panel de Control ({user.role})
            </Link>
          ) : (
            <Link href="/login" className="inline-block px-8 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-sm text-slate-400 font-medium relative z-10 drop-shadow-sm">
        © 2026 Punto POS Española - Solución Multi-Empresa
      </p>
    </div>
  );
}
