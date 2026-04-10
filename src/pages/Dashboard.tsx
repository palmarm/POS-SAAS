import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI, saleAPI, customerAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
    ShoppingBagIcon, 
    CurrencyDollarIcon, 
    UsersIcon, 
    CubeIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

interface DashboardStats {
    totalProducts: number;
    lowStock: number;
    totalCustomers: number;
    todaySales: number;
    monthlyRevenue: number;
    outstandingCredit: number;
}
interface Product {
    id: number;
    name: string;
    stock: number;
    min_stock: number;
    price: number;
}
interface Customer {
    id: number;
    name: string;
    outstanding_balance: number;
}

interface Sale {
    id: number;
    total: number;
    created_at: string;
}

export const Dashboard: React.FC = () => {
    const { user, business, isAdmin, isManager } = useAuth();
    const { showToast } = useToast();
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        lowStock: 0,
        totalCustomers: 0,
        todaySales: 0,
        monthlyRevenue: 0,
        outstandingCredit: 0,
    });
    const [loading, setLoading] = useState(true);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch products with error handling
            let products: Product[] = [];
            try {
                const productsRes = await productAPI.getAll();
                // Handle different response structures
                if (productsRes.data && productsRes.data.data && Array.isArray(productsRes.data.data)) {
                    products = productsRes.data.data;
                } else if (productsRes.data && Array.isArray(productsRes.data)) {
                    products = productsRes.data;
                } else if (Array.isArray(productsRes.data)) {
                    products = productsRes.data;
                }
                console.log('Products loaded:', products.length);
            } catch (error) {
                console.error('Failed to fetch products:', error);
                showToast('Failed to load products data', 'error');
            }
            
            // Fetch customers with error handling
            let customers: Customer[] = [];
            try {
                const customersRes = await customerAPI.getAll();
                if (customersRes.data && customersRes.data.data && Array.isArray(customersRes.data.data)) {
                    customers = customersRes.data.data;
                } else if (customersRes.data && Array.isArray(customersRes.data)) {
                    customers = customersRes.data;
                }
                console.log('Customers loaded:', customers.length);
            } catch (error) {
                console.error('Failed to fetch customers:', error);
                showToast('Failed to load customers data', 'error');
            }
            
            // Fetch sales with error handling
            let sales: Sale[] = [];
            try {
                const salesRes = await saleAPI.getAll();
                if (salesRes.data && salesRes.data.data && Array.isArray(salesRes.data.data)) {
                    sales = salesRes.data.data;
                } else if (salesRes.data && Array.isArray(salesRes.data)) {
                    sales = salesRes.data;
                }
                console.log('Sales loaded:', sales.length);
            } catch (error) {
                console.error('Failed to fetch sales:', error);
                showToast('Failed to load sales data', 'error');
            }
            
            // Calculate stats safely
            const today = new Date().toISOString().split('T')[0];
            const todaySales = sales
                .filter((s: Sale) => new Date(s.created_at).toISOString().split('T')[0] === today)
                .reduce((sum: number, s: Sale) => sum + (s.total || 0), 0);
            
            const thisMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = sales
                .filter((s: Sale) => {
                    const saleDate = new Date(s.created_at);
                    return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === currentYear;
                })
                .reduce((sum: number, s: Sale) => sum + (s.total || 0), 0);
            
            const outstandingCredit = customers.reduce((sum: number, c: Customer) => sum + (c.outstanding_balance || 0), 0);
            const lowStock = products.filter((p: Product) => (p.stock || 0) <= (p.min_stock || 10)).length;
            
            setStats({
                totalProducts: products.length,
                lowStock,
                totalCustomers: customers.length,
                todaySales,
                monthlyRevenue,
                outstandingCredit,
            });
            
            setLowStockProducts(products.filter((p: Product) => (p.stock || 0) <= (p.min_stock || 10)).slice(0, 5));
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };


    const statCards = [
         {
            title: 'Today\'s Sales',
            value: `$${stats.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CurrencyDollarIcon,
            color: 'bg-success-500',
        },
        {
            title: 'Monthly Revenue',
            value: `$${stats.monthlyRevenue.toLocaleString(
                undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`,
            icon: ArrowTrendingUpIcon,
            color: 'bg-primary-500',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts.toLocaleString(),
            icon: CubeIcon,
            color: 'bg-blue-500',
        },
        {
            title: 'Outstanding Credit',
            value: `$${stats.outstandingCredit.toLocaleString(
                undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`,
            icon: UsersIcon,
            color: 'bg-warning-500',
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Welcome Header with Business Info */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <BuildingStorefrontIcon className="w-8 h-8 text-primary-600" />
                    <h1 className="text-2xl font-bold text-secondary-900">
                        {business?.name || 'My Business'}
                    </h1>
                    {business?.subscription && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            business.subscription.status === 'active' 
                                ? 'bg-success-100 text-success-700'
                                : 'bg-warning-100 text-warning-700'
                        }`}>
                            {business.subscription.plan} Plan • {business.subscription.status}
                        </span>
                    )}
                </div>
                <p className="text-secondary-500">
                    Welcome back, {user?.name || 'User'}! Here's what's happening with your business today.
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
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-6 mb-8">
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
                        
                        <Link to="/users">
                            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                                <UsersIcon className="w-12 h-12 text-info-600 mx-auto mb-3" />
                                <h3 className="font-bold text-secondary-900">Team Members</h3>
                                <p className="text-sm text-secondary-500">Manage users and roles</p>
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
                                    <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">Current Stock</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">Min Stock</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-secondary-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-200">
                                {lowStockProducts.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3 font-medium">{product.name}</td>
                                        <td className="px-4 py-3 text-right text-danger-600 font-medium">{product.stock}</td>
                                        <td className="px-4 py-3 text-right text-secondary-600">{product.min_stock || 10}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 bg-danger-100 text-danger-700 rounded-full text-xs">
                                                {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};