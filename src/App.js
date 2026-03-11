import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Collections from './pages/Collections';
import Brands from './pages/Brands';

import Orders from './pages/Orders';

const AdminLayout = () => {
    const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-300 hover:text-white cursor-pointer hover:font-bold">Dashboard</Link>
            <Link to="/products" className="text-gray-300 hover:text-white cursor-pointer hover:font-bold">Products</Link>
            <Link to="/collections" className="text-gray-300 hover:text-white cursor-pointer hover:font-bold">Collections</Link>
            <Link to="/brands" className="text-gray-300 hover:text-white cursor-pointer hover:font-bold">Brands</Link>
            <Link to="/orders" className="text-gray-300 hover:text-white cursor-pointer hover:font-bold">Orders</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-primary">Hydro Fishing Tackles - Management</h2>
          <button onClick={handleLogout} className="text-red-500 font-semibold hover:text-red-700 transition">Logout</button>
        </header>
        
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
