import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

interface ProductPerformance {
  name: string;
  units: number;
  revenue: number;
}

export const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock sales data
      const mockSalesData: SalesData[] = [
        { date: '2024-03-01', sales: 1250, orders: 12 },
        { date: '2024-03-02', sales: 1890, orders: 18 },
        { date: '2024-03-03', sales: 2100, orders: 21 },
        { date: '2024-03-04', sales: 1560, orders: 15 },
        { date: '2024-03-05', sales: 2430, orders: 24 },
        { date: '2024-03-06', sales: 1870, orders: 17 },
        { date: '2024-03-07', sales: 2100, orders: 20 },
      ];
      
      const mockProductData: ProductPerformance[] = [
        { name: 'Wireless Mouse', units: 45, revenue: 1349.55 },
        { name: 'Keyboard', units: 32, revenue: 2879.68 },
        { name: 'Monitor', units: 18, revenue: 5399.82 },
        { name: 'USB Cable', units: 89, revenue: 1155.11 },
        { name: 'Headphones', units: 27, revenue: 1349.73 },
      ];
      
      setSalesData(mockSalesData);
      setProductData(mockProductData);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // In production, this would generate a PDF
    alert('Export functionality would generate PDF/CSV report');
  };

  const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

  const totalRevenue = salesData.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Reports & Analytics</h1>
            <p className="text-secondary-500 mt-1">View sales trends and business performance</p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              <Button 
                variant={period === 'daily' ? 'primary' : 'ghost'} 
                size="sm"
                onClick={() => setPeriod('daily')}
              >
                Daily
              </Button>
              <Button 
                variant={period === 'weekly' ? 'primary' : 'ghost'} 
                size="sm"
                onClick={() => setPeriod('weekly')}
              >
                Weekly
              </Button>
              <Button 
                variant={period === 'monthly' ? 'primary' : 'ghost'} 
                size="sm"
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </Button>
            </div>
            <Button variant="secondary" icon={<ArrowDownTrayIcon className="w-5 h-5" />} onClick={exportReport}>
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-sm text-secondary-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-secondary-900">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-success-600 mt-1">↑ 12.5% vs last period</p>
          </Card>
          <Card>
            <p className="text-sm text-secondary-500 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-secondary-900">{totalOrders}</p>
            <p className="text-xs text-success-600 mt-1">↑ 8.2% vs last period</p>
          </Card>
          <Card>
            <p className="text-sm text-secondary-500 mb-1">Average Order Value</p>
            <p className="text-2xl font-bold text-secondary-900">${averageOrderValue.toFixed(2)}</p>
            <p className="text-xs text-success-600 mt-1">↑ 3.7% vs last period</p>
          </Card>
          <Card>
            <p className="text-sm text-secondary-500 mb-1">Top Product Category</p>
            <p className="text-2xl font-bold text-secondary-900">Electronics</p>
            <p className="text-xs text-secondary-600 mt-1">45% of sales</p>
          </Card>
        </div>

        {/* Sales Chart */}
        <Card className="mb-6">
          <h3 className="text-lg font-bold text-secondary-900 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#2563EB" name="Sales ($)" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#22C55E" name="Orders" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Product Performance */}
          <Card>
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Top Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="units" fill="#2563EB" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue by Product */}
          <Card>
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.payload.name}: $${entry.payload.revenue}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <Card>
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Daily Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Best Day</span>
                <span className="font-medium">Saturday</span>
                <span className="text-success-600">$2,430</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Peak Hour</span>
                <span className="font-medium">2:00 PM - 4:00 PM</span>
                <span className="text-success-600">32 orders</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Returning Customers</span>
                <span className="font-medium">68%</span>
                <span className="text-success-600">+15%</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Payment Method Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>💳 Card</span>
                <span className="font-medium">45%</span>
                <div className="flex-1 mx-4 h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>💵 Cash</span>
                <span className="font-medium">35%</span>
                <div className="flex-1 mx-4 h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div className="h-full bg-success-600 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>📱 Mobile Money</span>
                <span className="font-medium">15%</span>
                <div className="flex-1 mx-4 h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div className="h-full bg-warning-600 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>📝 Credit</span>
                <span className="font-medium">5%</span>
                <div className="flex-1 mx-4 h-2 bg-secondary-100 rounded-full overflow-hidden">
                  <div className="h-full bg-danger-600 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};