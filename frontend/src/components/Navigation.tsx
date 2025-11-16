import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, LogOut, LogIn, Home } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
          <Home size={28} />
          <span>NRG E-Store</span>
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="hover:text-blue-600">
            Products
          </Link>
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link to="/admin" className="hover:text-blue-600">
                Admin Dashboard
              </Link>
              <Link to="/admin/products" className="hover:text-blue-600">
                Manage Products
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === 'customer' && (
            <Link to="/account" className="hover:text-blue-600">
              Account
            </Link>
          )}

          <Link to="/cart" className="relative hover:text-blue-600">
            <ShoppingCart size={24} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-100 p-4 space-y-2">
          <Link to="/" className="block py-2 hover:text-blue-600">
            Products
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/account" className="block py-2 hover:text-blue-600">
                Account
              </Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-500">
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="block py-2 hover:text-blue-600">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
