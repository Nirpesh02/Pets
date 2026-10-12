import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { PetProvider } from './context/PetContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';

export function App() {

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <PetProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </PetProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
