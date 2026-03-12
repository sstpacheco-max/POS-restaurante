import type { Metadata } from "next";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punto POS - Gestión de Restaurante",
  description: "Sistema de punto de venta premium para restaurantes y cafeterías",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // First, unregister any old service workers to clear stale CSS cache
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    var unregisterPromises = registrations.map(function(r) { return r.unregister(); });
                    return Promise.all(unregisterPromises);
                  }).then(function() {
                    // Then clear all caches to ensure fresh CSS/JS is loaded
                    if (window.caches) {
                      caches.keys().then(function(keys) {
                        return Promise.all(keys.map(function(key) { return caches.delete(key); }));
                      });
                    }
                    // Re-register the updated service worker
                    return navigator.serviceWorker.register('/sw.js');
                  }).then(function(registration) {
                    console.log('[SW] Registered successfully with network-first strategy');
                  }).catch(function(err) {
                    console.warn('[SW] Registration failed:', err);
                  });
                });
              }
            `
          }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <main className="min-h-screen bg-slate-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
