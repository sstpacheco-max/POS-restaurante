"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  UtensilsCrossed,
  Receipt
} from "lucide-react";

export default function Sidebar() {
  const { user, logout, activeSession } = useAuth() as any;
  
  if (!user) return null;

  const isAdmin = user.role?.toLowerCase() === "admin";
  const isCajero = user.role?.toLowerCase() === "cajero";

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
        <div className="p-2 bg-primary rounded-lg bg-opacity-20 text-primary">
          <UtensilsCrossed size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide">Punto POS</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pro Edition</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">Principal</div>
        
        {isAdmin && (
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
            <LayoutDashboard size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
            <span className="font-medium">Dashboard</span>
          </Link>
        )}
        <Link href="/pos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
          <ShoppingCart size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
          <span className="font-medium">Punto de Venta</span>
        </Link>
        <Link href="/tables" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
          <UtensilsCrossed size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
          <span className="font-medium">Mesas y Pedidos</span>
        </Link>
        
        {isAdmin && (
          <>
            <div className="mt-8 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">Administración</div>
            
            <Link href="/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
              <Package size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
              <span className="font-medium">Inventario y Escandallos</span>
            </Link>
            <Link href="/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
              <Users size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
              <span className="font-medium">Usuarios y Roles</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
              <Settings size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
              <span className="font-medium">Configuración</span>
            </Link>
          </>
        )}

        {isCajero && activeSession && (
          <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">
            <div className="mb-2 text-xs font-semibold text-orange-400 uppercase tracking-wider px-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              Turno Abierto
            </div>
            <Link href="/pos?action=arqueo" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors group">
              <Receipt size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold">Realizar Arqueo</span>
            </Link>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
