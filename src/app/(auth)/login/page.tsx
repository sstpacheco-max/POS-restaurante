"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Lock, Fingerprint, Mail, Key, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, error } = useAuth() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
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
          <p className="text-slate-400">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-2xl text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@pos.com"
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Contraseña</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white p-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center flex-col text-center">
          <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest font-semibold">O ingresa con biometría</p>
          <button className="flex items-center justify-center w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 hover:text-white transition-colors group">
            <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
