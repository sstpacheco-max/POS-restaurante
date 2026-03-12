"use client";
import { useEffect, useState } from "react";

export default function SeedPage() {
  const [status, setStatus] = useState<"cargando" | "listo" | "error">("cargando");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    try {
      const productos = [
        { id: 1, name: "Desayuno (Huevos al gusto)", price: 10000, category: "Platos Principales", image: "🍳", stock: true, cost: 3000, margin: "70%" },
        { id: 2, name: "Café en leche", price: 3500, category: "Bebidas", image: "☕", stock: true, cost: 1000, margin: "71%" },
        { id: 3, name: "Tamal (unidad)", price: 12000, category: "Platos Principales", image: "🫔", stock: true, cost: 4500, margin: "62%" },
        { id: 4, name: "Sancocho (porción)", price: 18000, category: "Platos Principales", image: "🍲", stock: true, cost: 7000, margin: "61%" },
        { id: 5, name: "Almuerzo Ejecutivo", price: 16000, category: "Platos Principales", image: "🍛", stock: true, cost: 8000, margin: "50%" },
        { id: 6, name: "Jugo Natural (12oz)", price: 5000, category: "Bebidas", image: "🥤", stock: true, cost: 1500, margin: "70%" },
        { id: 7, name: "Changua", price: 8000, category: "Platos Principales", image: "🥣", stock: true, cost: 2500, margin: "69%" },
        { id: 8, name: "Chocolate Santafereño", price: 6000, category: "Bebidas", image: "🍫", stock: true, cost: 1800, margin: "70%" },
        { id: 9, name: "Pan de Bono", price: 2000, category: "Entradas", image: "🥐", stock: true, cost: 600, margin: "70%" },
        { id: 10, name: "Postre del Día", price: 5000, category: "Postres", image: "🍮", stock: true, cost: 1500, margin: "70%" },
      ];

      const ingredientes = [
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
        { id: 12, name: "Chocolate", stock: 8, unit: "kg", costPerUnit: 22000 },
        { id: 13, name: "Harina de Maíz", stock: 20, unit: "kg", costPerUnit: 3500 },
        { id: 14, name: "Queso", stock: 15, unit: "kg", costPerUnit: 18000 },
        { id: 15, name: "Cebolla Cabezona", stock: 30, unit: "kg", costPerUnit: 2000 },
        { id: 16, name: "Tomate", stock: 25, unit: "kg", costPerUnit: 3000 },
        { id: 17, name: "Cilantro", stock: 5, unit: "kg", costPerUnit: 6000 },
        { id: 18, name: "Agua Aromática", stock: 100, unit: "sobres", costPerUnit: 200 },
      ];

      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      const fb = `${año}-${mes}-${dia}`;
      const h = (hh: number, mm: number) =>
        `${fb}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00.000Z`;

      const ventas = [
        { id: Date.now() + 1, date: h(11, 5), total: 13500, method: "Efectivo", items: [{ name: "Desayuno (Huevos al gusto)", price: 10000, quantity: 1, category: "Platos Principales" }, { name: "Café en leche", price: 3500, quantity: 1, category: "Bebidas" }] },
        { id: Date.now() + 2, date: h(11, 22), total: 7000, method: "Efectivo", items: [{ name: "Café en leche", price: 3500, quantity: 2, category: "Bebidas" }] },
        { id: Date.now() + 3, date: h(11, 45), total: 19000, method: "Transferencia", items: [{ name: "Tamal (unidad)", price: 12000, quantity: 1, category: "Platos Principales" }, { name: "Jugo Natural (12oz)", price: 5000, quantity: 1, category: "Bebidas" }, { name: "Pan de Bono", price: 2000, quantity: 1, category: "Entradas" }] },
        { id: Date.now() + 4, date: h(12, 10), total: 21500, method: "Efectivo", items: [{ name: "Desayuno (Huevos al gusto)", price: 10000, quantity: 1, category: "Platos Principales" }, { name: "Changua", price: 8000, quantity: 1, category: "Platos Principales" }, { name: "Café en leche", price: 3500, quantity: 1, category: "Bebidas" }] },
        { id: Date.now() + 5, date: h(12, 30), total: 10000, method: "Tarjeta", items: [{ name: "Chocolate Santafereño", price: 6000, quantity: 1, category: "Bebidas" }, { name: "Pan de Bono", price: 2000, quantity: 2, category: "Entradas" }] },
        { id: Date.now() + 6, date: h(12, 55), total: 13000, method: "Efectivo", items: [{ name: "Tamal (unidad)", price: 12000, quantity: 1, category: "Platos Principales" }, { name: "Agua Aromática", price: 1000, quantity: 1, category: "Bebidas" }] },
        { id: Date.now() + 7, date: h(13, 5), total: 30500, method: "Efectivo", items: [{ name: "Desayuno (Huevos al gusto)", price: 10000, quantity: 2, category: "Platos Principales" }, { name: "Café en leche", price: 3500, quantity: 3, category: "Bebidas" }] },
        { id: Date.now() + 8, date: h(13, 20), total: 10000, method: "Transferencia", items: [{ name: "Desayuno (Huevos al gusto)", price: 10000, quantity: 1, category: "Platos Principales" }] },
        { id: Date.now() + 9, date: h(13, 40), total: 22000, method: "Tarjeta", items: [{ name: "Changua", price: 8000, quantity: 1, category: "Platos Principales" }, { name: "Chocolate Santafereño", price: 6000, quantity: 1, category: "Bebidas" }, { name: "Pan de Bono", price: 2000, quantity: 4, category: "Entradas" }] },
        { id: Date.now() + 10, date: h(14, 5), total: 23000, method: "Efectivo", items: [{ name: "Sancocho (porción)", price: 18000, quantity: 1, category: "Platos Principales" }, { name: "Jugo Natural (12oz)", price: 5000, quantity: 1, category: "Bebidas" }] },
        { id: Date.now() + 11, date: h(14, 25), total: 29000, method: "Efectivo", items: [{ name: "Desayuno (Huevos al gusto)", price: 10000, quantity: 2, category: "Platos Principales" }, { name: "Café en leche", price: 3500, quantity: 2, category: "Bebidas" }, { name: "Pan de Bono", price: 2000, quantity: 1, category: "Entradas" }] },
        { id: Date.now() + 12, date: h(14, 50), total: 12000, method: "Tarjeta", items: [{ name: "Tamal (unidad)", price: 12000, quantity: 1, category: "Platos Principales" }] },
        { id: Date.now() + 13, date: h(15, 5), total: 16000, method: "Tarjeta", items: [{ name: "Almuerzo Ejecutivo", price: 16000, quantity: 1, category: "Platos Principales" }] },
        { id: Date.now() + 14, date: h(15, 20), total: 23000, method: "Efectivo", items: [{ name: "Desayuno (Huevos al gusto)", price: 10000, quantity: 1, category: "Platos Principales" }, { name: "Chocolate Santafereño", price: 6000, quantity: 1, category: "Bebidas" }, { name: "Pan de Bono", price: 2000, quantity: 2, category: "Entradas" }, { name: "Postre del Día", price: 5000, quantity: 1, category: "Postres" }] },
        { id: Date.now() + 15, date: h(15, 45), total: 23000, method: "Transferencia", items: [{ name: "Sancocho (porción)", price: 18000, quantity: 1, category: "Platos Principales" }, { name: "Jugo Natural (12oz)", price: 5000, quantity: 1, category: "Bebidas" }] },
        { id: Date.now() + 16, date: h(16, 10), total: 32000, method: "Efectivo", items: [{ name: "Almuerzo Ejecutivo", price: 16000, quantity: 2, category: "Platos Principales" }] },
        { id: Date.now() + 17, date: h(16, 30), total: 25500, method: "Tarjeta", items: [{ name: "Desayuno (Huevos al gusto)", price: 10000, quantity: 1, category: "Platos Principales" }, { name: "Tamal (unidad)", price: 12000, quantity: 1, category: "Platos Principales" }, { name: "Café en leche", price: 3500, quantity: 1, category: "Bebidas" }] },
        { id: Date.now() + 18, date: h(16, 55), total: 23000, method: "Efectivo", items: [{ name: "Sancocho (porción)", price: 18000, quantity: 1, category: "Platos Principales" }, { name: "Postre del Día", price: 5000, quantity: 1, category: "Postres" }] },
        { id: Date.now() + 19, date: h(16, 32), total: 34000, method: "Efectivo", items: [{ name: "Almuerzo Ejecutivo", price: 16000, quantity: 1, category: "Platos Principales" }, { name: "Sancocho (porción)", price: 18000, quantity: 1, category: "Platos Principales" }] },
        { id: Date.now() + 20, date: h(16, 45), total: 29500, method: "Transferencia", items: [{ name: "Almuerzo Ejecutivo", price: 16000, quantity: 1, category: "Platos Principales" }, { name: "Desayuno (Huevos al gusto)", price: 10000, quantity: 1, category: "Platos Principales" }, { name: "Café en leche", price: 3500, quantity: 1, category: "Bebidas" }] },
      ];

      localStorage.setItem("punto_pos_products_v2", JSON.stringify(productos));
      localStorage.setItem("punto_pos_ingredients_v2", JSON.stringify(ingredientes));
      localStorage.setItem("punto_pos_sales", JSON.stringify(ventas));

      const totalVal = ventas.reduce((s, v) => s + v.total, 0);
      setTotal(totalVal);
      setStatus("listo");
    } catch {
      setStatus("error");
    }
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ background: "#1e293b", padding: "2.5rem 3rem", borderRadius: "1.5rem", textAlign: "center", maxWidth: 420, width: "90%" }}>
        {status === "cargando" && (
          <>
            <div style={{ fontSize: "3rem" }}>⏳</div>
            <h1 style={{ color: "white", marginTop: "1rem" }}>Cargando datos...</h1>
          </>
        )}
        {status === "listo" && (
          <>
            <div style={{ fontSize: "3rem" }}>✅</div>
            <h1 style={{ color: "white", marginTop: "1rem" }}>¡Datos cargados!</h1>
            <ul style={{ textAlign: "left", background: "#0f172a", padding: "1rem 1.5rem", borderRadius: "0.75rem", marginTop: "1.5rem", color: "#cbd5e1", lineHeight: "2" }}>
              <li>📦 <b>10 productos</b> en inventario</li>
              <li>🥬 <b>18 ingredientes</b> en stock</li>
              <li>🧾 <b>20 ventas</b> (06:00 AM – 05:00 PM)</li>
              <li>💰 <b>Total:</b> {fmt(total)}</li>
            </ul>
            <a href="/dashboard" style={{ display: "inline-block", marginTop: "1.5rem", background: "#10b981", color: "white", padding: "0.75rem 2rem", borderRadius: "0.75rem", textDecoration: "none", fontWeight: "bold", fontSize: "1rem" }}>
              ➡️ Ir al Dashboard
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: "3rem" }}>❌</div>
            <h1 style={{ color: "white" }}>Error al cargar</h1>
            <p style={{ color: "#94a3b8" }}>Intenta recargar esta página.</p>
          </>
        )}
      </div>
    </div>
  );
}
