"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Store, CreditCard, Receipt, Printer, CheckCircle2 } from "lucide-react";

type SettingsTab = "business" | "taxes" | "payments" | "printers";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  
  // Business State
  const [storeName, setStoreName] = useState("Restaurante POS Pro");
  const [address, setAddress] = useState("Calle Principal 123");
  const [phone, setPhone] = useState("+34 900 123 456");
  
  // Taxes State
  const [currency, setCurrency] = useState("EUR");
  const [taxRate, setTaxRate] = useState("21");
  const [taxName, setTaxName] = useState("IVA");

  // Payments State
  const [cashEnabled, setCashEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [transferEnabled, setTransferEnabled] = useState(false);

  // Printers State
  const [receiptPrinter, setReceiptPrinter] = useState("POS-80C");
  const [kitchenPrinter, setKitchenPrinter] = useState("Kitchen-Thermal");

  useEffect(() => {
    // Cargar configuración guardada al iniciar
    const savedSettings = localStorage.getItem("pos_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.taxRate) setTaxRate(parsed.taxRate);
        if (parsed.taxName) setTaxName(parsed.taxName);
        if (parsed.cashEnabled !== undefined) setCashEnabled(parsed.cashEnabled);
        if (parsed.cardEnabled !== undefined) setCardEnabled(parsed.cardEnabled);
        if (parsed.transferEnabled !== undefined) setTransferEnabled(parsed.transferEnabled);
        if (parsed.receiptPrinter) setReceiptPrinter(parsed.receiptPrinter);
        if (parsed.kitchenPrinter) setKitchenPrinter(parsed.kitchenPrinter);
      } catch (e) {
        console.error("Error al cargar configuración", e);
      }
    }
  }, []);

  const handleSave = () => {
    const settingsToSave = {
      storeName, address, phone,
      currency, taxRate, taxName,
      cashEnabled, cardEnabled, transferEnabled,
      receiptPrinter, kitchenPrinter
    };
    localStorage.setItem("pos_settings", JSON.stringify(settingsToSave));
    alert("Configuración y cambios guardados exitosamente.");
  };

  const tabs = [
    { id: "business", label: "Datos del Negocio", icon: Store },
    { id: "taxes", label: "Impuestos y Facturación", icon: Receipt },
    { id: "payments", label: "Métodos de Pago", icon: CreditCard },
    { id: "printers", label: "Impresoras", icon: Printer },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
          <p className="text-slate-500 mt-1">Ajusta los parámetros generales del sistema.</p>
        </div>
        
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/30"
        >
          <Save size={18} />
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive 
                    ? "bg-white text-primary border border-slate-200 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-6">
            
            {activeTab === "business" && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <Store size={22} className="text-slate-400" />
                  Información General
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nombre del Negocio</label>
                    <input 
                      type="text" 
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Dirección</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "taxes" && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <Receipt size={22} className="text-slate-400" />
                  Moneda e Impuestos
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Moneda Principal</label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="EUR">Euros (€)</option>
                      <option value="USD">Dólares ($)</option>
                      <option value="MXN">Pesos Mexicanos (MXN)</option>
                      <option value="COP">Pesos Colombianos (COP)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700">Nombre del Impuesto</label>
                     <input 
                       type="text" 
                       value={taxName}
                       onChange={(e) => setTaxName(e.target.value)}
                       placeholder="Ej. IVA, ITBIS, IGV"
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Tasa de Impuesto (%)</label>
                    <input 
                      type="number" 
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <CreditCard size={22} className="text-slate-400" />
                  Métodos de Pago Habilitados
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                     <div>
                       <h3 className="font-semibold text-slate-800">Efectivo</h3>
                       <p className="text-sm text-slate-500">Permitir pagos en efectivo y cálculo de cambio.</p>
                     </div>
                     <button 
                       onClick={() => setCashEnabled(!cashEnabled)}
                       className={`w-12 h-6 rounded-full transition-colors relative ${cashEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                     >
                       <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${cashEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                     <div>
                       <h3 className="font-semibold text-slate-800">Tarjeta de Crédito / Débito</h3>
                       <p className="text-sm text-slate-500">Integración con terminales y pasarelas.</p>
                     </div>
                     <button 
                       onClick={() => setCardEnabled(!cardEnabled)}
                       className={`w-12 h-6 rounded-full transition-colors relative ${cardEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                     >
                       <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${cardEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                     <div>
                       <h3 className="font-semibold text-slate-800">Nequi, DaviPlata, dale! o Transfiya</h3>
                       <p className="text-sm text-slate-500">Pagos mediante billeteras digitales y transferencias móviles.</p>
                     </div>
                     <button 
                       onClick={() => setTransferEnabled(!transferEnabled)}
                       className={`w-12 h-6 rounded-full transition-colors relative ${transferEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                     >
                       <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${transferEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "printers" && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <Printer size={22} className="text-slate-400" />
                  Configuración de Impresión y Pantallas
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <h3 className="font-semibold text-slate-700">Recibos y Facturación Electrónica</h3>
                     <div className="space-y-2">
                       <select 
                         value={receiptPrinter}
                         onChange={(e) => setReceiptPrinter(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                       >
                         <option value="POS-80C">Imprimir Ticket (Caja Física)</option>
                         <option value="Email">Enviar por Correo Electrónico</option>
                         <option value="Email_Print">Ticket Físico + Correo Electrónico</option>
                         <option value="PDF">Guardar/Descargar como PDF</option>
                       </select>
                     </div>
                     <button className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                        <CheckCircle2 size={16} /> Probar Envío/Impresión
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                     <h3 className="font-semibold text-slate-700">Envío a Cocina / Pantalla (KDS)</h3>
                     <div className="space-y-2">
                       <select 
                         value={kitchenPrinter}
                         onChange={(e) => setKitchenPrinter(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                       >
                         <option value="KDS-Main">Enviar Alerta a Pantalla de Cocina</option>
                         <option value="Kitchen-Thermal">Impresora Térmica en Cocina</option>
                         <option value="None">Desactivar envío a cocina</option>
                       </select>
                     </div>
                     <button className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                        <CheckCircle2 size={16} /> Probar Alerta en Pantalla
                     </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
