import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  totalCustomers: number;
  todaySales: number;
  monthlyRevenue: number;
  outstandingCredit: number;
}

export const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStock: 0,
    totalCustomers: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    outstandingCredit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        totalProducts: 245,
        lowStock: 12,
        totalCustomers: 89,
        todaySales: 1245.50,
        monthlyRevenue: 8750.25,
        outstandingCredit: 3250.00,
      });
      
      setLowStockProducts([
        { id: 1, name: 'Wireless Mouse', stock: 3, category: 'Electronics' },
        { id: 2, name: 'USB-C Cable', stock: 2, category: 'Accessories' },
        { id: 3, name: 'Monitor Stand', stock: 1, category: 'Furniture' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Today\'s Sales',
      value: `$${stats.todaySales.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-success-500',
      change: '+12.5%',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-primary-500',
      change: '+8.2%',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: CubeIcon,
      color: 'bg-blue-500',
      change: '+5',
    },
    {
      title: 'Outstanding Credit',
      value: `$${stats.outstandingCredit.toLocaleString()}`,
      icon: UsersIcon,
      color: 'bg-warning-500',
      change: '-2.3%',
    },
  ];

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-secondary-500 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-secondary-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                <p className="text-xs text-success-600 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Link to="/pos">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <ShoppingBagIcon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
            <h3 className="font-bold text-secondary-900">New Sale</h3>
            <p className="text-sm text-secondary-500">Start a new transaction</p>
          </Card>
        </Link>
        
        {isAdmin() && (
          <>
            <Link to="/products">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CubeIcon className="w-12 h-12 text-success-600 mx-auto mb-3" />
                <h3 className="font-bold text-secondary-900">Manage Products</h3>
                <p className="text-sm text-secondary-500">Add or edit inventory</p>
              </Card>
            </Link>
            
            <Link to="/customers">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <UsersIcon className="w-12 h-12 text-warning-600 mx-auto mb-3" />
                <h3 className="font-bold text-secondary-900">Customers</h3>
                <p className="text-sm text-secondary-500">Manage credit and payments</p>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning-600" />
            <h2 className="text-lg font-bold text-secondary-900">Low Stock Alert</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-secondary-600">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-secondary-600">Category</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">Stock</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-secondary-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {lowStockProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-secondary-600">{product.category}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-danger-600">{product.stock} units</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-danger-100 text-danger-700 rounded-full text-xs">
                        Restock Needed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {isAdmin() && (
            <div className="mt-4 text-right">
              <Button variant="secondary" size="sm">
                View All Low Stock
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};