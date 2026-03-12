"use client";

import { useAuth, Role } from "@/lib/AuthContext";
import { Lock, Fingerprint, Store, UserCheck, Users } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = (role: Role) => {
    login(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 text-white mb-4 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Acceso al POS</h2>
          <p className="text-slate-400">Inicia sesión para gestionar el negocio</p>
        </div>

        <div className="space-y-4">
          <button 
             onClick={() => handleLogin('admin')}
             className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-4 rounded-xl transition-all group"
          >
             <div className="flex items-center gap-4">
               <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                 <Store size={24} />
               </div>
               <div className="text-left">
                 <p className="font-bold text-lg">Administrador/Gerente</p>
                 <p className="text-xs text-slate-400">Acceso total (Dashboard, Usuarios)</p>
               </div>
             </div>
          </button>

          <button 
             onClick={() => handleLogin('cajero')}
             className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-4 rounded-xl transition-all group"
          >
             <div className="flex items-center gap-4">
               <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                 <UserCheck size={24} />
               </div>
               <div className="text-left">
                 <p className="font-bold text-lg">Cajero</p>
                 <p className="text-xs text-slate-400">Solo Punto de Venta y Mesas</p>
               </div>
             </div>
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center g flex-col text-center">
          <p className="text-xs text-slate-400 mb-4 uppercasse tracking-widest font-semibold">O ingresa con biometría</p>
          <button className="flex items-center justify-center w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 hover:text-white transition-colors group">
            <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
