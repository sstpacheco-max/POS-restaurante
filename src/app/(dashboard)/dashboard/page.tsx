"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, Activity, PieChart, BarChart, Settings, Plus, Trash2, Save } from "lucide-react";

type Expense = {
  id: number;
  name: string;
  amount: number;
  type: "Fijo" | "Variable";
};

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isEditingExpenses, setIsEditingExpenses] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ type: "Fijo" });

  useEffect(() => {
    const storedSales = localStorage.getItem("punto_pos_sales");
    if (storedSales) setSalesData(JSON.parse(storedSales));

    const storedExpenses = localStorage.getItem("punto_pos_expenses_v2");
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      // Default expenses if none exist
      const defaultExpenses: Expense[] = [
        { id: 1, name: "Arriendo", amount: 2000000, type: "Fijo" },
        { id: 2, name: "Nómina", amount: 4500000, type: "Fijo" },
        { id: 3, name: "Servicios (Agua/Luz)", amount: 800000, type: "Fijo" },
        { id: 4, name: "Marketing", amount: 500000, type: "Fijo" }
      ];
      setExpenses(defaultExpenses);
      localStorage.setItem("punto_pos_expenses_v2", JSON.stringify(defaultExpenses));
    }
  }, []);

  const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  };

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem("punto_pos_expenses_v2", JSON.stringify(newExpenses));
  };

  // Compute metrics for today
  const today = new Date().toDateString();
  const todaysSales = salesData.filter(sale => new Date(sale.date).toDateString() === today);
  const todaysVariableExpenses = expenses.filter(e => e.type === "Variable" && (e as any).date && new Date((e as any).date).toDateString() === today)
                                        .reduce((acc, e) => acc + e.amount, 0);

  const rawRevenueToday = todaysSales.reduce((acc, sale) => acc + sale.total, 0);
  const revenueToday = Math.max(0, rawRevenueToday - todaysVariableExpenses); // Subtract outflows but don't go below 0 on the UI
  const ordersToday = todaysSales.length;

  const productCounts = salesData.reduce((acc, sale) => {
    sale.items.forEach((item: {name: string, quantity: number, price: number}) => {
      if (!acc[item.name]) acc[item.name] = { count: 0, revenue: 0 };
      acc[item.name].count += item.quantity;
      acc[item.name].revenue += item.quantity * item.price;
    });
    return acc;
  }, {} as Record<string, {count: number, revenue: number}>);

  const topProducts = Object.entries(productCounts)
    .sort((a, b) => (b[1] as any).count - (a[1] as any).count)
    .slice(0, 5)
    .map(([name, data]) => ({ name, ...(data as {count: number, revenue: number}) }));

  // Compute Breakeven Variables
  const totalFixedCosts = expenses.filter(e => e.type === "Fijo").reduce((acc, e) => acc + e.amount, 0);
  const totalVariableCosts = expenses.filter(e => e.type === "Variable").reduce((acc, e) => acc + e.amount, 0);
  
  // Real Contribution Margin based on today's performance vs variable expenses, defaulting to 60% if no sales
  const currentMargin = rawRevenueToday > 0 
     ? Math.max(0.01, (rawRevenueToday - totalVariableCosts) / rawRevenueToday) // ensure it doesn't drop to 0 to prevent Infinity
     : 0.60; 

  const breakevenSales = totalFixedCosts / currentMargin;
  const missingForBreakeven = Math.max(0, breakevenSales - revenueToday);
  const breakevenPercentage = Math.min(100, (revenueToday / (breakevenSales || 1)) * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vista General</h1>
        <p className="text-slate-500 mt-1">Monitorea el flujo de caja y ventas de hoy.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-t-4 border-emerald-500">
          <div className="flex flex-row justify-between items-start mb-4">
            <h3 className="text-slate-500 font-medium tracking-tight">Ingresos Netos (Hoy)</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCOP(revenueToday)}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1 w-fit">
              <TrendingUp size={12} /> Bruto: {formatCOP(rawRevenueToday)}
            </p>
            {todaysVariableExpenses > 0 && (
               <p className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-md w-fit">
                 - {formatCOP(todaysVariableExpenses)} disp.
               </p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-row justify-between items-start mb-4">
            <h3 className="text-slate-500 font-medium">Pedidos Completados</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{ordersToday}</p>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Hoy
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-row justify-between items-start mb-4">
            <h3 className="text-slate-500 font-medium">Clientes Activos</h3>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">128</p>
          <p className="text-sm font-medium text-indigo-600 mt-2">
            Mesas al 80%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Breakeven Point Calculator */}
        <div className="glass-card p-6 lg:col-span-2">
           <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
             <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
               <Activity size={20} className="text-primary" />
               Punto de Equilibrio (Dinámico)
             </h3>
             <button 
               onClick={() => setIsEditingExpenses(!isEditingExpenses)}
               className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
             >
               {isEditingExpenses ? <><Save size={16}/> Guardar</> : <><Settings size={16}/> Configurar Costos</>}
             </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
               <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Costos Actuales</p>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600 font-medium">Costos Fijos Totales:</span>
                    <span className="text-slate-900 font-bold">{formatCOP(totalFixedCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600 font-medium">Gastos Variables Aprox:</span>
                    <span className="text-slate-900 font-bold">{formatCOP(totalVariableCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Margen de Contribución:</span>
                    <span className="text-primary font-bold">{(currentMargin * 100).toFixed(1)}%</span>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                 <span className="text-slate-800 font-bold">Ventas Necesarias (P.E):</span>
                 <span className="text-emerald-600 font-extrabold text-xl">{formatCOP(breakevenSales)}</span>
               </div>
               
               {/* Progress Bar */}
               <div className="mt-4 pt-2">
                 <div className="flex justify-between text-xs text-slate-500 font-medium mb-1">
                   <span>Ventas ({formatCOP(revenueToday)})</span>
                   <span>Faltan: {formatCOP(missingForBreakeven)}</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-3">
                   <div className={`h-3 rounded-full transition-all ${breakevenPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${breakevenPercentage}%` }}></div>
                 </div>
               </div>
             </div>

             {/* Expenses Configurator */}
             <div className="p-4 border border-slate-200 rounded-xl bg-white max-h-64 overflow-y-auto">
               <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Lista de Gastos</p>
               
               {isEditingExpenses && (
                 <div className="flex gap-2 mb-4">
                   <input 
                     type="text" 
                     placeholder="Ej: Gas" 
                     className="flex-1 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary"
                     value={newExpense.name || ""}
                     onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                   />
                   <input 
                     type="number" 
                     placeholder="$$$" 
                     className="w-20 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary"
                     value={newExpense.amount || ""}
                     onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                   />
                   <select 
                     className="border border-slate-200 rounded-lg p-2 text-sm outline-none"
                     value={newExpense.type || "Fijo"}
                     onChange={(e) => setNewExpense({...newExpense, type: e.target.value as "Fijo"|"Variable"})}
                   >
                     <option value="Fijo">Fijo</option>
                     <option value="Variable">Var</option>
                   </select>
                   <button 
                     disabled={!newExpense.name || !newExpense.amount}
                     onClick={() => {
                        if (newExpense.name && newExpense.amount) {
                           saveExpenses([...expenses, { ...newExpense, id: Date.now() } as Expense]);
                           setNewExpense({ type: "Fijo" });
                        }
                     }}
                     className="bg-primary text-white p-2 rounded-lg disabled:opacity-50"
                   >
                     <Plus size={18} />
                   </button>
                 </div>
               )}

               <div className="space-y-2">
                 {expenses.map(exp => (
                   <div key={exp.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                     <div>
                       <p className="text-sm font-bold text-slate-800">{exp.name}</p>
                       <p className="text-xs text-slate-500">{exp.type}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="font-medium text-slate-900">{formatCOP(exp.amount)}</span>
                       {isEditingExpenses && (
                         <button 
                           onClick={() => saveExpenses(expenses.filter(e => e.id !== exp.id))}
                           className="text-red-400 hover:text-red-600"
                         >
                           <Trash2 size={16} />
                         </button>
                       )}
                     </div>
                   </div>
                 ))}
                 {expenses.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No hay gastos registrados.</p>}
               </div>
             </div>
           </div>
        </div>
        
        {/* Top Products */}
        <div className="glass-card p-6">
           <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-4 mb-4">Productos Estrella</h3>
           <div className="space-y-4">
             {topProducts.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Aún no hay ventas registradas.</p>
             ) : (
                topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1 break-all">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.count} ventas</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-700">{formatCOP(p.revenue)}</span>
                  </div>
                ))
             )}
           </div>
        </div>
      </div>

      {/* Strategic Menu Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Ingeniería de Menús */}
        <div className="glass-card p-6 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
            <PieChart className="text-primary" />
            Ingeniería de Menús (Matriz BCG)
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
              <p className="text-sm text-slate-500 font-medium mb-1">Número de productos</p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
              <p className="text-sm text-slate-500 font-medium mb-1">% Coste medio</p>
              <p className="text-2xl font-bold text-slate-900">32,80 <span className="text-sm">%</span></p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
              <p className="text-sm text-slate-500 font-medium mb-1">Beneficio medio</p>
              <p className="text-2xl font-bold text-slate-900">{formatCOP(11410)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 p-4 bg-white border border-slate-200 rounded-xl flex-1 shadow-sm">
            {/* Mock Bar Chart */}
            <div className="flex flex-col justify-end h-48 gap-4 border-b border-slate-300 pb-2 relative">
                <div className="flex justify-between items-end h-full px-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">4</span>
                    <div className="w-8 bg-blue-500 rounded-t-sm shadow-sm" style={{ height: '110px' }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Estrella</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">2</span>
                    <div className="w-8 bg-red-400 rounded-t-sm shadow-sm" style={{ height: '55px' }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Vaca</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">3</span>
                    <div className="w-8 bg-green-500 rounded-t-sm shadow-sm" style={{ height: '80px' }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Enigma</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">3</span>
                    <div className="w-8 bg-purple-500 rounded-t-sm shadow-sm" style={{ height: '80px' }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Perro</span>
                  </div>
                </div>
            </div>

            {/* Mock Donut Chart details */}
            <div className="flex items-center justify-center relative h-48">
               {/* A simple CSS donut approximation using conic-gradient */}
               <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-md border-4 border-white" style={{ background: 'conic-gradient(#f87171 0% 17%, #a855f7 17% 42%, #22c55e 42% 67%, #3b82f6 67% 100%)' }}>
                 <div className="w-20 h-20 bg-white rounded-full shadow-inner"></div>
               </div>
               
               {/* Labels positioned absolutely */}
               <span className="absolute top-2 right-0 text-[10px] font-extrabold text-blue-600 bg-white/80 px-1 rounded backdrop-blur-sm">ESTRELLA<br/>33%</span>
               <span className="absolute bottom-4 right-0 text-[10px] font-extrabold text-red-500 bg-white/80 px-1 rounded backdrop-blur-sm">VACA<br/>17%</span>
               <span className="absolute bottom-4 left-0 text-[10px] font-extrabold text-green-600 bg-white/80 px-1 rounded backdrop-blur-sm">ENIGMA<br/>25%</span>
               <span className="absolute top-2 left-0 text-[10px] font-extrabold text-purple-600 bg-white/80 px-1 rounded backdrop-blur-sm">PERRO<br/>25%</span>
            </div>
          </div>
        </div>

        {/* Principios de Omnes */}
        <div className="glass-card p-6 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
            <BarChart className="text-emerald-600" />
            Principios de Omnes
          </h3>

          {/* 1. Dispersión de precios */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] space-y-3">
             <div className="flex justify-between items-center mb-2">
               <h4 className="font-semibold text-slate-800 text-lg">1. Dispersión de precios</h4>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex flex-col">
                 <span className="text-xs text-slate-500">(Coeficiente ideal entre 2,5 y 3)</span>
                 <span className="text-4xl font-light text-slate-900 mt-1">2,58</span>
               </div>
               <div className="w-1/2 space-y-2">
                 <div className="flex items-center gap-2 text-xs">
                   <span className="w-24 text-slate-500 text-right">Precio más alto</span>
                   <div className="flex-1 bg-slate-100 h-2 rounded"><div className="bg-red-500 h-2 rounded" style={{width: '100%'}}></div></div>
                   <span className="w-16 font-bold text-slate-700 text-right">{formatCOP(32000)}</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                   <span className="w-24 text-slate-500 text-right">Precio más bajo</span>
                   <div className="flex-1 bg-slate-100 h-2 rounded"><div className="bg-green-500 h-2 rounded" style={{width: '40%'}}></div></div>
                   <span className="w-16 font-bold text-slate-700 text-right">{formatCOP(9500)}</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                   <span className="w-24 text-slate-500 text-right">Diferencia</span>
                   <div className="flex-1 bg-slate-100 h-2 rounded"><div className="bg-blue-500 h-2 rounded" style={{width: '60%'}}></div></div>
                   <span className="w-16 font-bold text-slate-700 text-right">{formatCOP(22500)}</span>
                 </div>
               </div>
             </div>
          </div>

          {/* 2. Amplitud de gama */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] space-y-3">
             <div className="flex justify-between items-center mb-2">
               <h4 className="font-semibold text-slate-800 text-lg">2. Amplitud de gama</h4>
             </div>
             <div className="flex items-end justify-between px-2">
               <div className="flex flex-col items-center gap-1">
                 <span className="text-xs text-slate-500 font-medium tracking-tight">Banda Baja</span>
                 <span className="text-3xl font-light text-slate-900">4</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                 <span className="text-xs text-slate-500 font-medium tracking-tight">Banda Media</span>
                 <span className="text-3xl font-light text-slate-900">6</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                 <span className="text-xs text-slate-500 font-medium tracking-tight">Banda Alta</span>
                 <span className="text-3xl font-light text-slate-900">2</span>
               </div>

               {/* Mock comparison chart */}
               <div className="flex items-end gap-5 ml-4 border-b border-slate-200 pb-1">
                 <div className="flex flex-col items-center gap-1">
                   <div className="flex items-end gap-[2px]">
                     <div className="flex flex-col items-center"><span className="text-[9px] text-slate-500 font-bold">4</span><div className="w-3 bg-blue-600 h-8 rounded-sm"></div></div>
                     <div className="flex flex-col items-center"><span className="text-[9px] text-slate-500 font-bold">3</span><div className="w-3 bg-red-500 h-6 rounded-sm"></div></div>
                   </div>
                   <span className="text-[9px] text-slate-400">B. baja</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                   <div className="flex items-end gap-[2px]">
                     <div className="flex flex-col items-center"><span className="text-[9px] text-slate-500 font-bold">6</span><div className="w-3 bg-blue-600 h-12 rounded-sm"></div></div>
                     <div className="flex flex-col items-center"><span className="text-[9px] text-slate-500 font-bold">6</span><div className="w-3 bg-red-500 h-12 rounded-sm"></div></div>
                   </div>
                   <span className="text-[9px] text-slate-400">B. media</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                   <div className="flex items-end gap-[2px]">
                     <div className="flex flex-col items-center"><span className="text-[9px] text-slate-500 font-bold">2</span><div className="w-3 bg-blue-600 h-4 rounded-sm"></div></div>
                     <div className="flex flex-col items-center"><span className="text-[9px] text-slate-500 font-bold">3</span><div className="w-3 bg-red-500 h-6 rounded-sm"></div></div>
                   </div>
                   <span className="text-[9px] text-slate-400">B. alta</span>
                 </div>
               </div>
             </div>
             <div className="flex justify-end gap-3 text-[10px] text-slate-500 px-2">
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Actual</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Ideal</span>
             </div>
          </div>

          {/* 3. Relación calidad / precio */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] space-y-3">
             <div className="flex justify-between items-center mb-2">
               <h4 className="font-semibold text-slate-800 text-lg">3. Relación calidad / precio</h4>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex flex-col">
                 <span className="text-xs text-slate-500">(Coeficiente ideal entre 0,90 y 1,00)</span>
                 <span className="text-4xl font-light text-slate-900 mt-1">1,02</span>
               </div>
               
               <div className="w-[55%] space-y-3">
                 <div className="flex items-center gap-2 text-xs">
                   <span className="w-28 text-slate-500 text-right leading-tight">Precio medio ofertado</span>
                   <div className="flex-1 bg-slate-100 h-2 rounded"><div className="bg-red-500 h-2 rounded" style={{width: '95%'}}></div></div>
                   <span className="w-16 font-bold text-slate-700 text-right">{formatCOP(16580)}</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                   <span className="w-28 text-slate-500 text-right leading-tight">Precio medio solicitado</span>
                   <div className="flex-1 bg-slate-100 h-2 rounded"><div className="bg-green-500 h-2 rounded" style={{width: '100%'}}></div></div>
                   <span className="w-16 font-bold text-slate-700 text-right">{formatCOP(16980)}</span>
                 </div>
               </div>
             </div>
             <div className="text-right pt-2 border-t border-slate-100 mt-4">
               <span className="text-sm font-bold italic text-slate-900 bg-amber-100 px-3 py-1 rounded-md inline-block">Recomendable SUBIR precios</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
