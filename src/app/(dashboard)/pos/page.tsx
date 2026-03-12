"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Minus, Trash2, CreditCard, Receipt, ShoppingCart } from "lucide-react";

// Mock data
const CATEGORIES = ["Todos", "Bebidas", "Entradas", "Platos Principales", "Postres"];
const PRODUCTS = [
  { id: 1, name: "Desayuno (Huevos al gusto)", price: 10000, category: "Platos Principales", image: "🍳", stock: true },
  { id: 2, name: "Café en leche", price: 3500, category: "Bebidas", image: "☕", stock: true },
  { id: 3, name: "Tamal (unidad)", price: 12000, category: "Platos Principales", image: "🫔", stock: true },
  { id: 4, name: "Sancocho (porción)", price: 18000, category: "Platos Principales", image: "🍲", stock: true },
  { id: 5, name: "Almuerzo Ejecutivo", price: 16000, category: "Platos Principales", image: "🍛", stock: true },
  { id: 6, name: "Jugo Natural (12oz)", price: 5000, category: "Bebidas", image: "🥤", stock: true },
];

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartsByTable, setCartsByTable] = useState<Record<number, any[]>>({});
  const [availableProducts, setAvailableProducts] = useState(PRODUCTS);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ name: "", amount: "" });
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo");
  const [amountTendered, setAmountTendered] = useState<string>("");

  const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  };

  useEffect(() => {
    const storedProducts = localStorage.getItem("punto_pos_products_v2");
    const storedRecipes = localStorage.getItem("punto_pos_recipes_v2");
    const storedIngredients = localStorage.getItem("punto_pos_ingredients_v2");
    
    if (storedProducts) {
       setAvailableProducts(JSON.parse(storedProducts));
    }
    if (storedRecipes) {
       setRecipes(JSON.parse(storedRecipes));
    }
    if (storedIngredients) {
       setIngredients(JSON.parse(storedIngredients));
    }
    const storedTables = localStorage.getItem("punto_pos_tables");
    if (storedTables) {
       const parsedTables = JSON.parse(storedTables);
       setTables(parsedTables);
       if (parsedTables.length > 0) setSelectedTable(parsedTables[0].id);
    }
    const storedCarts = localStorage.getItem("punto_pos_carts");
    if (storedCarts) {
       setCartsByTable(JSON.parse(storedCarts));
    }
  }, []);

  useEffect(() => {
    // Only save if it has keys or if it was loaded, to avoid overwriting with initial empty state
    // We can just save it.
    localStorage.setItem("punto_pos_carts", JSON.stringify(cartsByTable));
    
    // Update tables' billTotal in local storage
    const storedTables = localStorage.getItem("punto_pos_tables");
    if (storedTables) {
      let currentTables = JSON.parse(storedTables);
      let tablesChanged = false;
      Object.entries(cartsByTable).forEach(([tableIdStr, tableCart]) => {
          const tableId = Number(tableIdStr);
          const tIndex = currentTables.findIndex((t:any) => t.id === tableId);
          if (tIndex !== -1) {
             const cartTotal = (tableCart as {product: any, quantity: number}[]).reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
             if (currentTables[tIndex].billTotal !== cartTotal) {
                 currentTables[tIndex].billTotal = cartTotal > 0 ? cartTotal : undefined;
                 if (cartTotal > 0 && currentTables[tIndex].status === "Libre") {
                    currentTables[tIndex].status = "Ocupada";
                    currentTables[tIndex].timeSeated = "0 min";
                 }
                 tablesChanged = true;
             }
          }
      });
      if (tablesChanged) {
         localStorage.setItem("punto_pos_tables", JSON.stringify(currentTables));
      }
    }
  }, [cartsByTable]);

  const cart = selectedTable && cartsByTable[selectedTable] ? cartsByTable[selectedTable] : [];

  const filteredProducts = availableProducts.filter(p => 
    (activeCategory === "Todos" || (p.category && p.category === activeCategory) || (!p.category && activeCategory === "Todos")) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: any) => {
    if (!selectedTable) {
      alert("Por favor selecciona una mesa primero.");
      return;
    }
    setCartsByTable(prev => {
      const tableCart = prev[selectedTable] || [];
      const existing = tableCart.find(item => item.product.id === product.id);
      let newCart;
      if (existing) {
        newCart = tableCart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        newCart = [...tableCart, { product, quantity: 1 }];
      }
      return { ...prev, [selectedTable]: newCart };
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    if (!selectedTable) return;
    setCartsByTable(prev => {
      const tableCart = prev[selectedTable] || [];
      const newCart = tableCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
      return { ...prev, [selectedTable]: newCart };
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = total * 0.15; // 15% IVA example
  const subtotal = total - tax;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Menú</h2>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
            >
              <Minus size={16} />
              <span className="hidden sm:inline">Salida / Gasto</span>
            </button>
          </div>
          
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category 
                    ? "bg-slate-900 text-white shadow-md scale-105" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col items-center justify-center text-center group active:scale-95"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{product.image || "📦"}</div>
                <div className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">{product.name}</div>
                <div className="text-primary font-bold mt-1">{formatCOP(product.price)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="font-bold tracking-wide flex items-center gap-2">
            <Receipt size={18} />
            Comanda Actual
          </h2>
          <select 
            className="bg-white/20 px-2 py-1 rounded-lg text-xs font-semibold outline-none border-none cursor-pointer text-white"
            value={selectedTable || ""}
            onChange={e => setSelectedTable(Number(e.target.value))}
          >
            {tables.length === 0 && <option value="" className="text-slate-800">Seleccionar Mesa</option>}
            {tables.map(t => (
               <option key={t.id} value={t.id} className="text-slate-800">Mesa {t.number}</option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p>No hay productos en la orden</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex flex-col bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-800 text-sm">{item.product.name}</span>
                  <span className="font-semibold text-slate-800">{formatCOP(item.product.price * item.quantity)}</span>
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <p className="text-xs text-slate-500">{formatCOP(item.product.price)} c/u</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                    </button>
                    <span className="font-semibold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Actions */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Impuestos (15%)</span>
              <span>{formatCOP(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-100 pt-2">
              <span>Total</span>
              <span>{formatCOP(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled={cart.length === 0}
              onClick={() => {
                alert("¡Orden enviada a cocina exitosamente! 👨‍🍳");
              }}
              className="flex items-center justify-center gap-2 py-3 bg-orange-100 text-orange-700 font-semibold rounded-xl hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Receipt size={18} />
              Cocina
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
            >
              <CreditCard size={18} />
              Cobrar
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Cobrar Mesa {tables.find(t => t.id === selectedTable)?.number || "Actual"}</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Total a Pagar</p>
                <p className="text-3xl font-black text-slate-900">{formatCOP(total)}</p>
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
                  {Number(amountTendered) >= total && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                       <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight block">Cambio a devolver</span>
                       <span className="text-lg font-black text-emerald-700">{formatCOP(Number(amountTendered) - total)}</span>
                    </div>
                  )}
                </div>
              )}

              <button 
                disabled={paymentMethod === "Efectivo" && (Number(amountTendered) < total || !amountTendered)}
                onClick={() => {
                   // Deduct from inventory logic
                   let updatedIngredients = [...ingredients];
                   let alerts: string[] = [];

                   cart.forEach(item => {
                     const recipe = recipes.find(r => r.productName === item.product.name);
                     if (recipe) {
                       (recipe.ingredients || []).forEach((reqIng: any) => {
                          const inventoryIndex = updatedIngredients.findIndex(inv => inv.name === reqIng.name);
                          if (inventoryIndex !== -1) {
                            const deduction = reqIng.qty * item.quantity;
                            updatedIngredients[inventoryIndex].stock = Math.max(0, updatedIngredients[inventoryIndex].stock - deduction);
                            // Alerts
                            if (updatedIngredients[inventoryIndex].stock < 10 && updatedIngredients[inventoryIndex].stock > 0) {
                               if (!alerts.includes(reqIng.name)) alerts.push(`¡Alerta! Queda poco stock de ${reqIng.name} (${updatedIngredients[inventoryIndex].stock} ${reqIng.unit}).`);
                            } else if (updatedIngredients[inventoryIndex].stock === 0) {
                               if (!alerts.includes(reqIng.name)) alerts.push(`🚨 ¡Urgnte! Se ha agotado el stock de ${reqIng.name}.`);
                            }
                          }
                       });
                     }
                   });

                   localStorage.setItem("punto_pos_ingredients_v2", JSON.stringify(updatedIngredients));
                   setIngredients(updatedIngredients);

                   // Save the sale to history
                   const storedSales = localStorage.getItem("punto_pos_sales");
                   const sales = storedSales ? JSON.parse(storedSales) : [];
                   sales.push({
                     id: Date.now(),
                     date: new Date().toISOString(),
                     total: total,
                     method: paymentMethod,
                     items: cart.map(item => ({
                       name: item.product.name,
                       price: item.product.price,
                       quantity: item.quantity,
                       category: item.product.category
                     }))
                   });
                   localStorage.setItem("punto_pos_sales", JSON.stringify(sales));

                   let paymentMessage = `¡Cobro de ${formatCOP(total)} procesado con éxito via ${paymentMethod}!`;
                   if (alerts.length > 0) {
                      paymentMessage += "\n\n" + alerts.join("\n");
                   }

                   alert(paymentMessage);
                   
                   setCartsByTable(prev => {
                     const next = { ...prev };
                     if (selectedTable) {
                        delete next[selectedTable];
                     }
                     return next;
                   });
                   
                   const storedTables = localStorage.getItem("punto_pos_tables");
                   if (storedTables && selectedTable) {
                      let currentTables = JSON.parse(storedTables);
                      const tIndex = currentTables.findIndex((t:any) => t.id === selectedTable);
                      if (tIndex !== -1) {
                         currentTables[tIndex].status = "Libre";
                         currentTables[tIndex].billTotal = undefined;
                         currentTables[tIndex].timeSeated = undefined;
                         localStorage.setItem("punto_pos_tables", JSON.stringify(currentTables));
                         setTables(currentTables); 
                      }
                   }

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

      {/* Expense Modal (Salida de Caja) */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h3 className="font-bold text-red-800 flex items-center gap-2"><Minus size={18} /> Salida de Caja Variable</h3>
              <button onClick={() => { setIsExpenseModalOpen(false); setExpenseForm({name: "", amount: ""}); }} className="text-red-400 hover:text-red-600">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Motivo / Nombre del Gasto</label>
                <input 
                  type="text"
                  value={expenseForm.name}
                  onChange={e => setExpenseForm({...expenseForm, name: e.target.value})}
                  placeholder="Ej: Pago de hielo, Transporte..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Monto a retirar ($)</label>
                <input 
                  type="number"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  placeholder="Ej: 15000"
                  className="w-full text-xl p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex gap-2 items-start mt-2">
                 <span className="text-orange-500 mt-0.5">⚠️</span>
                 <p className="text-xs text-orange-800 font-medium">Este dinero se descontará de los ingresos netos de hoy y se registrará como Gasto Variable para el Punto de Equilibrio.</p>
              </div>

              <button 
                disabled={!expenseForm.name || !expenseForm.amount || Number(expenseForm.amount) <= 0}
                onClick={() => {
                   // Add to expenses
                   const storedExpenses = localStorage.getItem("punto_pos_expenses_v2");
                   const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
                   
                   const newExpense = {
                     id: Date.now(),
                     name: expenseForm.name,
                     amount: Number(expenseForm.amount),
                     type: "Variable",
                     date: new Date().toISOString() // Important for today's filtering
                   };
                   
                   expenses.push(newExpense);
                   localStorage.setItem("punto_pos_expenses_v2", JSON.stringify(expenses));

                   alert(`Gasto variable de ${formatCOP(newExpense.amount)} guardado exitosamente.`);
                   
                   setIsExpenseModalOpen(false);
                   setExpenseForm({name: "", amount: ""});
                }}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors mt-4 shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Salida
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
