import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        };
        const { data } = await axios.get(`${API_URL}/dashboard/stats`, config);
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-500">Total Products</p>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
