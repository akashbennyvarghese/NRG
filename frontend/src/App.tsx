import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import ProductListing from './pages/customer/ProductListing';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import OrderTracking from './pages/customer/OrderTracking';
import Account from './pages/customer/Account';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import Analytics from './pages/admin/Analytics';

// Components
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
      <Router>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route path="/" element={<ProductListing />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/order-confirmation/:orderId" element={<PrivateRoute><OrderConfirmation /></PrivateRoute>} />
            <Route path="/orders/:orderId" element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
            <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>}
            />
            <Route
              path="/admin/products"
              element={<PrivateRoute adminOnly><ProductManagement /></PrivateRoute>}
            />
            <Route
              path="/admin/inventory"
              element={<PrivateRoute adminOnly><InventoryManagement /></PrivateRoute>}
            />
            <Route
              path="/admin/orders"
              element={<PrivateRoute adminOnly><OrderManagement /></PrivateRoute>}
            />
            <Route
              path="/admin/analytics"
              element={<PrivateRoute adminOnly><Analytics /></PrivateRoute>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
