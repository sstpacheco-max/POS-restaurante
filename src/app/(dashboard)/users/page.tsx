"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Search, Plus, Shield, UserCog, UserCheck, Trash2, Edit2, Fingerprint, Lock, X, FileText, Printer, TrendingUp } from "lucide-react";

type Role = "Admin" | "Cajero" | "Mesero";

const INITIAL_USERS = [
  { id: 1, name: "Carlos López", email: "carlos@pospro.com", role: "Admin", status: "Activo", lastLogin: "Hace 2 horas", password: "123", biometricEnabled: true, cashBase: 0 },
  { id: 2, name: "Ana Gómez", email: "ana@pospro.com", role: "Cajero", status: "Activo", lastLogin: "Hace 5 mins", password: "123", biometricEnabled: false, cashBase: 200000 },
];

const ROLE_BADGES: Record<Role, { icon: any; color: string; bg: string }> = {
  Admin: { icon: Shield, color: "text-purple-700", bg: "bg-purple-100" },
  Cajero: { icon: UserCog, color: "text-blue-700", bg: "bg-blue-100" },
  Mesero: { icon: UserCheck, color: "text-emerald-700", bg: "bg-emerald-100" },
};

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({ status: "Activo", role: "Cajero", biometricEnabled: false, cashBase: "" });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [cashSessions, setCashSessions] = useState<any[]>([]);
  const [cashBaseGlobal, setCashBaseGlobal] = useState(0);
  const [cashBaseInput, setCashBaseInput] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUsers = localStorage.getItem("punto_pos_users");
    setUsers(storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS);
    if (!storedUsers) localStorage.setItem("punto_pos_users", JSON.stringify(INITIAL_USERS));

    const storedSales = localStorage.getItem("punto_pos_sales");
    if (storedSales) setSalesData(JSON.parse(storedSales));

    const storedSessions = localStorage.getItem("punto_pos_cash_sessions");
    if (storedSessions) setCashSessions(JSON.parse(storedSessions));

    const base = Number(localStorage.getItem("punto_pos_cash_base") || 0);
    setCashBaseGlobal(base);
    setCashBaseInput(String(base));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("punto_pos_users", JSON.stringify(users));
  }, [users, isLoaded]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => {
    setFormData({ status: "Activo", role: "Cajero", biometricEnabled: false, password: "", cashBase: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: any) => {
    setFormData({ ...user });
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Seguro que deseas eliminar este usuario?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Por favor completa el nombre, email y contraseña.");
      return;
    }
    const userToSave = { ...formData, cashBase: Number(formData.cashBase) || 0 };
    if (editingId) {
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...userToSave } : u)));
    } else {
      setUsers([...users, { ...userToSave, id: Date.now(), lastLogin: "Nunca" }]);
    }
    // Save per-cashier cash base
    if (formData.role === "Cajero" && formData.cashBase) {
      const key = `punto_pos_cash_base_${formData.name.replace(/\s+/g, "_")}`;
      const base = Number(formData.cashBase);
      localStorage.setItem(key, String(base));
      localStorage.setItem("punto_pos_cash_base", String(base));
      setCashBaseGlobal(base);
      setCashBaseInput(String(base));
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  // ── REPORT LOGIC ─────────────────────────────────────────────────────────
  const today = new Date();
  const todayStr = today.toDateString();
  const todaysSales = salesData.filter((s) => new Date(s.date).toDateString() === todayStr);
  const totalSalesToday = todaysSales.reduce((s, v) => s + v.total, 0);

  const byCashier = todaysSales.reduce(
    (acc, sale) => {
      const name = sale.cashier || "Cajero General";
      if (!acc[name]) acc[name] = { sales: 0, count: 0, cash: 0, card: 0, transfer: 0 };
      acc[name].sales += sale.total;
      acc[name].count += 1;
      if (sale.method === "Efectivo") acc[name].cash += sale.total;
      else if (sale.method === "Tarjeta") acc[name].card += sale.total;
      else acc[name].transfer += sale.total;
      return acc;
    },
    {} as Record<string, { sales: number; count: number; cash: number; card: number; transfer: number }>
  );

  const totalByMethod = {
    cash: todaysSales.filter((s) => s.method === "Efectivo").reduce((s, v) => s + v.total, 0),
    card: todaysSales.filter((s) => s.method === "Tarjeta").reduce((s, v) => s + v.total, 0),
    transfer: todaysSales.filter((s) => s.method === "Transferencia").reduce((s, v) => s + v.total, 0),
  };

  const cashInRegister = cashBaseGlobal + totalByMethod.cash;

  const getCashierBase = (name: string) => {
    const key = `punto_pos_cash_base_${name.replace(/\s+/g, "_")}`;
    const stored = localStorage.getItem(key);
    if (stored) return Number(stored);
    const user = users.find((u) => u.name === name);
    return user?.cashBase || 0;
  };

  const saveCashBase = () => {
    const val = Number(cashBaseInput);
    setCashBaseGlobal(val);
    localStorage.setItem("punto_pos_cash_base", String(val));
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open("", "_blank", "width=820,height=700");
    if (!win) return;
    win.document.write(`
      <html><head>
        <title>Reporte de Turno - ${today.toLocaleDateString("es-CO")}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;padding:28px;font-size:12px}
          h1{font-size:20px;font-weight:800}
          h2{font-size:13px;font-weight:700;margin:16px 0 6px;padding-bottom:3px;border-bottom:2px solid #e2e8f0;color:#1e293b}
          .header{display:flex;justify-content:space-between;border-bottom:3px solid #0f172a;padding-bottom:10px;margin-bottom:16px}
          .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}
          .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center}
          .kpi .label{font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:3px}
          .kpi .value{font-size:17px;font-weight:800;color:#0f172a}
          table{width:100%;border-collapse:collapse;margin-top:6px}
          th{background:#f1f5f9;padding:7px 8px;text-align:left;font-size:10px;text-transform:uppercase;color:#475569;border-bottom:1px solid #e2e8f0}
          td{padding:7px 8px;border-bottom:1px solid #f1f5f9;font-size:11px}
          .total-row{font-weight:800;background:#f8fafc}
          .green-box{background:#f0fdf4;border:2px solid #86efac;border-radius:7px;padding:14px;margin-top:16px}
          .delivery-row{display:flex;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px dashed #bbf7d0}
          .delivery-row:last-child{border:none;font-weight:800;font-size:13px;color:#166534;padding-top:7px}
          .sig{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:28px}
          .sig-line{border-top:1px solid #1e293b;padding-top:5px;text-align:center;font-size:10px;color:#475569}
          .footer{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;text-align:center;font-size:10px;color:#94a3b8}
        </style>
      </head><body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const reportDate = today.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usuarios y Roles</h1>
          <p className="text-slate-500 mt-1">Controla el acceso del personal mediante roles y biometría.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/30"
          >
            <FileText size={18} /> Reporte de Turno
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/30"
          >
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Total Usuarios: {users.length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Base de Caja</th>
                <th className="px-6 py-4">Acceso</th>
                <th className="px-6 py-4">Último Acceso</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const badge = ROLE_BADGES[(user.role as Role) || "Cajero"];
                const Icon = badge?.icon || UserCog;
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 relative overflow-hidden group border border-slate-300">
                          {user.name.charAt(0).toUpperCase()}
                          {user.biometricEnabled && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Fingerprint size={16} className="text-primary drop-shadow" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${badge?.bg} ${badge?.color}`}>
                        <Icon size={14} /> {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "Cajero" ? (
                        <span className="text-sm font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                          {formatCOP(user.cashBase || 0)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${user.status === "Activo" ? "text-emerald-600" : "text-slate-400"}`}>
                          <span className={`w-2 h-2 rounded-full ${user.status === "Activo" ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                          {user.status}
                        </span>
                        {user.biometricEnabled && (
                          <span className="flex items-center gap-1 text-[10px] text-primary/80 font-bold ml-3.5 uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded w-fit">
                            <Fingerprint size={10} /> Biometría
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEditClick(user)} className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10 mr-1">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No se encontraron usuarios.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── EXPORT / REPORT MODAL ──────────────────────────────────────────── */}
      {isExportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl"><FileText size={22} /></div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Reporte de Cierre de Turno</h3>
                  <p className="text-xs text-slate-500 capitalize">{reportDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all">
                  <Printer size={16} /> Imprimir / PDF
                </button>
                <button onClick={() => setIsExportOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Cash base override */}
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
              <p className="text-sm font-bold text-amber-800 whitespace-nowrap">⚙️ Base de Caja Global:</p>
              <input
                type="number"
                value={cashBaseInput}
                onChange={(e) => setCashBaseInput(e.target.value)}
                className="flex-1 p-2 border border-amber-300 rounded-xl outline-none focus:border-amber-500 bg-white font-semibold text-slate-800"
                placeholder="Ej: 200000"
              />
              <button onClick={saveCashBase} className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-all whitespace-nowrap">
                Guardar
              </button>
              <span className="text-sm text-amber-700 font-medium whitespace-nowrap">Actual: <b>{formatCOP(cashBaseGlobal)}</b></span>
            </div>

            {/* Printable report */}
            <div className="p-5 overflow-y-auto max-h-[65vh]">
              <div ref={printRef}>
                {/* Header */}
                <div className="header" style={{ display: "flex", justifyContent: "space-between", borderBottom: "3px solid #0f172a", paddingBottom: "10px", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 800 }}>🏪 Punto POS</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Reporte de Cierre de Turno</div>
                    <div style={{ fontSize: "11px", color: "#64748b", textTransform: "capitalize" }}>{reportDate}</div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "11px", color: "#64748b" }}>
                    <div>Impreso: {today.toLocaleTimeString("es-CO")}</div>
                    <div>Total ventas: {todaysSales.length}</div>
                  </div>
                </div>

                {/* KPIs */}
                <h2 style={{ fontSize: "13px", fontWeight: 700, margin: "16px 0 6px", paddingBottom: "3px", borderBottom: "2px solid #e2e8f0" }}>📊 Resumen General del Día</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Total Ventas Día", value: formatCOP(totalSalesToday), border: "border-emerald-500" },
                    { label: "Número de Pedidos", value: `${todaysSales.length}`, border: "border-blue-500" },
                    { label: "Ticket Promedio", value: formatCOP(todaysSales.length > 0 ? totalSalesToday / todaysSales.length : 0), border: "border-purple-500" },
                  ].map((k) => (
                    <div key={k.label} className={`bg-slate-50 border border-slate-200 border-t-4 ${k.border} rounded-xl p-4 text-center`}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{k.label}</p>
                      <p className="text-xl font-extrabold text-slate-900">{k.value}</p>
                    </div>
                  ))}
                </div>

                {/* By payment method */}
                <h2 style={{ fontSize: "13px", fontWeight: 700, margin: "16px 0 6px", paddingBottom: "3px", borderBottom: "2px solid #e2e8f0" }}>💳 Ventas por Método de Pago</h2>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2 text-left">Método</th>
                      <th className="px-4 py-2 text-right">Trans.</th>
                      <th className="px-4 py-2 text-right">Total</th>
                      <th className="px-4 py-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { method: "Efectivo", count: todaysSales.filter((s) => s.method === "Efectivo").length, total: totalByMethod.cash, color: "bg-emerald-100 text-emerald-800" },
                      { method: "Tarjeta", count: todaysSales.filter((s) => s.method === "Tarjeta").length, total: totalByMethod.card, color: "bg-blue-100 text-blue-800" },
                      { method: "Transferencia", count: todaysSales.filter((s) => s.method === "Transferencia").length, total: totalByMethod.transfer, color: "bg-purple-100 text-purple-800" },
                    ].map((row) => (
                      <tr key={row.method} className="border-b border-slate-100">
                        <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${row.color}`}>{row.method}</span></td>
                        <td className="px-4 py-2 text-right text-slate-600">{row.count}</td>
                        <td className="px-4 py-2 text-right font-bold text-slate-900">{formatCOP(row.total)}</td>
                        <td className="px-4 py-2 text-right text-slate-500">{totalSalesToday > 0 ? ((row.total / totalSalesToday) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td className="px-4 py-2">TOTAL</td>
                      <td className="px-4 py-2 text-right">{todaysSales.length}</td>
                      <td className="px-4 py-2 text-right text-emerald-700 text-base">{formatCOP(totalSalesToday)}</td>
                      <td className="px-4 py-2 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>

                {/* By cashier */}
                <h2 style={{ fontSize: "13px", fontWeight: 700, margin: "16px 0 6px", paddingBottom: "3px", borderBottom: "2px solid #e2e8f0" }}>👤 Ventas por Cajero / Vendedor</h2>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2 text-left">Cajero</th>
                      <th className="px-4 py-2 text-right">Base Caja</th>
                      <th className="px-4 py-2 text-right">Ventas</th>
                      <th className="px-4 py-2 text-right">Efectivo</th>
                      <th className="px-4 py-2 text-right">Tarjeta/Transf.</th>
                      <th className="px-4 py-2 text-right">Total Turno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(byCashier).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400 italic">Sin ventas registradas hoy</td>
                      </tr>
                    ) : (
                      Object.entries(byCashier).map(([name, rawData]) => {
                        const data = rawData as { sales: number; count: number; cash: number; card: number; transfer: number };
                        const base = getCashierBase(name);
                        return (
                          <tr key={name} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-800">{name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right text-amber-600 font-medium">{formatCOP(base)}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{data.count}</td>
                            <td className="px-4 py-2 text-right text-emerald-600 font-medium">{formatCOP(data.cash)}</td>
                            <td className="px-4 py-2 text-right text-blue-600 font-medium">{formatCOP(data.card + data.transfer)}</td>
                            <td className="px-4 py-2 text-right font-bold text-slate-900">{formatCOP(data.sales + base)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Cash Sessions History */}
                <h2 style={{ fontSize: "13px", fontWeight: 700, margin: "16px 0 6px", paddingBottom: "3px", borderBottom: "2px solid #e2e8f0" }}>📅 Historial de Sesiones de Caja (Hoy)</h2>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2 text-left">Cajero / Hora</th>
                      <th className="px-4 py-2 text-right">Base</th>
                      <th className="px-4 py-2 text-right">Ventas/Efect.</th>
                      <th className="px-4 py-2 text-right">Retiros</th>
                      <th className="px-4 py-2 text-right">Arqueo</th>
                      <th className="px-4 py-2 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashSessions.filter(s => new Date(s.openingTime).toDateString() === todayStr).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400 italic">No hay sesiones hoy</td>
                      </tr>
                    ) : (
                      cashSessions.filter(s => new Date(s.openingTime).toDateString() === todayStr).map((s) => {
                        const sessSales = salesData.filter(sale => s.sales?.includes(sale.id) && sale.method === "Efectivo").reduce((acc, sale) => acc + sale.total, 0);
                        const sessWithdrawals = (s.withdrawals || []).reduce((acc: number, w: any) => acc + w.amount, 0);
                        const expected = s.openingBase + sessSales - sessWithdrawals;
                        return (
                          <tr key={s.id} className="border-b border-slate-100">
                            <td className="px-4 py-2">
                              <div className="font-semibold text-slate-800">{s.userName}</div>
                              <div className="text-[10px] text-slate-500">{new Date(s.openingTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {s.closingTime ? new Date(s.closingTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Abierta"}</div>
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-slate-700">{formatCOP(s.openingBase)}</td>
                            <td className="px-4 py-2 text-right font-medium text-emerald-600">{formatCOP(sessSales)}</td>
                            <td className="px-4 py-2 text-right font-medium text-orange-600">{formatCOP(sessWithdrawals)}</td>
                            <td className="px-4 py-2 text-right">
                              <div className={`font-bold ${s.status === 'closed' ? (s.closingAmount === s.expectedAmount ? "text-slate-900" : "text-red-600") : "text-blue-600"}`}>
                                {s.status === 'closed' ? formatCOP(s.closingAmount) : "En proceso"}
                              </div>
                              {s.status === 'closed' && s.closingAmount !== s.expectedAmount && (
                                <div className="text-[9px] font-bold uppercase">Dif: {formatCOP(s.closingAmount - s.expectedAmount)}</div>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.status === 'closed' ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"}`}>
                                 {s.status === 'closed' ? "Cerrada" : "Abierta"}
                               </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Cash delivery box */}
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
                  <h2 className="font-bold text-emerald-800 text-base mb-3 flex items-center gap-2">
                    <TrendingUp size={18} /> Resumen de Caja — Entrega de Turno
                  </h2>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Base inicial de caja", value: formatCOP(cashBaseGlobal), note: "Efectivo entregado al inicio del turno" },
                      { label: "+ Ventas en Efectivo", value: formatCOP(totalByMethod.cash), note: "" },
                      { label: "+ Ventas por Tarjeta", value: formatCOP(totalByMethod.card), note: "Referencia — va al banco" },
                      { label: "+ Ventas por Transferencia", value: formatCOP(totalByMethod.transfer), note: "Referencia" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-start py-2 border-b border-emerald-200">
                        <div>
                          <span className="text-slate-700 font-medium">{row.label}</span>
                          {row.note && <p className="text-xs text-slate-400">{row.note}</p>}
                        </div>
                        <span className="font-bold text-slate-800">{row.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 mt-1">
                      <div>
                        <span className="text-emerald-800 font-extrabold text-base">💚 Total a Entregar en Caja (Efectivo)</span>
                        <p className="text-xs text-emerald-600 mt-0.5">Base inicial + ventas en efectivo</p>
                      </div>
                      <span className="text-emerald-700 font-extrabold text-xl">{formatCOP(cashInRegister)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                      <span className="text-slate-600 font-bold">📊 Total General de Ventas del Turno</span>
                      <span className="text-slate-800 font-extrabold text-lg">{formatCOP(totalSalesToday)}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="border-t-2 border-slate-400 pt-2 mt-10">
                      <p className="text-sm font-medium text-slate-600">Firma Cajero / Vendedor</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-slate-400 pt-2 mt-10">
                      <p className="text-sm font-medium text-slate-600">Firma Administrador</p>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400 mt-6">Generado por Punto POS · {today.toLocaleString("es-CO")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USER FORM MODAL ────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <h3 className="font-bold text-slate-800">{editingId ? "Editar Usuario" : "Nuevo Usuario"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary" placeholder="Ej. Juan Pérez" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico (Para Login)</label>
                  <input type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary" placeholder="juan@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select value={formData.role || "Cajero"} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    <option value="Admin">Administrador</option>
                    <option value="Cajero">Cajero</option>
                    <option value="Mesero">Mesero</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select value={formData.status || "Activo"} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                {/* Cash base - only for Cajero */}
                {formData.role === "Cajero" && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">💰 Base de Caja Inicial del Turno</label>
                    <input
                      type="number"
                      value={formData.cashBase || ""}
                      onChange={(e) => setFormData({ ...formData, cashBase: e.target.value })}
                      className="w-full p-3 border border-amber-300 rounded-xl outline-none focus:border-amber-500 bg-amber-50"
                      placeholder="Ej: 200000"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Dinero en efectivo con que inicia el cajero su turno.</p>
                  </div>
                )}

                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Lock size={14} className="text-slate-400" /> Contraseña / PIN de Acceso
                    </label>
                    <input type="text" value={formData.password || ""} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-primary bg-slate-50" placeholder="****" />
                    <p className="text-[10px] text-slate-500 mt-1">Este será el código que usará para ingresar al sistema localmente.</p>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.biometricEnabled ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>
                        <Fingerprint size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">Lector Biométrico</p>
                        <p className="text-xs text-slate-500">Permitir ingreso con huella digital</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!formData.biometricEnabled) {
                          alert("Coloque el dedo en el lector biométrico ahora...");
                          setTimeout(() => {
                            alert("✅ Huella registrada exitosamente.");
                            setFormData({ ...formData, biometricEnabled: true });
                          }, 1000);
                        } else {
                          if (confirm("¿Desvincular huella de este usuario?")) setFormData({ ...formData, biometricEnabled: false });
                        }
                      }}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${formData.biometricEnabled ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-primary text-white hover:bg-primary/90"}`}
                    >
                      {formData.biometricEnabled ? "Desvincular" : "Registrar Huella"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancelar</button>
                <button onClick={handleSave} className="px-5 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 shadow-md transition-colors">Guardar Usuario</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
