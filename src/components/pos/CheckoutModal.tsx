"use client";

import { useState } from "react";
import { X, QrCode, CreditCard, Banknote, SplitSquareHorizontal, CheckCircle2 } from "lucide-react";

type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export default function CheckoutModal({ isOpen, onClose, total }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<{method: PaymentMethod, amount: number}[]>([
    { method: "Efectivo", amount: total / 2 },
    { method: "Tarjeta", amount: total / 2 }
  ]);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleProcessPayment = () => {
    // Here we would call Supabase to register the transaction
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold tracking-tight">Procesar Pago</h2>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center pb-1">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">¡Pago Exitoso!</h3>
            <p className="text-slate-500">La factura ha sido generada correctamente y la mesa está libre.</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            
            {/* Total Display */}
            <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Monto a Cobrar</p>
              <h3 className="text-5xl font-extrabold text-slate-900">${total.toFixed(2)}</h3>
            </div>

            {/* Split Toggle */}
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <SplitSquareHorizontal size={24} className={splitPayment ? "text-primary" : "text-slate-400"} />
                <div>
                  <p className="font-semibold text-sm">Dividir Cuenta</p>
                  <p className="text-xs text-slate-500">Múltiples métodos de pago</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" className="sr-only peer" checked={splitPayment} onChange={() => setSplitPayment(!splitPayment)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Payment Methods */}
            {!splitPayment ? (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod("Efectivo")}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "Efectivo" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <Banknote size={28} />
                  <span className="font-semibold text-sm">Efectivo</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("Tarjeta")}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "Tarjeta" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <CreditCard size={28} />
                  <span className="font-semibold text-sm">Tarjeta</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("Transferencia")}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "Transferencia" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <QrCode size={28} />
                  <span className="font-semibold text-sm">QR / Transf</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                 <div className="flex justify-between items-center text-sm mb-2">
                   <span className="font-medium text-slate-600">Efectivo</span>
                   <input type="number" defaultValue={total / 2} className="w-24 text-right border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary" />
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="font-medium text-slate-600">Tarjeta</span>
                   <input type="number" defaultValue={total / 2} className="w-24 text-right border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary" />
                 </div>
                 <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-800">
                    <span>Restante:</span>
                    <span className="text-emerald-600">$0.00</span>
                 </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2">
              <button 
                onClick={handleProcessPayment}
                className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-colors active:scale-[0.98]"
              >
                Procesar Pago {splitPayment ? "Dividido" : `en ${paymentMethod}`}
              </button>
              <button className="w-full mt-3 flex items-center justify-center gap-2 text-primary font-medium p-3 hover:bg-primary/5 rounded-xl transition-colors">
                <QrCode size={18} />
                Generar QR para Facturación Electrónica
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
