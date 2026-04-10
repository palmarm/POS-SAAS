import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { CalendarIcon, ArrowDownTrayIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../hooks/useToast';
import { reportAPI, saleAPI, productAPI } from '../../services/api';
import { set } from 'react-hook-form';
import { parse } from 'path';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
  average_order: number;
}

interface ProductPerformance {
  name: string;
  units: number;
  revenue: number;
  sku: string;
}

interface PaymentBreakdown {
  payment_type: string;
  count: number;
  total_amount: number;
  percentage: number;
}

interface ReportSummary {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  unique_customers: number;
}


export const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductPerformance[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    total_orders: 0,
    total_revenue: 0,
    average_order_value: 0,
    unique_customers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
     // Fetch sales report from API
     const response = await reportAPI.getSalesReport(period);
     const data = response.data.data;

     // Format sales data for charts
     const formattedSaleData = data.daily_sales.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(),
        sales: parseFloat(item.total_sales) || 0,
        orders: parseInt(item.orders) || 0,
        average_order: parseFloat(item.average_order) || 0,
      }));
      setSalesData(formattedSaleData);

      // Formart payment breakdown
      const formattedPaymentData = data.payment_breakdown.map((payment: any) => ({
        payment_type: payment.payment_type,
        count: parseInt(payment.count) || 0,
        total_amount: parseFloat(payment.total_amount) || 0,
        percentage: 0,
      }));
      // Calculate percentage for payment breakdown
      const totalAmount = formattedPaymentData.reduce((sum:number, p:PaymentBreakdown) => sum + p.total_amount, 0);
      const formattedWithPercentage = formattedPaymentData.map((p: PaymentBreakdown) => ({
        ...p,
        percentage: totalAmount > 0 ? (p.total_amount / totalAmount) * 100 : 0,
      }));
      setPaymentBreakdown(formattedWithPercentage);

      setSummary({
        total_orders: parseInt(data.total_orders) || 0,
        total_revenue: parseFloat(data.total_revenue) || 0,
        average_order_value: parseFloat(data.average_order_value) || 0,
        unique_customers: parseInt(data.unique_customers) || 0,
      });
    } catch (error: any) {
      console.error('Failed to fetch report data:', error);
      showToast(error.response?.data?.message || 'Failed to load report data', 'error');

      // Fallback to mock data
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const mockSalesData: SalesData[] = [
      { date: 'Mar 1', sales: 1250, orders: 12, average_order: 104.17 },
      { date: 'Mar 2', sales: 1890, orders: 18, average_order: 105.00 },
      { date: 'Mar 3', sales: 2100, orders: 21, average_order: 100.00 },
      { date: 'Mar 4', sales: 1560, orders: 15, average_order: 104.00 },
      { date: 'Mar 5', sales: 2430, orders: 24, average_order: 101.25 },
      { date: 'Mar 6', sales: 1870, orders: 17, average_order: 110.00 },
      { date: 'Mar 7', sales: 2100, orders: 20, average_order: 105.00 },
    ];
    setSalesData(mockSalesData);
      
    const mockProductData: ProductPerformance[] = [
      { name: 'Wireless Mouse', units: 120, revenue: 2400, sku: 'WM-001' },
      { name: 'Bluetooth Headphones', units: 80, revenue: 4000, sku: 'BH-002' },
      { name: 'USB-C Hub', units: 60, revenue: 1800, sku: 'UH-003' },
      { name: 'Laptop Stand', units: 50, revenue: 2500, sku: 'LS-004' },
      { name: 'Webcam', units: 40, revenue: 3200, sku: 'WC-005' },
    ];
    setProductData(mockProductData);

    setSummary({
      total_orders: 120,
      total_revenue: 15000,
      average_order_value: 125,
      unique_customers: 80,
    });
  };

  const exportReport = async () => {
    setExporting(true);
    try {
      const response = await reportAPI.exportReport('sales');

      // Create a blob and download data
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Report exported successfully', 'success');
    } catch (error: any) {
      console.error('Export failed:', error);
      showToast(error.response?.data?.message || 'Failed to export report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportInventoryReport = async () => {
    setExporting(true);
    try {
      const response = await reportAPI.exportReport('products');
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('Inventory report exported successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to export inventory report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

   const getPaymentIcon = (method: string) => {
    const icons: Record<string, string> = {
      cash: '💵',
      card: '💳',
      mobile: '📱',
      credit: '📝'
    };
    return icons[method] || '💰';
  };

   const getPaymentColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: '#22C55E',
      card: '#2563EB',
      mobile: '#F59E0B',
      credit: '#EF4444'
    };
    return colors[method] || '#6B7280';
  };

  if (loading && salesData.length === 0) {
    return (
      <div className="pt-16 pl-[240px] bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading report data...</p>
        </div>
      </div>
    );
  }

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
            <Button 
            variant="secondary" 
            icon={<ArrowDownTrayIcon className="w-5 h-5" />} 
            onClick={exportReport}
            loading={exporting}>
              Export Sales
            </Button>
            <Button 
            variant="secondary" 
            icon={<ArrowDownTrayIcon className="w-5 h-5" />} 
            onClick={exportInventoryReport}
            loading={exporting}>
              Export Inventory
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-sm text-secondary-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-secondary-900">
              ${summary.total_revenue.toLocaleString(undefined, 
              { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }</p>

            <p className="text-xs text-success-600 mt-1">↑ 12.5% vs last period</p>
          </Card>
          <Card>
            <p className="text-sm text-secondary-500 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-secondary-900">{summary.total_orders}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowTrendingUpIcon className="w-3 h-3 text-success-600" />
              <p className="text-xs text-success-600">+8.2% vs last period</p>
            </div>
          </Card>
          <Card>
            <p className="text-sm text-secondary-500 mb-1">Average Order Value</p>
            <p className="text-2xl font-bold text-secondary-900">${summary.average_order_value.toFixed(2)}</p>
            <p className="text-xs text-success-600 mt-1">↑ 3.7% vs last period</p>
          </Card>
          <Card>
            <p className="text-sm text-secondary-500 mb-1">Unique Customers</p>
            <p className="text-2xl font-bold text-secondary-900">{summary.unique_customers}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowTrendingUpIcon className="w-3 h-3 text-success-600" />
              <p className="text-xs text-success-600">+15 new</p>
            </div>
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
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Top Products by Units Sold</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="units" fill="#2563EB" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue by Product */}
          <Card>
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Revenue by Product</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.payload.name}: $${entry.payload.revenue.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={value => `$${value}`}/>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <Card>
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Daily Performance Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Best Day</span>
                <span className="font-medium">Saturday</span>
                <span className="text-success-600">
                  ${Math.max(...salesData.map(d => d.sales)).toFixed(2)}
                  </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Peak Hour</span>
                <span className="font-medium">2:00 PM - 4:00 PM</span>
                <span className="text-success-600">
                  {Math.max(...salesData.map(d => d.orders))} orders</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Average per Day</span>
                <span className="font-medium">Daily Average</span>
                <span className="text-success-600">
                  ${(summary.total_revenue / salesData.length).toFixed(2)}
                  </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Top Product</span>
                <span className="font-medium">{productData[0]?.name || 'N/A'}</span>
                <span className="text-success-600">{productData[0]?.units || 0} units</span>
              </div>
            </div>
          </Card>

           <Card>
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Payment Method Breakdown</h3>
            <div className="space-y-3">
              {paymentBreakdown.length > 0 ? (
                paymentBreakdown.map((payment, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{getPaymentIcon(payment.payment_type)} {payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)}</span>
                    <span className="font-medium">{payment.percentage.toFixed(1)}%</span>
                    <div className="flex-1 mx-4 h-2 bg-secondary-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${payment.percentage}%`,
                          backgroundColor: getPaymentColor(payment.payment_type)
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-secondary-600">${payment.total_amount.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-400">
                  No payment data available
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};