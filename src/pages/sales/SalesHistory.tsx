import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, DocumentTextIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { saleAPI, reportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface SaleItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

interface Sale {
  id: number;
  sale_number: string;
  customer_name: string;
  customer_id?: number;
  items_count: number;
  subTotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_type: 'cash' | 'card' | 'mobile' | 'credit';
  payment_status: 'completed' | 'pending' | 'refunded';
  cashier_name: string;
  created_at: string;
  items: SaleItem[];
}

export const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [searchTerm, startDate, endDate, selectedPaymentMethod, sales]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await saleAPI.getAll();
      const salesData = response.data.data || [];

      // Formart the sales data
      const formattedSales = salesData.map((sale: any) => ({
        id: sale.id,
        transactionId: sale.sale_number,
        customerName: sale.customer_name  || 'Walk-in Customer',
        customer_id: sale.customer_id, 
        items_count: sale.items_count || 0,
        subtotal: sale.subTotal || sale.total * 0.9, // Assuming tax is 10% if subTotal is not provided
        tax: sale.tax || sale.total * 0.1, // Assuming tax is 10% if tax is not provided
        discount: sale.discount || 0,
        total: sale.total,
        payment_type: sale.payment_type,
        payment_status: sale.payment_status,
        cashier_name: sale.cashier_name,
        created_at: sale.created_at
      }));

      setSales(formattedSales);
      setFilteredSales(formattedSales);
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      showToast(error.response?.data?.message || 'Failed to load sales history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleDetails = async (saleId: number) => {
    try {
      const response = await saleAPI.getOne(saleId);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch sale details:', error);
      return null;
    }
  };

  const filterSales = () => {
    let filtered = [...sales];

    if (searchTerm) {
      filtered = filtered.filter(sale =>
       sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
       sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       sale.cashier_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
      
    if (startDate) {
      filtered = filtered.filter(sale => new Date(sale.created_at) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(sale => new Date(sale.created_at) <= new Date(endDate));
    }

    if (selectedPaymentMethod !== 'all') {
      filtered = filtered.filter(sale => sale.payment_type === selectedPaymentMethod);
    }
    setFilteredSales(filtered);
  };

  const handleViewReceipt = async (sale: Sale) => {
    setSelectedSale(sale);
    setIsReceiptModalOpen(true);

  // Fetch detailed items for the receipt
    const details = await fetchSaleDetails(sale.id);
    if (details && details.items) {
      setSelectedSale(prev => prev ? { ...prev, items: details.items } : prev);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const response = await reportAPI.exportReport(
        'sales',
        startDate || undefined,
        endDate || undefined
      );

      // Create a blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Sales report exported successfully', 'success');
    } catch (error: any) {
      console.error('Export failed:', error);
      showToast(error.response?.data?.message || 'Failed to export sales report', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Get payment method icon based on type
  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      cash: { icon: '💵', color: 'bg-green-100 text-green-800' },
      card: { icon: '💳', color: 'bg-blue-100 text-blue-800' },
      mobile: { icon: '📱', color: 'bg-yellow-100 text-yellow-800' },
      credit: { icon: '📝', color: 'bg-purple-100 text-purple-800' }
    };
    const config = icons[method] || { icon: '💰', color: 'text-gray-600' };
    return <span className={`text-xl ${config.color}`} title={method}>{config.icon}</span>;
  };

  // Get status badge based on payment status
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      completed: { bg: 'bg-success-100', text: 'text-success-700', label: 'Completed' },
      refunded: { bg: 'bg-warning-100', text: 'text-warning-700', label: 'Refunded' },
      pending: { bg: 'bg-secondary-100', text: 'text-secondary-700', label: 'Pending' }
    };
    const { bg, text, label } = config[status] || config.completed;
    return <span className={`px-2 py-1 rounded-full text-xs ${bg} ${text}`}>{label}</span>;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate totals for the summary section
  const calculateTotals = () => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax, 0);
    const totalDiscount = filteredSales.reduce((sum, sale) => sum + sale.discount, 0);
    const averageOrder = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

    return { totalRevenue, totalTax, totalDiscount, averageOrder };
  };

  // Destructure totals for display
  const { totalRevenue, totalTax, totalDiscount, averageOrder } = calculateTotals();

  // Show loading state if data is being fetched
  if (loading && sales.length === 0) {
    return (
      <div className="pt-16 pl-[240px] bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading sales history...</p>
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
            <h1 className="text-2xl font-bold text-secondary-900">Sales History</h1>
            <p className="text-secondary-500 mt-1">View and manage all transactions</p>
          </div>
          <Button
           variant="secondary" 
           icon={<ArrowDownTrayIcon className="w-5 h-5" />} 
           onClick={exportToCSV}
           loading={exporting}>
            Export CSV
          </Button>
        </div>

         {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-success-600">${totalRevenue.toFixed(2)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Total Tax</p>
            <p className="text-2xl font-bold text-secondary-900">${totalTax.toFixed(2)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Total Discounts</p>
            <p className="text-2xl font-bold text-warning-600">${totalDiscount.toFixed(2)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Average Order</p>
            <p className="text-2xl font-bold text-primary-600">${averageOrder.toFixed(2)}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <Input
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                placeholder="Search by invoice #, customer, or cashier"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="date"
                label="From Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="date"
                label="To Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Payment Method</label>
              <select
                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Money</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Sales Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Invoice #</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Customer</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Cashier</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Items</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Total</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Payment</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Date</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-secondary-900">
                        {sale.sale_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{sale.customer_name}</td>
                    <td className="px-6 py-4 text-secondary-600">{sale.cashier_name}</td>
                    <td className="px-6 py-4 text-right text-secondary-600">{sale.items_count} items</td>
                    <td className="px-6 py-4 text-right font-bold text-secondary-900">
                      ${sale.total.toFixed(2)}
                    </td>
                     <td className="px-6 py-4 text-center">
                      {getPaymentMethodIcon(sale.payment_type)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(sale.payment_status)}
                    </td>
                    <td className="px-6 py-4 text-secondary-600 text-sm">
                      {formatDate(sale.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewReceipt(sale)}
                        className="p-1 hover:bg-secondary-100 rounded transition-colors"
                        title="View Receipt"
                      >
                        <EyeIcon className="w-5 h-5 text-primary-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSales.length === 0 && (
              <div className="text-center py-12 text-secondary-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                <p>No sales found</p>
                <p className="text-sm mt-1">Try adjusting your filters or complete a sale first</p>
              </div>
            )}
          </div>
        </Card>

        {/* Receipt Modal */}
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Transaction Receipt"
          size="lg"
        >
          {selectedSale && (
            <div className="space-y-4">
              {/* Receipt Content */}
              <div className="text-center border-b border-secondary-200 pb-4">
                <h2 className="text-xl font-bold text-secondary-900"> POS System</h2>
                <p className="text-sm text-secondary-500">123 Main Street, City</p>
                <p className="text-sm text-secondary-500">Tel: (555) 123-4567</p>
                <p className="text-sm text-secondary-500">Tax ID: 123456789</p>
              </div>

              {/* Transaction Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Invoice Number:</span>
                  <span className="font-mono font-medium">{selectedSale.sale_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Date:</span>
                  <span>{formatDate(selectedSale.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Cashier:</span>
                  <span>{selectedSale.cashier_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Customer:</span>
                  <span>{selectedSale.customer_name}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-secondary-200 pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="text-left py-2">Item</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-secondary-100">
                        <td className="py-2">{item.product_name}</td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">${item.price.toFixed(2)}</td>
                        <td className="text-right py-2">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    {(!selectedSale.items || selectedSale.items.length === 0) && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-secondary-400">
                          No items details available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-secondary-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${selectedSale.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${selectedSale.tax.toFixed(2)}</span>
                </div>
                 {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount:</span>
                    <span>-${selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-secondary-200">
                  <span>Total:</span>
                  <span>${selectedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Payment Method:</span>
                  <span className="capitalize">{selectedSale.payment_type}</span>
                </div>
              </div>

              <div className="text-center text-sm text-secondary-500 pt-4 border-t border-secondary-200">
                <p>Thank you for your business!</p>
                <p>Please come again</p>
                {selectedSale.payment_status === 'completed' && (
                  <p className="text-xs text-success-600 mt-2">✓ Payment Completed</p>
                )}
              </div>

                {/* Action Buttons */}
              <div className="flex justify-center gap-3 mt-4">
                <Button variant="secondary" onClick={() => window.print()}>
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                <Button onClick={() => setIsReceiptModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};