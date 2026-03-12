"use client";

import { useState, useEffect } from "react";
import { Package, Search, Plus, List, Edit2, Trash2 } from "lucide-react";

type TabPanel = "Productos" | "Ingredientes" | "Escandallos";

const INITIAL_PRODUCTS = [
  { id: 1, name: "Desayuno (Huevos al gusto)", price: 10000, cost: 3000, margin: "70%" },
  { id: 2, name: "Café en leche", price: 3500, cost: 1000, margin: "71%" },
  { id: 3, name: "Tamal (unidad)", price: 12000, cost: 4500, margin: "62%" },
  { id: 4, name: "Sancocho (porción)", price: 18000, cost: 7000, margin: "61%" },
  { id: 5, name: "Almuerzo Ejecutivo", price: 16000, cost: 8000, margin: "50%" },
  { id: 6, name: "Jugo Natural (12oz)", price: 5000, cost: 1500, margin: "70%" },
];

const INITIAL_INGREDIENTS = [
  { id: 1, name: "Huevo AA", stock: 300, unit: "unidades", costPerUnit: 350 },
  { id: 2, name: "Aceite", stock: 15, unit: "litros", costPerUnit: 8000 },
  { id: 3, name: "Café Molido", stock: 5, unit: "kg", costPerUnit: 35000 },
  { id: 4, name: "Leche Entera", stock: 20, unit: "litros", costPerUnit: 4200 },
  { id: 5, name: "Arroz", stock: 50, unit: "kg", costPerUnit: 4500 },
  { id: 6, name: "Carne de Res", stock: 30, unit: "kg", costPerUnit: 28000 },
  { id: 7, name: "Pollo Entero", stock: 40, unit: "kg", costPerUnit: 12000 },
  { id: 8, name: "Papa Pastusa", stock: 100, unit: "kg", costPerUnit: 2500 },
  { id: 9, name: "Plátano Maduro", stock: 50, unit: "unidades", costPerUnit: 1500 },
  { id: 10, name: "Mora", stock: 10, unit: "kg", costPerUnit: 5000 },
  { id: 11, name: "Azúcar", stock: 25, unit: "kg", costPerUnit: 3800 },
];

const INITIAL_RECIPES = [
  { 
    productName: "Desayuno (Huevos al gusto)", 
    ingredients: [
      { name: "Huevo AA", qty: 2, unit: "unidades" },
      { name: "Aceite", qty: 0.015, unit: "litros" }, // 15 ml
      { name: "Arroz", qty: 0.150, unit: "kg" },
      { name: "Plátano Maduro", qty: 0.5, unit: "unidades" },
    ]
  },
  { 
    productName: "Café en leche", 
    ingredients: [
      { name: "Café Molido", qty: 0.015, unit: "kg" },
      { name: "Leche Entera", qty: 0.150, unit: "litros" },
      { name: "Azúcar", qty: 0.010, unit: "kg" },
    ]
  },
  {
    productName: "Jugo Natural (12oz)",
    ingredients: [
      { name: "Mora", qty: 0.150, unit: "kg" },
      { name: "Azúcar", qty: 0.020, unit: "kg" }
    ]
  }
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabPanel>("Productos");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  
  const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  };
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({ ingredients: [] });
  const [tempIngredient, setTempIngredient] = useState({ name: "", qty: "", unit: "" });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedProducts = localStorage.getItem("punto_pos_products_v2");
    const storedIngredients = localStorage.getItem("punto_pos_ingredients_v2");
    const storedRecipes = localStorage.getItem("punto_pos_recipes_v2");

    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedIngredients) setIngredients(JSON.parse(storedIngredients));
    if (storedRecipes) setRecipes(JSON.parse(storedRecipes));
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("punto_pos_products_v2", JSON.stringify(products));
      localStorage.setItem("punto_pos_ingredients_v2", JSON.stringify(ingredients));
      localStorage.setItem("punto_pos_recipes_v2", JSON.stringify(recipes));
    }
  }, [products, ingredients, recipes, isLoaded]);

  const handleAddClick = () => {
    setFormData({ ingredients: [] });
    setTempIngredient({ name: "", qty: "", unit: "" });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEditClick = (item: any) => {
    setFormData({ ...item, ingredients: item.ingredients || [] });
    setTempIngredient({ name: "", qty: "", unit: "" });
    setEditingId(item.id || item.productName); // recipes don't have id in our mock
    setIsAdding(true);
  };

  const handleDeleteClick = (idOrName: any) => {
    if (confirm("¿Estás seguro de eliminar este elemento?")) {
      if (activeTab === "Productos") setProducts(products.filter(p => p.id !== idOrName));
      if (activeTab === "Ingredientes") setIngredients(ingredients.filter(i => i.id !== idOrName));
      if (activeTab === "Escandallos") setRecipes(recipes.filter(r => r.productName !== String(idOrName)));
    }
  };

  const handleSave = () => {
    if (activeTab === "Productos") {
      const marginRaw = formData.price && formData.cost ? ((formData.price - formData.cost) / formData.price) * 100 : 0;
      const newItem = { 
        id: editingId || Date.now(), 
        name: formData.name || "Nuevo Producto", 
        price: parseFloat(formData.price) || 0, 
        cost: parseFloat(formData.cost) || 0, 
        margin: `${marginRaw.toFixed(0)}%` 
      };
      
      if (editingId) {
        setProducts(products.map(p => p.id === editingId ? newItem : p));
      } else {
        setProducts([...products, newItem]);
      }
    } else if (activeTab === "Ingredientes") {
      const newItem = {
        id: editingId || Date.now(),
        name: formData.name || "Nuevo Ingrediente",
        stock: parseFloat(formData.stock) || 0,
        unit: formData.unit || "kg",
        costPerUnit: parseFloat(formData.costPerUnit) || 0
      };

      if (editingId) {
        setIngredients(ingredients.map(i => i.id === editingId ? newItem : i));
      } else {
        setIngredients([...ingredients, newItem]);
      }
    } else if (activeTab === "Escandallos") {
      const newItem = {
        productName: formData.productName || formData.name || "Nueva Receta",
        ingredients: formData.ingredients.length > 0 ? formData.ingredients : [{ name: "Ingrediente X", qty: 1, unit: "pz" }]
      };

      if (editingId) {
         setRecipes(recipes.map(r => r.productName === String(editingId) ? newItem : r));
      } else {
         setRecipes([...recipes, newItem]);
      }
    }
    
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventario y Escandallos</h1>
          <p className="text-slate-500 mt-1">Gestiona tus productos, stock de ingredientes y recetas.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isAdding && (
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/30"
            >
              <Plus size={18} />
              {activeTab === "Productos" ? "Nuevo Producto" : activeTab === "Ingredientes" ? "Nuevo Ingrediente" : "Nueva Receta"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(["Productos", "Ingredientes", "Escandallos"] as TabPanel[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder={`Buscar ${activeTab.toLowerCase()}...`} 
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
        </div>

        {isAdding && (
          <div className="p-6 bg-blue-50/50 border-b border-blue-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Editar' : 'Añadir'} {activeTab.slice(0, -1)}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Nombre" 
                value={formData.name || formData.productName || ''}
                className="p-3 rounded-xl border border-slate-200"
                onChange={e => setFormData({...formData, name: e.target.value, productName: e.target.value})}
              />
              {activeTab === "Productos" && (
                <>
                  <input type="number" placeholder="Precio de Venta" value={formData.price || ''} className="p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, price: e.target.value})} />
                  <input type="number" placeholder="Costo Estimado" value={formData.cost || ''} className="p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, cost: e.target.value})} />
                </>
              )}
              {activeTab === "Ingredientes" && (
                <>
                  <input type="number" placeholder="Stock Inicial" value={formData.stock || ''} className="p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, stock: e.target.value})} />
                  <input type="text" placeholder="Unidad (ej. kg, litros, pz)" value={formData.unit || ''} className="p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, unit: e.target.value})} />
                  <input type="number" placeholder="Costo por Unidad" value={formData.costPerUnit || ''} className="p-3 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, costPerUnit: e.target.value})} />
                </>
              )}
              {activeTab === "Escandallos" && (
                <div className="col-span-1 sm:col-span-2 space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3 text-sm">Ingredientes de la Receta</h4>
                    
                    {formData.ingredients && formData.ingredients.length > 0 ? (
                      <ul className="mb-4 space-y-2">
                        {formData.ingredients.map((ing: any, idx: number) => (
                           <li key={idx} className="flex justify-between text-sm items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                             <span><span className="font-medium text-slate-700">{ing.name}</span> - {ing.qty} {ing.unit}</span>
                             <button 
                               onClick={() => {
                                 const newIngs = [...formData.ingredients];
                                 newIngs.splice(idx, 1);
                                 setFormData({...formData, ingredients: newIngs});
                               }}
                               className="text-red-500 hover:text-red-700 p-1"
                             >
                               <Trash2 size={14} />
                             </button>
                           </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 mb-4 italic">No hay ingredientes agregados.</p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <select 
                        className="p-2 border border-slate-200 rounded-lg text-sm bg-white flex-1"
                        value={tempIngredient.name}
                        onChange={(e) => {
                           const selected = ingredients.find(i => i.name === e.target.value);
                           setTempIngredient({ ...tempIngredient, name: e.target.value, unit: selected ? selected.unit : "" });
                        }}
                      >
                        <option value="">Seleccionar Ingrediente...</option>
                        {ingredients.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                      </select>
                      <input 
                        type="number" 
                        placeholder="Cantidad" 
                        value={tempIngredient.qty}
                        onChange={e => setTempIngredient({...tempIngredient, qty: e.target.value})}
                        className="w-24 p-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <span className="text-sm text-slate-500 w-16 truncate">{tempIngredient.unit || "unidad"}</span>
                      <button 
                        onClick={() => {
                          if(tempIngredient.name && tempIngredient.qty) {
                            const newIngs = formData.ingredients || [];
                            setFormData({...formData, ingredients: [...newIngs, { name: tempIngredient.name, qty: parseFloat(tempIngredient.qty), unit: tempIngredient.unit || 'unidad' }]});
                            setTempIngredient({ name: "", qty: "", unit: "" });
                          }
                        }}
                        className="bg-slate-800 text-white px-3 py-2 text-sm rounded-lg hover:bg-slate-700 whitespace-nowrap"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-5 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-5 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 shadow-md transition-colors">Guardar {activeTab.slice(0, -1)}</button>
            </div>
          </div>
        )}

        {activeTab === "Productos" && (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Precio Venta</th>
                <th className="px-6 py-4">Costo (Escandallo)</th>
                <th className="px-6 py-4">Margen</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-4">{formatCOP(p.price)}</td>
                  <td className="px-6 py-4 text-orange-600">{formatCOP(p.cost)}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">{p.margin}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEditClick(p)} className="text-slate-400 hover:text-primary transition-colors p-1"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteClick(p.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 ml-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "Ingredientes" && (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold">
              <tr>
                <th className="px-6 py-4">Ingrediente</th>
                <th className="px-6 py-4">Stock Actual</th>
                <th className="px-6 py-4">Unidad</th>
                <th className="px-6 py-4">Costo por Unidad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ingredients.map(i => (
                <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{i.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      i.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {i.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">{i.unit}</td>
                  <td className="px-6 py-4">{formatCOP(i.costPerUnit)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEditClick(i)} className="text-slate-400 hover:text-primary transition-colors p-1"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteClick(i.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 ml-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "Escandallos" && (
          <div className="p-6 space-y-6">
            {recipes.map((r, idx) => {
              // Calculate costs
              let ingredientsCost = 0;
              const ingredientsWithCosts = r.ingredients.map(ing => {
                const matchedIngredient = ingredients.find(i => i.name === ing.name);
                const unitCost = matchedIngredient ? matchedIngredient.costPerUnit : 0;
                const costForQty = unitCost * ing.qty;
                ingredientsCost += costForQty;
                return { ...ing, unitCost, costForQty };
              });
              
              const mermaCost = ingredientsCost * 0.10; // 10% Merma
              const totalCost = ingredientsCost + mermaCost;
              const suggestedPrice = totalCost / 0.35; // 35% Food Cost

              return (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <List size={20} className="text-primary" />
                        {r.productName}
                      </h3>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <button onClick={() => handleEditClick(r)} className="text-sm text-primary font-medium hover:underline">Editar Receta</button>
                      <button onClick={() => handleDeleteClick(r.productName)} className="text-sm text-red-500 font-medium hover:underline">Eliminar Receta</button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mb-4 text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-2">Ingrediente</div>
                      <div>Cantidad</div>
                      <div className="hidden md:block">Costo Unitario Base</div>
                      <div className="text-right">Costo en Receta</div>
                    </div>
                    <div className="space-y-3 mb-4">
                      {ingredientsWithCosts.map((ing, i) => (
                        <div key={i} className="grid grid-cols-4 md:grid-cols-5 gap-4 text-sm text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100 items-center">
                          <div className="font-medium col-span-2 text-slate-900">{ing.name}</div>
                          <div>{ing.qty} <span className="text-slate-500 text-xs">{ing.unit}</span></div>
                          <div className="hidden md:block text-slate-500">{formatCOP(ing.unitCost)} / {ing.unit}</div>
                          <div className="text-right font-medium text-slate-700">{formatCOP(ing.costForQty)}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4 mt-2 space-y-2 max-w-sm ml-auto text-sm">
                       <div className="flex justify-between items-center text-slate-600">
                          <span>Total Ingredientes Netos:</span>
                          <span className="font-medium">{formatCOP(ingredientsCost)}</span>
                       </div>
                       <div className="flex justify-between items-center text-slate-600">
                          <span>+ Margen de Merma (10%):</span>
                          <span className="font-medium">{formatCOP(mermaCost)}</span>
                       </div>
                       <div className="flex justify-between items-center text-orange-600 font-bold text-base pt-2 border-t border-slate-100 mt-2">
                          <span>COSTO TOTAL DEL PLATO:</span>
                          <span>{formatCOP(totalCost)}</span>
                       </div>
                       
                       <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl mt-4 border border-emerald-100 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-bold">Precio Sugerido de Venta</span>
                            <span className="text-xs text-emerald-600/80">Basado en Food Cost (35%)</span>
                          </div>
                          <span className="font-black text-lg">{formatCOP(suggestedPrice)}</span>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
