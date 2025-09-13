import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth.tsx';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Sales } from './pages/Sales';
import { initDB } from './lib/db';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize IndexedDB
    initDB().catch(console.error);

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((swRegistration) => {
        //return swRegistration.sync.register('background-sync');
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* TEMPORARILY COMMENTED OUT - UNCOMMENT WHEN API IS READY */}
            {/* <Route path="/login" element={<Login />} /> */}
            <Route
              path="/"
              element={
                /* TEMPORARILY REMOVED PROTECTION - ADD BACK WHEN API IS READY */
                 (//<ProtectedRoute>
                  <Layout />
                 //</ProtectedRoute>
                 )
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="sales" element={<Sales />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;