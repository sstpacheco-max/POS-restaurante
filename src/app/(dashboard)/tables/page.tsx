"use client";

import { useState, useEffect } from "react";
import { Users, Clock, Search, Info, Plus, X } from "lucide-react";

// Mock data
type TableStatus = "Libre" | "Ocupada" | "Por Pagar" | "Reservada";

interface Table {
  id: number;
  number: string;
  status: TableStatus;
  capacity: number;
  waiter?: string;
  timeSeated?: string;
  billTotal?: number;
}

const INITIAL_TABLES: Table[] = [
  { id: 1, number: "M1", status: "Ocupada", capacity: 4, waiter: "Ana G.", timeSeated: "45 min", billTotal: 125000 },
  { id: 2, number: "M2", status: "Libre", capacity: 2 },
  { id: 3, number: "M3", status: "Por Pagar", capacity: 4, waiter: "Carlos L.", timeSeated: "1h 15m", billTotal: 89000 },
  { id: 4, number: "M4", status: "Libre", capacity: 6 },
  { id: 5, number: "M5", status: "Reservada", capacity: 8, waiter: "Pendiente" },
  { id: 6, number: "M6", status: "Ocupada", capacity: 2, waiter: "Ana G.", timeSeated: "15 min", billTotal: 12500 },
  { id: 7, number: "M7", status: "Libre", capacity: 4 },
  { id: 8, number: "B1", status: "Ocupada", capacity: 2, waiter: "Marco P.", timeSeated: "5 min", billTotal: 4500 }, // Barra 1
  { id: 9, number: "B2", status: "Libre", capacity: 2 },
];

const STATUS_COLORS: Record<TableStatus, { bg: string, border: string, text: string }> = {
  "Libre": { bg: "bg-white", border: "border-slate-200", text: "text-slate-500" },
  "Ocupada": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  "Por Pagar": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  "Reservada": { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-600" },
};

export default function TablesPage() {
  const [filter, setFilter] = useState<TableStatus | "Todas">("Todas");
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTable, setPaymentTable] = useState<Table | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo");
  const [amountTendered, setAmountTendered] = useState<string>("");

  const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  };

  useEffect(() => {
    const storedTables = localStorage.getItem("punto_pos_tables");
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("punto_pos_tables", JSON.stringify(tables));
    }
  }, [tables, isLoaded]);

  const filteredTables = tables.filter(t => filter === "Todas" || t.status === filter);

  const stats = {
    total: tables.length,
    occupied: tables.filter(t => t.status === "Ocupada").length,
    free: tables.filter(t => t.status === "Libre").length,
    paying: tables.filter(t => t.status === "Por Pagar").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Mesas</h1>
          <p className="text-slate-500 mt-1">Control visual del salón y la barra.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <button onClick={() => setFilter("Todas")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "Todas" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Todas ({stats.total})</button>
            <button onClick={() => setFilter("Libre")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "Libre" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Libres ({stats.free})</button>
            <button onClick={() => setFilter("Ocupada")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "Ocupada" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Ocupadas ({stats.occupied})</button>
            <button onClick={() => setFilter("Por Pagar")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "Por Pagar" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Por Pagar ({stats.paying})</button>
          </div>
          <button 
            onClick={() => { setIsAddingTable(true); setFormData({ capacity: 4 }); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/30"
          >
            <Plus size={18} />
            Nueva Mesa
          </button>
        </div>
      </div>

      {/* Add Table Modal */}
      {isAddingTable && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Añadir Nueva Mesa</h3>
              <button onClick={() => setIsAddingTable(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Identificador (ej. M8, Terraza 1)</label>
                <input 
                  type="text" 
                  value={formData.number || ""}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacidad (Personas)</label>
                <input 
                  type="number" 
                  value={formData.capacity || 4}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <button 
                onClick={() => {
                   if (formData.number) {
                     setTables([...tables, { id: Date.now(), number: formData.number, capacity: formData.capacity || 4, status: "Libre" }]);
                     setIsAddingTable(false);
                     setFormData({});
                   }
                }}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors mt-2"
              >
                Crear Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Gestionar Mesa {editingTable.number}</h3>
              <button onClick={() => setEditingTable(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estado de la Mesa</label>
                <select 
                  value={formData.status || editingTable.status}
                  onChange={e => setFormData({...formData, status: e.target.value as TableStatus})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="Libre">Librar / Cobrar Mesa</option>
                  <option value="Ocupada">Ocupar Mesa</option>
                  <option value="Por Pagar">Marcar Por Pagar</option>
                  <option value="Reservada">Marcar Reservada</option>
                </select>
              </div>

              {(formData.status === "Ocupada" || (!formData.status && editingTable.status === "Ocupada")) && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Mesero Asignado</label>
                   <input 
                      type="text" 
                      value={formData.waiter || editingTable.waiter || ""}
                      onChange={e => setFormData({...formData, waiter: e.target.value})}
                      placeholder="Nombre del mesero..."
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none"
                   />
                </div>
              )}

              <div className="flex gap-3 mt-4 pt-2">
                 <button onClick={() => setEditingTable(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                 <button 
                  onClick={() => {
                     setTables(tables.map(t => {
                       if (t.id === editingTable.id) {
                         const newStatus = formData.status || t.status;
                         
                          // If freeing the table, also clear its cart
                         if (newStatus === "Libre") {
                            // If they selected Librar/Cobrar here, open payment modal if it had a bill.
                            if (t.billTotal && t.billTotal > 0) {
                               setPaymentTable(t);
                               setIsPaymentModalOpen(true);
                               return t; // don't free it just yet, wait for modal
                            }
                            
                            const storedCarts = localStorage.getItem("punto_pos_carts");
                            if (storedCarts) {
                               const carts = JSON.parse(storedCarts);
                               delete carts[t.id];
                               localStorage.setItem("punto_pos_carts", JSON.stringify(carts));
                            }
                         }   // Call alert optionally if we want user feedback
                            // alert("Mesa cobrada/liberada con éxito.");
                         

                         return {
                           ...t,
                           status: newStatus,
                           waiter: newStatus === "Libre" ? undefined : (formData.waiter || t.waiter),
                           timeSeated: newStatus === "Libre" ? undefined : (newStatus === "Ocupada" && t.status !== "Ocupada" ? "0 min" : t.timeSeated),
                           billTotal: newStatus === "Libre" ? undefined : t.billTotal
                         };
                       }
                       return t;
                     }));
                     setEditingTable(null);
                  }}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                 >
                   Guardar
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && paymentTable && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Cobrar Mesa {paymentTable.number}</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Total a Pagar</p>
                <p className="text-3xl font-black text-slate-900">{formatCOP(paymentTable.billTotal || 0)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                   {["Efectivo", "Tarjeta", "Transferencia"].map(method => (
                     <button
                       key={method}
                       onClick={() => setPaymentMethod(method as any)}
                       className={`py-2 rounded-xl text-xs font-bold transition-all border ${paymentMethod === method ? "bg-primary text-white border-primary shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                     >
                        {method}
                     </button>
                   ))}
                </div>
              </div>

              {paymentMethod === "Efectivo" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Monto Recibido</label>
                  <input 
                    type="number"
                    value={amountTendered}
                    onChange={e => setAmountTendered(e.target.value)}
                    placeholder="Ej. 50000"
                    className="w-full text-xl p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  {Number(amountTendered) >= (paymentTable.billTotal || 0) && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                       <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight block">Cambio a devolver</span>
                       <span className="text-lg font-black text-emerald-700">{formatCOP(Number(amountTendered) - (paymentTable.billTotal || 0))}</span>
                    </div>
                  )}
                </div>
              )}

              <button 
                disabled={paymentMethod === "Efectivo" && (Number(amountTendered) < (paymentTable.billTotal || 0) || !amountTendered)}
                onClick={() => {
                   setTables(tables.map(t => {
                     if (t.id === paymentTable.id) {
                       // Clear its cart
                       const storedCarts = localStorage.getItem("punto_pos_carts");
                       if (storedCarts) {
                          const carts = JSON.parse(storedCarts);
                          delete carts[t.id];
                          localStorage.setItem("punto_pos_carts", JSON.stringify(carts));
                       }
                       return { ...t, status: "Libre", billTotal: undefined, timeSeated: undefined, waiter: undefined };
                     }
                     return t;
                   }));
                   alert(`¡Pago de ${formatCOP(paymentTable.billTotal || 0)} procesado con éxito via ${paymentMethod}!`);
                   setIsPaymentModalOpen(false);
                   setAmountTendered("");
                }}
                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors mt-6 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {filteredTables.map(table => {
          const colors = STATUS_COLORS[table.status];
          return (
            <button
              key={table.id}
              onClick={() => {
                setEditingTable(table);
                setFormData({ status: table.status, waiter: table.waiter });
              }}
              className={`relative flex flex-col p-5 rounded-2xl border-2 transition-all ${colors.bg} ${colors.border} hover:shadow-lg hover:-translate-y-1 group active:scale-95 text-left`}
            >
              <div className="flex justify-between items-start w-full mb-4">
                <span className={`text-2xl font-bold ${colors.text}`}>{table.number}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm border ${colors.border} ${colors.text}`}>
                  {table.status}
                </span>
              </div>
              
              <div className="space-y-2 mt-auto w-full">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={16} />
                  <span>Capacidad: {table.capacity}</span>
                </div>
                
                {table.status !== "Libre" && table.waiter && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                     <Info size={16} />
                     <span>{table.waiter}</span>
                  </div>
                )}

                {(table.status === "Ocupada" || table.status === "Por Pagar") && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5 w-full">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock size={14} />
                      {table.timeSeated}
                    </div>
                    <span className="font-bold text-slate-800">{formatCOP(table.billTotal || 0)}</span>
                  </div>
                )}
              </div>

              {table.status !== "Libre" && (
                <div 
                  className="absolute inset-x-0 -bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                     e.stopPropagation();
                     setPaymentTable(table);
                     setIsPaymentModalOpen(true);
                  }}
                >
                   <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md hover:bg-emerald-600 cursor-pointer">
                     Cobrar Mesa
                   </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
