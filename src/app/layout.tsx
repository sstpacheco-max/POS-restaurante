import type { Metadata } from "next";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restaurante La Española - Terminal de Transporte",
  description: "Sistema de punto de venta premium para el Restaurante La Española",
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
              const VERSION = '4.0.0';
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // Cache busting for the Service Worker registration itself
                  const swUrl = 'sw.js?v=' + VERSION;
                  
                  // Check if we need to force a refresh
                  const currentVersion = localStorage.getItem('punto_pos_app_version');
                  if (currentVersion !== VERSION) {
                    console.log('[App] New version detected, clearing caches...');
                    localStorage.setItem('punto_pos_app_version', VERSION);
                  }

                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    var unregisterPromises = registrations.map(function(r) { return r.unregister(); });
                    return Promise.all(unregisterPromises);
                  }).then(function() {
                    if (window.caches) {
                      caches.keys().then(function(keys) {
                        return Promise.all(keys.map(function(key) { return caches.delete(key); }));
                      });
                    }
                    return navigator.serviceWorker.register(swUrl);
                  }).then(function(registration) {
                    console.log('[SW] Registered successfully v' + VERSION);
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
